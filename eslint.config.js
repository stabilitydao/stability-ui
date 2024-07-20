import typescriptParser from "@typescript-eslint/parser";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import prettierPlugin from "eslint-plugin-prettier";
import astroParser from "astro-eslint-parser";

export default [
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "playwright-report/**",
      "public/**",
      "test-results/**",
      "tests/**",
    ],
  },
  {
    files: ["**/*.astro"],
    languageOptions: {
      parser: astroParser,
      parserOptions: {
        extraFileExtensions: [".astro"],
        project: "./tsconfig.json",
      },
    },
    plugins: {
      astro: eslintPluginAstro,
      prettier: prettierPlugin,
    },
    rules: {
      ...eslintPluginAstro.configs.recommended.rules,
      "prettier/prettier": "error",
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": typescriptPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "prettier/prettier": "error",
    },
  },
];
