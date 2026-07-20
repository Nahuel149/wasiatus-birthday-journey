import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./src/test/setup.ts"],
    restoreMocks: true,
    coverage: {
      reporter: ["text", "html"],
      exclude: ["src/**/*.d.ts", "src/main.tsx"],
    },
  },
});
