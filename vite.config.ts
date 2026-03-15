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
      // /api/cr/* → https://api.clashroyale.com/v1/* (bypasses browser CORS in dev)
      // In production, set VITE_CR_API_BASE to your own CORS-enabled proxy URL.
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
