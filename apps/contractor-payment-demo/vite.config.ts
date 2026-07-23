import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const appDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: appDir,
  base: "./",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@demo": path.resolve(appDir, "./src"),
    },
  },
  build: {
    outDir: "../../dist/contractor-payment-demo",
    emptyOutDir: true,
  },
});
