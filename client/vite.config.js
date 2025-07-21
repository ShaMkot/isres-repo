import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",  // غيّر حسب سيرفرك
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return id
              .toString()
              .split("node_modules/")[1]
              .split("/")[0]
              .toString();
          }
        },
      },
      plugins: [
        visualizer({
          filename: "./dist/bundle-stats.html",  // ملف التقرير
          open: true,                            // يفتح التقرير تلقائياً بعد البناء
          gzipSize: true,
          brotliSize: true,
        }),
      ],
    },
  },
});
