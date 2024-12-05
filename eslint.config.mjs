import globals from "globals";
import pluginJs from "@eslint/js";
import prettier from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        ...globals.node,
        ...globals.jest, // Tambahkan Jest globals di sini
      },
    },
    rules: {
      "prettier/prettier": ["error", {
        "singleQuote": true,
        "semi": true,
        "tabWidth": 2,
        "trailingComma": "es5",
        "printWidth": 80,
        "endOfLine": "auto",
      }],
    },
  },
  pluginJs.configs.recommended,
  prettierConfig,
  {
    plugins: {
      prettier,
    },
  },
];
