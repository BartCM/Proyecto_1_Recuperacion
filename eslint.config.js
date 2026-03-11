import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: ["dist/**"],
  },

  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: globals.browser,
    },
    ...js.configs.recommended,
    rules: {
      camelcase: "error",
      curly: "error",
      eqeqeq: "error",
    },
  },

  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ["**/*.ts"],
    languageOptions: {
      ...config.languageOptions,
      globals: globals.browser,
    },
    rules: {
      ...config.rules,
      camelcase: "error",
      curly: "error",
      eqeqeq: "error",
    },
  })),

  {
    files: ["vite.config.js", "eslint.config.js"],
    languageOptions: {
      globals: globals.node,
    },
  },
]);
