#!/usr/bin/env node

import { execSync } from 'child_process';
import * as fs from 'fs';

// Colors for output
const RED = '\u001b[0;31m';
const GREEN = '\u001b[0;32m';
const YELLOW = '\u001b[1;33m';
const NC = '\u001b[0m';

function printStatus(message: string): void {
}

function printError(message: string): void {
    console.error(`${RED}Error:${NC} ${message}`);
}

function printWarning(message: string): void {
    console.warn(`${YELLOW}Warning:${NC} ${message}`);
}

const libraryName = process.argv[2];

if (!libraryName) {
    printError("Library name is required");
    process.exit(1);
}

const libraryDir = `libs/${libraryName}`;

if (fs.existsSync(libraryDir)) {
    printError(`Library ${libraryName} already exists`);
    process.exit(1);
}

function createDirectoryStructure(): void {
    printStatus(`Creating directory structure for ${libraryName}...`);
    fs.mkdirSync(`${libraryDir}/src`, { recursive: true });
    fs.mkdirSync(`${libraryDir}/tests/unit`, { recursive: true });
    fs.mkdirSync(`${libraryDir}/tests/integration`, { recursive: true });
    fs.writeFileSync(`${libraryDir}/README.md`, '');
    fs.writeFileSync(`${libraryDir}/.npmrc`, '');
}

function createPackageJson(): void {
    printStatus("Creating package.json...");
    const packageJsonContent = `{
  "name": "@maily/${libraryName}",
  "version": "1.0.0",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint . --ext .ts",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@maily/shared-types": "workspace:*"
  },
  "devDependencies": {
    "@types/jest": "29.5.12",
    "@types/node": "20.11.19",
    "jest": "29.7.0",
    "ts-jest": "29.1.2",
    "typescript": "5.3.3"
  }
}
`;
    fs.writeFileSync(`${libraryDir}/package.json`, packageJsonContent);
}

function createTypescriptConfig(): void {
    printStatus("Creating TypeScript configuration...");
    const tsconfigContent = `{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "composite": true,
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
`;
    fs.writeFileSync(`${libraryDir}/tsconfig.json`, tsconfigContent);
}

function createTestSetup(): void {
    printStatus("Creating test setup...");
    const jestConfigContent = `module.exports = {
  ...require('../../config/jest.config'),
  displayName: '${libraryName}'
};
`;
    fs.writeFileSync(`${libraryDir}/jest.config.js`, jestConfigContent);

    const exampleTestContent = `describe('Example Test', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });
});
`;
    fs.writeFileSync(`${libraryDir}/tests/unit/example.test.ts`, exampleTestContent);
}

function createIndexFile(): void {
    printStatus("Creating index file...");
    const indexFileContent = `// Export your library's public API here
export const VERSION = '1.0.0';
`;
    fs.writeFileSync(`${libraryDir}/src/index.ts`, indexFileContent);
}

function createReadme(): void {
    printStatus("Creating README...");
    const readmeContent = `# @maily/${libraryName}

## Description

[Add library description here]

## Installation

This package is part of the Maily monorepo and is installed automatically when running \`pnpm install\` in the root directory.

## Usage

\`\`\`typescript
import { /* exports */ } from '@maily/${libraryName}';

// Add usage examples here
\`\`\`

## API Documentation

[Add API documentation here]

## Development

\`\`\`bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Build
pnpm build
\`\`\`

## Architecture

[Add architecture documentation here]
`;
    fs.writeFileSync(`${libraryDir}/README.md`, readmeContent);
}

function createNpmrc(): void {
    printStatus("Creating .npmrc...");
    const npmrcContent = `public-hoist-pattern[]=*jest*
public-hoist-pattern[]=*eslint*
public-hoist-pattern[]=*prettier*
`;
    fs.writeFileSync(`${libraryDir}/.npmrc`, npmrcContent);
}


function main(): void {
    createDirectoryStructure();
    createPackageJson();
    createTypescriptConfig();
    createTestSetup();
    createIndexFile();
    createReadme();
    createNpmrc();

    printStatus(`Library ${libraryName} created successfully! 🎉`);
    printWarning("Next steps:");
}

main();