import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: "globalThis",
  },
  optimizeDeps: {
    exclude: ["@opencode-ai/sdk"],
  },
  build: {
    rollupOptions: {
      external: [
        "node:child_process",
        "node:fs",
        "node:path",
        "node:os",
        "node:crypto",
        "node:util",
      ],
    },
  },
  resolve: {
    alias: {
      "node:child_process": "null",
      "node:fs": "null",
      "node:path": "null",
      "node:os": "null",
      "node:crypto": "null",
      "node:util": "null",
    },
  },
  server: {
    fs: {
      allow: [".."],
    },
  },
});
