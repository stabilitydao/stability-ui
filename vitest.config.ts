import { getViteConfig } from "astro/config";

export default getViteConfig({
  test: {
    environment: "node",
    testFiles: "**/*.test.ts",
    exclude: [
      "**/tests/e2e/**",
      "**/node_modules/**",
      "**/src/web3/**",
      "**/*.config.*",
    ],
    coverage: {
      provider: "v8",
      exclude: [
        "**/src/web3/**",
        "**/tests/**",
        "**/node_modules/**",
        "**/wallet-setup/**",
        "**public/**",
        "**/*.config.*",
      ],
    },
  },
});
