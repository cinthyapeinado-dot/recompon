import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  appType: "spa",
  plugins: [react()],
  server: {
    host: true
  },
  preview: {
    host: true
  },
  build: {
    assetsDir: "assets",
    outDir: "dist",
    target: "es2020"
  }
});
