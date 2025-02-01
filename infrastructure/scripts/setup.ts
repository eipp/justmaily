#!/usr/bin/env node

import { execSync } from 'child_process';
import * as fs from 'fs';

// Colors for output
const RED = '\u001b[0;31m';
const GREEN = '\u001b[0;32m';
const YELLOW = '\u001b[1;33m';
const NC = '\u001b[0m';

function printStatus(color: string, message: string): void {
}

function commandExists(command: string): boolean {
    try {
        execSync(`command -v ${command}`, { stdio: 'ignore' });
        return true;
    } catch (error) {
        return false;
    }
}

printStatus(YELLOW, "Starting project setup...");

printStatus(YELLOW, "\nChecking required tools...");

if (!commandExists('node')) {
    printStatus(RED, "Node.js is not installed. Please install Node.js 20 or later.");
    process.exit(1);
}

if (!commandExists('pnpm')) {
    printStatus(YELLOW, "Installing pnpm...");
    execSync('npm install -g pnpm');
}

if (!commandExists('python3')) {
    printStatus(RED, "Python 3 is not installed. Please install Python 3.");
    process.exit(1);
}

printStatus(YELLOW, "\nInstalling project dependencies...");
execSync('pnpm install');

if (!fs.existsSync('.env')) {
    printStatus(YELLOW, "\nCreating .env file from example...");
    fs.copyFileSync('.env.example', '.env');
    printStatus(GREEN, "Created .env file. Please update it with your configuration.");
}

printStatus(YELLOW, "\nBuilding packages...");
execSync('pnpm build');

printStatus(YELLOW, "\nSetting up git hooks...");
execSync('git config core.hooksPath .github/hooks');

printStatus(GREEN, "\nSetup complete! 🎉");
