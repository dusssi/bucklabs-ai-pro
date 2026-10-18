import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

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
globalThis.fetch = async () => {
  throw new TypeError("fetch failed: offline SSR packaging verification");
};
process.env.NODE_ENV = "production";
process.env.VITE_ENABLE_LOCAL_FALLBACK = "false";
const { default: server } = await import(pathToFileURL(resolve(functionDir, config.handler)).href);
const routes = [
  "/",
  "/about",
  "/privacy",
  "/terms",
  "/contact",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/profile",
  "/dashboard",
  "/learning",
  "/learning/dsa-interview-mastery",
  "/courses",
  "/courses/python-programming-foundations",
  "/practice",
  "/practice/two-sum-lookup",
  "/ai-tutor",
  "/career",
];
for (const route of routes) {
  const response = await server.fetch(new Request(`https://deployment-test.invalid${route}`), {});
  assert.equal(response.status, 200, `SSR status check failed for ${route}`);
  assert.match(response.headers.get("content-type") ?? "", /text\/html/);
  assert.match(await response.text(), /BUCKLABS/i, `SSR HTML is missing for ${route}`);
}
console.log(`PASS: ${routes.length} local SSR HTML routes; no live workflow verification implied`);
