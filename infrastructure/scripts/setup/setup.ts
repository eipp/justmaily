#!/usr/bin/env node

// Exit on error
process.on('unhandledRejection', (err) => {
  throw err;
});

import { execSync } from 'child_process';
import fs from 'fs';

// Colors for output
const RED = '\x1b[0;31m';
const GREEN = '\x1b[0;32m';
const YELLOW = '\x1b[1;33m';
const NC = '\x1b[0m';


// Check for required tools

const checkTool = (tool: string) => {
  try {
    execSync(`command -v ${tool}`);
    return true;
  } catch (error) {
    return false;
  }
};

if (!checkTool('node')) {
  console.error(`${RED}Node.js is not installed. Please install Node.js 20 or later.${NC}`);
  process.exit(1);
}

if (!checkTool('pnpm')) {
  execSync('npm install -g pnpm', { stdio: 'inherit' });
  if (!checkTool('pnpm')) {
    console.error(`${RED}pnpm installation failed. Please install pnpm manually.${NC}`);
    process.exit(1);
  }
}

if (!checkTool('python3')) {
  console.error(`${RED}Python 3 is not installed. Please install Python 3.${NC}`);
  process.exit(1);
}

// Install dependencies
execSync('pnpm install', { stdio: 'inherit' });

// Copy environment file if it doesn't exist
if (!fs.existsSync('.env')) {
  fs.copyFileSync('.env.example', '.env');
}

// Build packages
execSync('pnpm build', { stdio: 'inherit' });

// Setup git hooks
execSync('git config core.hooksPath .github/hooks', { stdio: 'inherit' });

// Completion message
