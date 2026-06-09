// Base flat ESLint config for the monorepo. Package-level eslint.config.js files
// import and extend this (frontend adds React rules). backend/ (Deno) is linted
// by its own toolchain, not this Node config.
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: [
      "**/dist/**",
      "**/build/**",
      "**/node_modules/**",
      "**/.turbo/**",
      "**/.vite/**",
      "backend/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // R7: no console.log in committed code (warn/error allowed for real diagnostics).
      "no-console": ["error", { allow: ["warn", "error"] }],
      // R12: no `any`.
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  prettier,
);
