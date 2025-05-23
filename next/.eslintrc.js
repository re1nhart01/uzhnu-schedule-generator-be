module.exports = {
  extends: [
    "plugin:@typescript-eslint/recommended",
    "next/core-web-vitals",
    "next",
    "plugin:prettier/recommended",
    "plugin:storybook/recommended",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "simple-import-sort"],
  ignorePatterns: ["**/*/generated/*"],
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      rules: {
        "prettier/prettier": [
          "error",
          {
            endOfLine: "auto",
            bracketLine: true,
          },
        ],
        "typescript-eslint/no-explicit-any": "off",
        "react/display-name": "off",
        "no-undef": "off",
        "no-shadow": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/no-require-imports": "off",
        "react/react-in-jsx-scope": "off",
        "@typescript-eslint/no-shadow": ["off"],
        "@typescript-eslint/no-empty-interface": "off",
        "@typescript-eslint/no-unsafe-declaration-merging": "off",
        quotes: ["error", "double"],
        "simple-import-sort/imports": [
          "error",
          {
            groups: [["^@?\\w"], [`^(${importsAliasesRegexValue})(/.*|$)`]],
          },
        ],
        "simple-import-sort/exports": "error",
        "react/jsx-curly-brace-presence": ["error", { props: "never" }],
      },
    },
  ],
};
