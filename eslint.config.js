import js from "@eslint/js";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";
import securityPlugin from "eslint-plugin-security";
import prettier from "eslint-plugin-prettier";

export default tseslint.config(
  {
    ignores: ["dist", "node_modules", "build", "coverage", ".prettierrc.js"],
  },
  {
    files: ["**/*.{js,ts,jsx,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tseslint.parser,
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      import: importPlugin,
      security: securityPlugin,
      prettier: prettier,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      "no-unused-vars": "off",
      "no-undef": "off",
      "prefer-const": "error",
      "no-console": ["warn"],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
    },
  }
);
