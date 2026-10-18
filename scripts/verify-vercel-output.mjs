import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { JSDOM } from "jsdom";
import { createClientRpc } from "@tanstack/react-start/client-rpc";
import { routeContracts, verifyRouteHtml } from "./route-contracts.mjs";

// Run after `bun run build`. No credentials, external requests, or database writes.
// This proves packaging and local SSR rendering, not production workflow health.
const output = resolve(".vercel/output");
const manifest = JSON.parse(readFileSync(resolve(output, "config.json"), "utf8"));
assert.equal(manifest.version, 3, "Vercel Build Output API version must be 3");
assert(manifest.routes.some((route) => route.handle === "filesystem"));
assert(
  manifest.routes.some((route) => route.src === "/(.*)" && route.dest === "/__server"),
  "SSR catch-all route is missing",
);
const expectedHeaders = JSON.parse(readFileSync(resolve("vercel.json"), "utf8")).headers[0].headers;
const headerRuleIndex = manifest.routes.findIndex(
  (route) => route.src === "/(.*)" && route.headers,
);
assert(headerRuleIndex >= 0, "Global security headers missing from generated manifest");
assert(
  headerRuleIndex < manifest.routes.findIndex((route) => route.handle === "filesystem"),
  "Headers must apply before static-file routing",
);
for (const { key, value } of expectedHeaders) {
  const entries = Object.entries(manifest.routes[headerRuleIndex].headers);
  assert(
    entries.some(([name, actual]) => name.toLowerCase() === key.toLowerCase() && actual === value),
    "Security header differs between Vercel config and generated output",
  );
}
const functionDir = resolve(output, "functions/__server.func");
const config = JSON.parse(readFileSync(resolve(functionDir, ".vc-config.json"), "utf8"));
assert.match(config.runtime, /^nodejs(?:22|24)\.x$/);
assert(existsSync(resolve(functionDir, config.handler)), "SSR function entry is missing");
const assets = resolve(output, "static/assets");
const assetFiles = readdirSync(assets);
assert(
  assetFiles.some((name) => name.endsWith(".css")),
  "Client CSS is missing",
);
assert(
  assetFiles.some((name) => name.endsWith(".js")),
  "Client JavaScript is missing",
);
for (const name of assetFiles.filter((file) => /\.(?:js|css)$/.test(file))) {
  const content = readFileSync(resolve(assets, name), "utf8");
  assert(
    !/SUPABASE_SERVICE_ROLE_KEY|OPENAI_API_KEY|sb_secret_[A-Za-z0-9_-]+/.test(content),
    "Privileged credential reference found in client assets (content withheld)",
  );
}
console.log("PASS: Vercel manifest, Node SSR function, client assets, privileged-reference scan");

// Exercise the actual generated Vercel entry through its Web Request interface.
// Stub transport to prevent accidental external access even if the shell has env vars.
let blockedTransportCalls = 0;
globalThis.fetch = async () => {
  blockedTransportCalls++;
  throw new TypeError("fetch failed: offline SSR packaging verification");
};
process.env.NODE_ENV = "production";
process.env.VITE_ENABLE_LOCAL_FALLBACK = "false";
const { default: server } = await import(pathToFileURL(resolve(functionDir, config.handler)).href);
for (const contract of routeContracts) {
  const response = await server.fetch(
    new Request(`https://deployment-test.invalid${contract.path}`),
    {},
  );
  assert.equal(response.status, 200, `SSR status check failed for ${contract.path}`);
  assert.match(response.headers.get("content-type") ?? "", /text\/html/);
  for (const { key, value } of expectedHeaders) {
    assert.equal(
      response.headers.get(key),
      value,
      `Missing SSR security header on ${contract.path}`,
    );
  }
  const html = await response.text();
  verifyRouteHtml(contract, html);
  const dom = new JSDOM(html);
  try {
    for (const element of dom.window.document.querySelectorAll("script[src], link[href]")) {
      const url = new URL(
        element.getAttribute("src") ?? element.getAttribute("href"),
        "https://deployment-test.invalid",
      );
      if (url.pathname.startsWith("/assets/")) {
        assert(
          existsSync(resolve(output, "static", `.${url.pathname}`)),
          `Referenced client asset missing on ${contract.path}`,
        );
      }
    }
  } finally {
    dom.window.close();
  }
}
console.log(
  `PASS: ${routeContracts.length} route-specific SSR contracts and referenced assets (two private routes check loading shells only)`,
);

