import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  base: "/fabrica/sistemas/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "es2022",
    cssMinify: true,
    minify: "esbuild",
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("lucide-react") || id.includes("recharts") || id.includes("jspdf") || id.includes("html2canvas")) {
              return "vendor-heavy";
            }
            return "vendor";
          }
          if (id.includes("src/data/mock")) {
            return "mock-data";
          }
        }
      }
    }
  }
})
