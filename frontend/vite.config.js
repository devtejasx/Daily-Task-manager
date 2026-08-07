import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "prompt", // never swap the app out from under a hunter mid-mission
      includeAssets: ["icons/apple-touch-icon.png"],
      manifest: {
        name: "ARISE — Hunter Command Center",
        short_name: "ARISE",
        description:
          "Gamified daily task manager: missions, habits, streaks and XP, Solo-Leveling style.",
        theme_color: "#05070f",
        background_color: "#05070f",
        display: "standalone",
        orientation: "any",
        start_url: "/dashboard",
        scope: "/",
        categories: ["productivity", "lifestyle"],
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          {
            src: "/icons/icon-192-maskable.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/icons/icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        shortcuts: [
          { name: "Mission Board", url: "/tasks" },
          { name: "Habits", url: "/habits" },
          { name: "Analytics", url: "/analytics" },
        ],
      },
      workbox: {
        // The 3D background and Firebase SDK push the bundle past the default cap.
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        globPatterns: ["**/*.{js,css,html,png,svg,woff2}"],
        navigateFallback: "/index.html",
        // Firestore must never be served from cache — it has its own offline
        // persistence and a stale save would silently overwrite real progress.
        navigateFallbackDenylist: [/^\/__/, /firestore/],
        runtimeCaching: [
          {
            // Google Fonts stylesheets: fresh when online, instant when not.
            urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
            handler: "StaleWhileRevalidate",
            options: { cacheName: "google-fonts-styles" },
          },
          {
            // The font files themselves are immutable — cache them for a year.
            urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-files",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  server: {
    // honor the PORT env var (set by the dev-server launcher), default 5173
    port: Number(process.env.PORT) || 5173,
  },
  build: {
    rollupOptions: {
      output: {
        /**
         * Split the heavy third-party libraries into their own long-lived
         * chunks. They change far less often than app code, so a hunter who
         * already has them cached only re-downloads what actually changed.
         */
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("three") || id.includes("@react-three")) return "vendor-three";
          if (id.includes("recharts") || id.includes("d3-")) return "vendor-charts";
          if (id.includes("firebase") || id.includes("@firebase")) return "vendor-firebase";
          if (id.includes("framer-motion") || id.includes("gsap")) return "vendor-motion";
          if (id.includes("@dnd-kit")) return "vendor-dnd";
          if (id.includes("react-router")) return "vendor-router";
          return "vendor";
        },
      },
    },
    // The 3D battlefield background is genuinely large; warn above it instead
    // of on every build.
    chunkSizeWarningLimit: 900,
  },
});
