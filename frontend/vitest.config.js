import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

/**
 * Test config is kept separate from vite.config.js so the test run doesn't
 * drag in the PWA plugin (which would try to generate a service worker) or
 * the Tailwind plugin (irrelevant to behaviour, slow to boot).
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.js"],
    css: false,
    include: ["src/**/*.{test,spec}.{js,jsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.{js,jsx}"],
      exclude: [
        "src/test/**",
        "src/**/*.test.{js,jsx}",
        // Pure visual layers: 3D scenes, particle fields and cinematics have
        // no logic worth asserting and would only inflate the numbers.
        "src/components/background/**",
        "src/components/cinematic/**",
        "src/main.jsx",
      ],
    },
  },
});
