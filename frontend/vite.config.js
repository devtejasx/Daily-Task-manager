import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // honor the PORT env var (set by the dev-server launcher), default 5173
    port: Number(process.env.PORT) || 5173,
  },
});
