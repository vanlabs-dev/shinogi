import { defineConfig } from "astro/config";

// Static output only. No adapter, no server code, no client framework.
export default defineConfig({
  output: "static",
  site: "https://subnt.dev",
  outDir: process.env.SUBNT_OUT || "dist",
  build: { inlineStylesheets: "always", format: "file" },
  compressHTML: true,
  devToolbar: { enabled: false },
  prefetch: false,
});
