import { getViteConfig } from "astro/config";

export default getViteConfig({
  test: {
    environment: "jsdom",
    testFiles: "**/*.test.ts",
    exclude: [
      "**/tests/e2e/**",
      "**/node_modules/**",
      "**/src/web3/**",
      "**/*.config.*",
      "**/src/store/**",
      "**/src/modules/CreateVault/**",
      "**/src/components/**",
      "**/src/ui/**",
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
        "**/src/store/**",
        "**/src/modules/CreateVault/**",
        "**/src/components/**",
        "**/src/ui/**",
      ],
      include: ["**/*.ts"],
    },
  },
});