for (const path of [
  "/courses/not-a-real-course",
  "/learning/not-a-real-path",
  "/practice/not-a-real-problem",
]) {
  const response = await server.fetch(new Request(`https://deployment-test.invalid${path}`), {});
  assert.equal(response.status, 404, `Missing catalog record must return 404: ${path}`);
}
console.log("PASS: three missing catalog records return 404");

// Discover generated IDs, never hardcode IDs from an earlier build.
const serverCode = readdirSync(resolve(functionDir, "_ssr"))
  .filter((file) => file.endsWith(".mjs"))
  .map((file) => readFileSync(resolve(functionDir, "_ssr", file), "utf8"))
  .join("\n");
const rpcIds = new Map(
  [
    ...serverCode.matchAll(/"([a-f0-9]{64})": \{\s*functionName: "(\w+)_createServerFn_handler"/g),
  ].map((match) => [match[2], match[1]]),
);
const protectedFunctions = [
  "getVerifiedSessionServerFn",
  "saveLearnerProfileServerFn",
  "enrollCourseProtectedServerFn",
  "savePracticeAttemptProtectedServerFn",
];
const publicFunctions = [
  "submitContactServerFn",
  "subscribeNewsletterServerFn",
  "askAiTutorServerFn",
];
// No production credentials: only syntactically valid configuration for offline auth rejection.
process.env.SUPABASE_URL = "https://deployment-test.invalid";
process.env.SUPABASE_PUBLISHABLE_KEY = "offline-verification-placeholder";
process.env.TSS_SERVER_FN_BASE = "/_serverFn/";
const localRpcFetch = (url, options) => {
  const target = new URL(url, "https://deployment-test.invalid");
  assert.equal(target.origin, "https://deployment-test.invalid");
  assert(target.pathname.startsWith("/_serverFn/"));
  return server.fetch(new Request(target, options), {});
};
for (const name of [...protectedFunctions, ...publicFunctions]) {
  const id = rpcIds.get(name);
  assert(id, `Generated server function missing: ${name}`);
  const method = name === "getVerifiedSessionServerFn" ? "GET" : "POST";
  if (protectedFunctions.includes(name)) {
    for (const authorization of [null, "Bearer short"]) {
      const response = await createClientRpc(id)({
        method,
        headers: authorization ? { authorization } : {},
        fetch: localRpcFetch,
      });
      assert(
        response.error instanceof Error,
        `RPC must reject instead of returning success: ${name}`,
      );
      assert.equal(response.result, undefined);
      assert.match(
        response.error.message,
        authorization
          ? /Unauthorized: Malformed bearer token/
          : /Unauthorized: No authorization header/,
      );
    }
  }
  if (publicFunctions.includes(name)) {
    const response = await createClientRpc(id)({ method, fetch: localRpcFetch });
    assert(response.error instanceof Error, `Missing payload must fail validation: ${name}`);
    assert.equal(response.result, undefined);
    assert.match(response.error.message, /invalid_type/);
  }
  if (method === "POST") {
    const response = await server.fetch(
      new Request(`https://deployment-test.invalid/_serverFn/${id}`),
      {},
    );
    assert.equal(response.status, 405, `Wrong RPC method accepted: ${name}`);
    assert.equal(response.headers.get("allow"), "POST");
  }
}
console.log(
  "PASS: seven generated RPC registrations, six method guards, eight protected missing/malformed-auth rejections",
);
const tutor = await createClientRpc(rpcIds.get("askAiTutorServerFn"))({
  method: "POST",
  data: {
    mode: "hint",
    topic: "Arrays",
    language: "Python",
    problemId: "two-sum-lookup",
    userQuestion: "How should I use a hash map?",
  },
  fetch: localRpcFetch,
});
assert.equal(tutor.error, undefined);
assert.equal(tutor.result.generationEngine, "deterministic_beta_engine");
assert.match(tutor.result.engineBadge, /Rule-Based/);
assert(tutor.result.guidanceSteps.length > 0);
assert.equal(blockedTransportCalls, 0, "Packaging verifier attempted an external request");
console.log(
  "PASS: three public RPC input validations and a deterministic Tutor RPC round-trip using the real client serializer; zero external requests",
);
console.log(
  "LIMITATION: no browser hydration, valid-session RPC, live Supabase writes, email, or two-user RLS testing",
);
