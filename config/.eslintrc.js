module.exports = {
  parser: '@typescript-eslint/parser',
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'error',
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        trailingComma: 'all',
        tabWidth: 2,
        semi: true,
      },
    ],
    // Additional production-level rules can be added here
  },
};
