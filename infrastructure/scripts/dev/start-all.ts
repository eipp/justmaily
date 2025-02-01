#!/usr/bin/env node

import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

import * as dotenv from 'dotenv';

const execAsync = promisify(exec);

const print_status = (message: string) => {
};

const main = async () => {
    print_status("Loading environment variables...");
    const envPath = path.resolve('.env');
    if (fs.existsSync(envPath)) {
        dotenv.config({ path: envPath });
    } else {
        console.warn("Warning: .env file not found");
    }

    print_status("Checking and installing dependencies...");
    const nodeModulesExists = await execAsync('test -d node_modules');
    if (nodeModulesExists.stderr) {
        print_status("Installing dependencies...");
        await execAsync('pnpm install');
    }

    print_status("Building shared libraries...");
    const libsDir = path.resolve('libs');
    const libs = await fs.promises.readdir(libsDir);
    for (const lib of libs) {
        const libPath = path.join(libsDir, lib);
        if ((await fs.promises.stat(libPath)).isDirectory()) {
            print_status(`Building ${lib}...`);
            await execAsync('pnpm build', { cwd: libPath });
        }
    }

    print_status("Starting all services...");
    await execAsync('docker-compose -f config/docker-compose.yml up -d');

    print_status("Waiting for services to be healthy...");
    await new Promise(resolve => setTimeout(resolve, 10000));

    print_status("All services started successfully!");
    print_status("API Gateway available at: http://localhost:3000");
};

main().catch(err => {
    console.error("Script failed:", err);
    process.exit(1);
});