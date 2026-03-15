import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        '/api/cr': {
          target: 'https://proxy.royaleapi.dev/v1',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/cr/, ''),
          secure: true,
          headers: {
            Authorization: `Bearer ${env.CR_API_KEY}`,
          },
        },
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});