import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const disablePreviewHmrClient = {
  name: "disable-preview-hmr-client",
  enforce: "post",
  transformIndexHtml(html) {
    return html.replace(/\s*<script[^>]*src=["']\/@vite\/client["'][^>]*><\/script>/, "");
  },
};

export default defineConfig({
  plugins: [react(), tailwindcss(), disablePreviewHmrClient],
  resolve: {
    alias: {
      react: path.resolve(projectRoot, "node_modules/react"),
      "react-dom": path.resolve(projectRoot, "node_modules/react-dom"),
    },
    dedupe: ["react", "react-dom", "react-router", "react-router-dom"],
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router", "react-router-dom"],
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    // The hosted preview proxy does not expose Vite's raw HMR socket.
    hmr: false,
  },
});
