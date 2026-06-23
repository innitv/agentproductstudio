import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const appDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: appDir,
  plugins: [react()],
  resolve: {
    alias: {
      "@siteportfolio": path.resolve(appDir, "../../siteportfolio/src"),
    },
  },
  define: {
    "import.meta.env.VITE_PORTFOLIO_BASE_PATH": JSON.stringify("/"),
  },
  build: {
    outDir: "../../dist/portfolio",
    emptyOutDir: true,
  },
});
