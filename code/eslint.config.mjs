import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname
});

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      ".pnpm-store/**",
      "coverage/**",
      "desktop/dist/**",
      "desktop-build/**",
      "next-env.d.ts",
      "node_modules/**",
      "out/**",
      "public/static-runtime/**",
      "release/**"
    ]
  },
  ...compat.extends("next/core-web-vitals", "next/typescript")
];

export default eslintConfig;
