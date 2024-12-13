import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Edubrain Prototype",
        short_name: "Edubrain",
        description: "Weather forecast information",
        icons: [
          {
            src: "/icons/main-logo.png",
            sizes: "512x512",
            type: "image/svg+xml",
          },
          {
            src: "/icons/main-logo.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/main-logo.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
        start_url: "/dashboard",
        background_color: "#FOFAFF",
        theme_color: "#FOFAFF",
        display: "standalone",
        scope: "/",
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
