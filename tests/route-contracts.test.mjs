import { describe, expect, it } from "vitest";
import { routeContracts, verifyRouteHtml } from "../scripts/route-contracts.mjs";

const login = routeContracts.find((route) => route.path === "/login");
const loginHtml = `<html><head><title>${login.title}</title></head><body>
<h1>Welcome back.</h1><form><input name="email"><input name="password"></form>
<a href="/forgot-password">Recover</a><a href="/register">Register</a></body></html>`;

describe("SSR verifier false-positive prevention", () => {
  it("has 19 distinct contracts and explicitly labels the two private shells", () => {
    expect(new Set(routeContracts.map((route) => route.path)).size).toBe(19);
    expect(routeContracts.filter((route) => route.privateShell).map((route) => route.path)).toEqual(
      ["/profile", "/dashboard"],
    );
  });
  it("accepts the expected login form", () => {
    expect(() => verifyRouteHtml(login, loginHtml)).not.toThrow();
  });
  it("rejects a generic HTTP-200 branded shell", () => {
    expect(() => verifyRouteHtml(login, "<title>BUCKLABS AI</title><h1>BUCKLABS</h1>")).toThrow();
  });
  it("rejects a wrong route even if its title is correct", () => {
    expect(() =>
      verifyRouteHtml(login, loginHtml.replace("Welcome back.", "Page Not Found")),
    ).toThrow();
  });
  it("rejects missing form fields instead of accepting script-embedded text", () => {
    const html = loginHtml.replace(
      '<input name="password">',
      '<script>"input name=password"</script>',
    );
    expect(() => verifyRouteHtml(login, html)).toThrow(/Missing form field/);
  });
  it("rejects a broken navigation link", () => {
    expect(() =>
      verifyRouteHtml(login, loginHtml.replace('href="/forgot-password"', 'href="/wrong"')),
    ).toThrow(/Missing link/);
  });
  it("does not count deterministic disclosure present only in a script", () => {
    const career = routeContracts.find((route) => route.path === "/career");
    const html = `<title>${career.title}</title><h1>${career.heading}</h1><input type="file"><textarea></textarea><script>Deterministic Rubric Engine (Beta)</script>`;
    expect(() => verifyRouteHtml(career, html)).toThrow(/Missing content\/disclosure/);
  });
  it("rejects a private editor rendered in the anonymous loading shell", () => {
    const profile = routeContracts.find((route) => route.path === "/profile");
    const html = `<title>${profile.title}</title><main><div class="animate-pulse"></div><form><input></form></main>`;
    expect(() => verifyRouteHtml(profile, html)).toThrow(/Private editor/);
  });
});
