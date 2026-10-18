import { defineConfig } from "nitro/config";

export default defineConfig({
  // Preserve the vercel.json security headers in the self-contained Build Output
  // API manifest too, including static assets and server-function responses.
  routeRules: {
    "/**": {
      headers: {
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
    },
  },
});
