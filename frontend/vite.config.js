import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
