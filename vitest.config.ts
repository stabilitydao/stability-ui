import { getViteConfig } from "astro/config";

export default getViteConfig({
  test: {
    environment: "node",
    testFiles: "**/*.test.ts",
    exclude: ["**/tests/e2e/**", "**/node_modules/**"],
  },
});
