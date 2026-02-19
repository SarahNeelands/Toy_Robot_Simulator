import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["backend/services/tests/**/*.{test,spec}.ts"],
    globals: true,
    clearMocks: true
  }
});