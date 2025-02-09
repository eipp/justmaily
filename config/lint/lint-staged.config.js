module.exports = {
  // TypeScript files
  '**/*.ts?(x)': [
    'eslint --fix',
    'prettier --write',
    () => 'tsc -p tsconfig.json --noEmit',
    'jest --bail --findRelatedTests'
  ],

  // JavaScript files
  '**/*.js?(x)': ['eslint --fix', 'prettier --write', 'jest --bail --findRelatedTests'],

  // JSON files
  '**/*.json': ['prettier --write'],

  // Markdown files
  '**/*.md': ['prettier --write'],

  // Shell scripts
  '**/*.sh': ['shellcheck'],

  // Environment files
  '**/*.env.*': ['secretlint']
};
