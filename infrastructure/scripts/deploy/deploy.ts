#!/usr/bin/env node

// Exit on error
process.on('unhandledRejection', (err) => {
  throw err;
});

import { execSync } from 'child_process';

import dotenv from 'dotenv';

// Colors for output
const RED = '\x1b[0;31m';
const GREEN = '\x1b[0;32m';
const YELLOW = '\x1b[1;33m';
const NC = '\x1b[0m';

// Configuration
const environment = process.argv[2] || 'production';

// Validate environment
if (!['development', 'preview', 'production'].includes(environment)) {
  console.error(`${RED}Invalid environment. Must be one of: development, preview, production${NC}`);
  process.exit(1);
}


// Load environment variables
const envFile = `.env.${environment}`;
dotenv.config({ path: envFile });

// Check if environment file was loaded
if (!process.env.VERCEL_TOKEN) {
  console.error(`${RED}Environment file ${envFile} not found or VERCEL_TOKEN is not defined${NC}`);
  process.exit(1);
}

// Check required tools
const checkTool = (tool: string) => {
  try {
    execSync(`command -v ${tool}`);
    return true;
  } catch (error) {
    return false;
  }
};

if (!checkTool('vercel')) {
  console.error(`${RED}vercel CLI is required but not installed${NC}`);
  process.exit(1);
}

if (!checkTool('pnpm')) {
  console.error(`${RED}pnpm is required but not installed${NC}`);
  process.exit(1);
}

// Build project
execSync('pnpm build', { stdio: 'inherit' });

// Deploy to Vercel
const vercelDeployCommand = environment === 'production' ? 'vercel deploy --prod' : 'vercel deploy';
execSync(vercelDeployCommand, { stdio: 'inherit' });


