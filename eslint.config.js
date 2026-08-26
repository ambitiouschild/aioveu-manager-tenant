import js from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import globals from "globals";

export default [
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "unpackage/**",
      "public/**",
      "static/**",
      "**/u-charts/**",
      "**/qiun-/**",
      "**/auto-imports.d.ts",
      "src/types/auto-imports.d.ts",
      "src/packageA/components/uni-icons/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs["flat/recommended"],
  {
    files: ["**/*.js", "**/*.mjs", "**/*.cjs", "**/*.ts", "**/*.vue"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "vue/no-unused-components": "off",
      "prettier/prettier": "off",
    },
  },
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: pluginVue.parser,
    },
  },
];
