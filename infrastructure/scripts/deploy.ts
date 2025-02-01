#!/usr/bin/env node

import { execSync } from 'child_process';

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

const environment = process.argv[2] || 'production';

const validEnvironments = ['development', 'preview', 'production'];
if (!validEnvironments.includes(environment)) {
    printStatus(RED, `Invalid environment. Must be one of: ${validEnvironments.join(', ')}`);
    process.exit(1);
}

if (!commandExists('vercel')) {
    printStatus(RED, "vercel CLI is required but not installed");
    process.exit(1);
}

if (!commandExists('pnpm')) {
    printStatus(RED, "pnpm is required but not installed");
    process.exit(1);
}

printStatus(YELLOW, "Building project...");
execSync('pnpm build');

printStatus(YELLOW, "Deploying to Vercel...");
if (environment === 'production') {
    execSync('vercel deploy --prod');
} else {
    execSync('vercel deploy');
}

printStatus(GREEN, "Deployment completed successfully!");

