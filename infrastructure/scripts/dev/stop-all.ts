#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';
import * as readline from 'readline';

const execAsync = promisify(exec);
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const print_status = (message: string) => {
};

const askQuestion = (query: string): Promise<string> => {
    return new Promise(resolve => rl.question(query, resolve));
};

const main = async () => {
    print_status("Stopping all services...");
    await execAsync('docker-compose -f config/docker-compose.yml down');

    print_status("Cleaning up orphaned containers...");
    await execAsync('docker container prune -f');

    const answer = await askQuestion("Clean up unused volumes? (y/N) ");
    if (answer.toLowerCase() === 'y') {
        print_status("Cleaning up unused volumes...");
        await execAsync('docker volume prune -f');
    }

    rl.close();
    print_status("All services stopped successfully!");
};

main().catch(err => {
    console.error("Script failed:", err);
    process.exit(1);
});