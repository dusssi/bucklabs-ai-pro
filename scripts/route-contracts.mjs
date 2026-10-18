import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

// Route-specific SSR contracts, not browser authentication or persistence tests.
export const routeContracts = [
  {
    path: "/",
    title: "BUCKLABS AI — Learn with Direction, Practice with Purpose, Build Career-Ready Skills",
    heading: "LEARN WITH DIRECTION. PRACTICE WITH PURPOSE. BUILD CAREER-READY SKILLS.",
    links: ["/learning", "/practice", "/courses"],
  },
  {
    path: "/about",
    title: "About — BUCKLABS AI",
    heading: "Built for learners who want direction, practice, and measurable progress.",
    links: ["/learning", "/practice"],
  },
  {
    path: "/privacy",
    title: "Privacy Policy — BUCKLABS AI",
    heading: "Privacy Policy",
    text: ["How We Protect Your Data"],
  },
  {
    path: "/terms",
    title: "Terms of Service — BUCKLABS AI",
    heading: "Terms of Service",
    text: ["Third-Party Problem Sources & Attribution"],
  },
  {
    path: "/contact",
    title: "Contact & Beta Feedback — BUCKLABS AI",
    heading: "Get in touch.",
    fields: ["name", "email", "topic", "message", "honeypot"],
  },
  {
    path: "/login",
    title: "Sign in — BUCKLABS AI",
    heading: "Welcome back.",
    fields: ["email", "password"],
    links: ["/forgot-password", "/register"],
  },
  {
    path: "/register",
    title: "Create Account — BUCKLABS AI",
    heading: "Create your account.",
    fields: ["fullName", "email", "password", "confirmPassword"],
  },
  {
    path: "/forgot-password",
    title: "Reset Password — BUCKLABS AI",
    heading: "Forgot password?",
    fields: ["email"],
  },
  {
    path: "/reset-password",
    title: "Set New Password — BUCKLABS AI",
    heading: "Set a new password.",
    fields: ["password", "confirm"],
  },
  { path: "/profile", title: "Learner Profile & Onboarding — BUCKLABS AI", privateShell: true },
  { path: "/dashboard", title: "Learner Dashboard — BUCKLABS AI", privateShell: true },
  {
    path: "/learning",
    title: "Learning Paths — BUCKLABS AI",
    heading: "Structured Learning Paths",
    links: ["/learning/dsa-interview-mastery"],
  },
  {
    path: "/learning/dsa-interview-mastery",
    title: "DSA & Technical Interview Mastery — BUCKLABS AI",
    heading: "DSA & Technical Interview Mastery",
    links: ["/courses/python-programming-foundations"],
  },
  {
    path: "/courses",
    title: "Courses — BUCKLABS AI",
    heading: "All Courses",
    links: ["/courses/python-programming-foundations"],
    selectors: ['input[type="search"]'],
  },
  {
    path: "/courses/python-programming-foundations",
    title: "Python & Programming Fundamentals — BUCKLABS AI",
    heading: "Python & Programming Fundamentals",
    text: ["Verified Learning Outcomes"],
    links: ["/learning/dsa-interview-mastery"],
  },
  {
    path: "/practice",
    title: "Coding Practice Catalogue — BUCKLABS AI",
    heading: "Coding Practice Platform",
    links: ["/practice/two-sum-lookup"],
    selectors: ['input[type="search"]'],
  },
  {
    path: "/practice/two-sum-lookup",
    title: "Two Sum — Coding Practice — BUCKLABS AI",
    heading: "Two Sum",
    links: ["https://leetcode.com/problems/two-sum/"],
    text: ["Track Your Practice Status"],
  },
  {
    path: "/ai-tutor",
    title: "AI Practice & Concept Tutor — BUCKLABS AI",
    heading: "AI Practice & Concept Tutor",
    text: ["Deterministic Curriculum Engine"],
    selectors: ["textarea", '[aria-label="AI assistance mode"]'],
  },
  {
    path: "/career",
    title: "Career Preparation & Skill-Gap Analyzer — BUCKLABS AI",
    heading: "Career Preparation & Skill-Gap Lab",
    text: ["Deterministic Rubric Engine (Beta)"],
    selectors: ['input[type="file"]', "textarea"],
  },
];

const normalize = (text) => text.replace(/\s+/g, " ").trim();

export function verifyRouteHtml(contract, html) {
  const dom = new JSDOM(html); // Scripts/resources are NOT executed or loaded.
  try {
    const doc = dom.window.document;
    assert.equal(doc.title, contract.title, `Wrong title for ${contract.path}`);
    doc.querySelectorAll("script, style").forEach((node) => node.remove());
    const text = normalize(doc.body.textContent ?? "");
    assert(
      !/Page Not Found|Something went wrong|Internal Server Error/i.test(text),
      "Error shell rendered",
    );
    if (contract.heading) {
      assert.equal(
        normalize(doc.querySelector("h1")?.textContent ?? ""),
        contract.heading,
        `Wrong heading for ${contract.path}`,
      );
    }
    for (const field of contract.fields ?? []) {
      assert(
        doc.querySelector(`form [name="${field}"]`),
        `Missing form field ${field} on ${contract.path}`,
      );
    }
    for (const href of contract.links ?? []) {
      assert(
        [...doc.querySelectorAll("a[href]")].some((link) => link.getAttribute("href") === href),
        `Missing link on ${contract.path}`,
      );
    }
    for (const selector of contract.selectors ?? []) {
      assert(doc.querySelector(selector), `Missing control on ${contract.path}`);
    }
    for (const expected of contract.text ?? []) {
      assert(text.includes(expected), `Missing content/disclosure on ${contract.path}`);
    }
    if (contract.privateShell) {
      // Both routes defer auth checks to hydration. SSR must render only a skeleton.
      assert(doc.querySelector("main .animate-pulse"), "Private SSR loading shell is missing");
      assert(
        !doc.querySelector("main form, main input, main textarea"),
        "Private editor rendered during SSR",
      );
      assert(
        !/Signed in as|Courses Enrolled|Recent Activity|Personalize Your Learning Path/.test(text),
        "Private workspace rendered during anonymous SSR",
      );
    }
  } finally {
    dom.window.close();
  }
}
