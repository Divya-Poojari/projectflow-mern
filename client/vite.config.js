
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            console.log(`[Vite proxy] ${req.method} ${req.url} -> ${proxyReq.path}`);
          });
          proxy.on("proxyRes", (proxyRes, req) => {
            console.log(`[Vite proxy response] ${req.method} ${req.url} -> ${proxyRes.statusCode}`);
          });
          proxy.on("error", (err, req) => {
            console.error(`[Vite proxy error] ${req.method} ${req.url}: ${err.message}`);
          });
        }
      }
    }
  }
});
