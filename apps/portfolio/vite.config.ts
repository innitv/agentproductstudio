import { copyFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const appDir = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(appDir, "../../dist/portfolio");

function portfolioProductionHints() {
  return {
    name: "portfolio-production-hints",
    transformIndexHtml() {
      return [
        {
          tag: "link",
          attrs: { rel: "dns-prefetch", href: "https://framerusercontent.com" },
          injectTo: "head-prepend" as const,
        },
        {
          tag: "link",
          attrs: { rel: "preconnect", href: "https://framerusercontent.com", crossorigin: "" },
          injectTo: "head-prepend" as const,
        },
      ];
    },
    closeBundle() {
      mkdirSync(outDir, { recursive: true });
      copyFileSync(path.join(appDir, "public", ".htaccess"), path.join(outDir, ".htaccess"));
    },
  };
}

export default defineConfig({
  root: appDir,
  plugins: [react(), portfolioProductionHints()],
  resolve: {
    alias: {
      "@siteportfolio": path.resolve(appDir, "../../siteportfolio/src"),
    },
  },
  define: {
    "import.meta.env.VITE_PORTFOLIO_BASE_PATH": JSON.stringify("/"),
  },
  build: {
    outDir,
    emptyOutDir: true,
  },
});
