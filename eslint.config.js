import typescriptParser from "@typescript-eslint/parser";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import prettierPlugin from "eslint-plugin-prettier";
import eslintPluginAstro from "eslint-plugin-astro";
import astroParser from "astro-eslint-parser";
import reactPlugin from "eslint-plugin-react";

export default [
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "playwright-report/**",
      "public/**",
      "test-results/**",
      "tests/**",
      ".cache-synpress/**",
    ],
  },
  // {
  //   files: ["**/*.astro"],
  //   languageOptions: {
  //     parser: astroParser,
  //     parserOptions: {
  //       extraFileExtensions: [".astro"],
  //       project: "./tsconfig.json",
  //     },
  //   },
  //   plugins: {
  //     astro: eslintPluginAstro,
  //     prettier: prettierPlugin,
  //   },
  //   rules: {
  //     ...eslintPluginAstro.configs.recommended.rules,
  //     "prettier/prettier": "error",
  //   },
  // },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": typescriptPlugin,
      react: reactPlugin,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/explicit-module-boundary-types": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      // "@typescript-eslint/ban-ts-comment": "warn",
      "react/no-unescaped-entities": "off",
      "react/jsx-no-undef": "error",
      "react/jsx-fragments": ["error", "syntax"],

      // "@typescript-eslint/consistent-type-imports": "error",
      // "@typescript-eslint/naming-convention": [
      //   "error",
      //   {
      //     selector: "variable",
      //     format: ["camelCase", "UPPER_CASE"],
      //   },
      //   {
      //     selector: "typeLike",
      //     format: ["PascalCase"],
      //   },
      // ],
    },
  },
];
