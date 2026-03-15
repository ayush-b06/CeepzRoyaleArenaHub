import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Proxies /api/cr/* → https://api.clashroyale.com/v1/*
      // This bypasses CORS in local dev — in production point VITE_CR_API_BASE
      // at your own server-side proxy (e.g. a Cloudflare Worker or small Express app).
      '/api/cr': {
        target: 'https://api.clashroyale.com/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/cr/, ''),
        secure: true,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
