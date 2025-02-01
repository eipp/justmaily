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

const serviceName = process.argv[2];

if (!serviceName) {
    printError("Service name is required");
    process.exit(1);
}

const serviceDir = `apps/${serviceName}`;

if (fs.existsSync(serviceDir)) {
    printError(`Service ${serviceName} already exists`);
    process.exit(1);
}

function createDirectoryStructure(): void {
    printStatus(`Creating directory structure for ${serviceName}...`);
    fs.mkdirSync(`${serviceDir}/src/controllers`, { recursive: true });
    fs.mkdirSync(`${serviceDir}/src/services`, { recursive: true });
    fs.mkdirSync(`${serviceDir}/src/routes`, { recursive: true });
    fs.mkdirSync(`${serviceDir}/src/models`, { recursive: true });
    fs.mkdirSync(`${serviceDir}/src/utils`, { recursive: true });
    fs.mkdirSync(`${serviceDir}/src/config`, { recursive: true });
    fs.mkdirSync(`${serviceDir}/src/middleware`, { recursive: true });
    fs.mkdirSync(`${serviceDir}/tests/unit`, { recursive: true });
    fs.mkdirSync(`${serviceDir}/tests/integration`, { recursive: true });
    fs.mkdirSync(`${serviceDir}/tests/e2e`, { recursive: true });
    fs.writeFileSync(`${serviceDir}/README.md`, '');
    fs.writeFileSync(`${serviceDir}/Dockerfile`, '');
    fs.writeFileSync(`${serviceDir}/.env.example`, '');
    fs.mkdirSync(`${serviceDir}/.github/workflows`, { recursive: true });
}

function createPackageJson(): void {
    printStatus("Creating package.json...");
    const packageJsonContent = `{
  "name": "@maily/${serviceName}",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "tsc",
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "start": "node dist/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint . --ext .ts",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@maily/shared-types": "workspace:*",
    "@maily/shared-utils": "workspace:*",
    "express": "4.18.2",
    "express-validator": "7.0.1",
    "winston": "3.11.0"
  },
  "devDependencies": {
    "@types/express": "4.17.21",
    "@types/jest": "29.5.12",
    "@types/node": "20.11.19",
    "@types/supertest": "6.0.2",
    "jest": "29.7.0",
    "supertest": "6.3.4",
    "ts-jest": "29.1.2",
    "ts-node-dev": "2.0.0",
    "typescript": "5.3.3"
  }
}
`;
    fs.writeFileSync(`${serviceDir}/package.json`, packageJsonContent);
}

function createTypescriptConfig(): void {
    printStatus("Creating TypeScript configuration...");
    const tsconfigContent = `{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
`;
    fs.writeFileSync(`${serviceDir}/tsconfig.json`, tsconfigContent);
}

function createMainAppFile(): void {
    printStatus("Creating main application file...");
    const mainAppFileContent = `import express from 'express';
import { setupRoutes } from './routes';
import { setupMiddleware } from './middleware';
import { logger } from './utils/logger';
import { config } from './config';

const app = express();

// Setup middleware
setupMiddleware(app);

// Setup routes
setupRoutes(app);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(config.port, () => {
  logger.info(\`\${config.serviceName} service listening on port \${config.port}\`);
});

export default app;
`;
    fs.writeFileSync(`${serviceDir}/src/index.ts`, mainAppFileContent);
}

function createConfig(): void {
    printStatus("Creating configuration...");
    const configContent = `export const config = {
  serviceName: '${serviceName}',
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info'
};
`;
    fs.writeFileSync(`${serviceDir}/src/config/index.ts`, configContent);
}

function createLogger(): void {
    printStatus("Creating logger utility...");
    const loggerContent = `import winston from 'winston';
import { config } from '../config';

export const logger = winston.createLogger({
  level: config.logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: config.serviceName },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});
`;
    fs.writeFileSync(`${serviceDir}/src/utils/logger.ts`, loggerContent);
}

function createTestSetup(): void {
    printStatus("Creating test setup...");
    const jestConfigContent = `module.exports = {
  ...require('../../config/jest.config'),
  displayName: '${serviceName}'
};
`;
    fs.writeFileSync(`${serviceDir}/jest.config.js`, jestConfigContent);

    const exampleTestContent = `describe('Example Test', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });
});
`;
    fs.writeFileSync(`${serviceDir}/tests/unit/example.test.ts`, exampleTestContent);
}

function createDockerConfig(): void {
    printStatus("Creating Docker configuration...");
    const dockerfileContent = `FROM ../../infrastructure/docker/base/Dockerfile.base as builder

WORKDIR /app/apps/$SERVICE_NAME

COPY . .
RUN pnpm build

FROM node:20-slim

WORKDIR /app
COPY --from=builder /app/apps/$SERVICE_NAME/dist ./dist
COPY --from=builder /app/apps/$SERVICE_NAME/package.json .

CMD ["node", "dist/index.js"]
`;
    fs.writeFileSync(`${serviceDir}/Dockerfile`, dockerfileContent);
}

function createGithubWorkflow(): void {
    printStatus("Creating GitHub workflow...");
    const githubWorkflowContent = `name: CI

on:
  push:
    paths:
      - 'apps/$SERVICE_NAME/**'
      - '.github/workflows/ci.yml'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test
`;
    fs.writeFileSync(`${serviceDir}/.github/workflows/ci.yml`, githubWorkflowContent);
}

function createReadme(): void {
    printStatus("Creating README...");
    const readmeContent = `# ${serviceName}

## Description

[Add service description here]

## Setup

\`\`\`bash
# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
\`\`\`

## API Documentation

[Add API documentation here]

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Port to run the service on | 3000 |
| NODE_ENV | Environment | development |
| LOG_LEVEL | Logging level | info |

## Architecture

[Add architecture documentation here]
`;
    fs.writeFileSync(`${serviceDir}/README.md`, readmeContent);
}

function main(): void {
    createDirectoryStructure();
    createPackageJson();
    createTypescriptConfig();
    createMainAppFile();
    createConfig();
    createLogger();
    createTestSetup();
    createDockerConfig();
    createGithubWorkflow();
    createReadme();

    printStatus(`Service ${serviceName} created successfully! 🎉`);
    printWarning("Next steps:");
}

main();