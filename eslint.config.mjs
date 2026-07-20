import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * Kora ships editorial prose in JSX (`Ana wrote the brief...`) so the
 * `react/no-unescaped-entities` rule is noise here. We disable it once at
 * the config layer rather than littering every page with `&apos;`.
 */
const editorialOverrides = {
  rules: {
    "react/no-unescaped-entities": "off",
  },
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  editorialOverrides,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
