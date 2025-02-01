#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';
import { Client } from 'pg';


const execAsync = promisify(exec);

const RED = '\u001b[0;31m';
const GREEN = '\u001b[0;32m';
const YELLOW = '\u001b[1;33m';
const NC = '\u001b[0m';

const print_status = (message: string) => {
};

const print_error = (message: string) => {
    console.error(`${RED}Error:${NC} ${message}`);
};

const print_warning = (message: string) => {
    console.warn(`${YELLOW}Warning:${NC} ${message}`);
};

const check_env = () => {
    if (!process.env['DB_HOST'] || !process.env['DB_PORT'] || !process.env['DB_NAME'] || !process.env['DB_USER'] || !process.env['DB_PASSWORD']) {
        print_error("Missing required environment variables. Please set: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD");
        process.exit(1);
    }
};

const wait_for_db = async () => {
    print_status("Waiting for database to be ready...");
    const client = new Client({
        host: process.env['DB_HOST'],
        port: parseInt(process.env['DB_PORT'] || '5432'),
        database: process.env['DB_NAME'],
        user: process.env['DB_USER'],
        password: process.env['DB_PASSWORD'],
    });

    let isDbReady = false;
    while (!isDbReady) {
        try {
            await client.connect();
            isDbReady = true;
        } catch (err) {
            print_warning("Database is unavailable - sleeping");
            await new Promise(resolve => setTimeout(resolve, 1000));
        } finally {
            if (isDbReady) {
                await client.end();
            }
        }
    }
    print_status("Database is ready!");
};

const run_service_migrations = async (service: string) => {
    print_status(`Running migrations for ${service}...`);
    const serviceDir = `apps/${service}`;
    const migrationsDirExists = await execAsync(`test -d ${serviceDir}/migrations`);

    if (migrationsDirExists.stderr) {
        print_warning(`No migrations found for ${service}`);
        return;
    }

    process.chdir(serviceDir);

    if ((await execAsync(`test -f prisma/schema.prisma`) as any).stderr === '') {
        print_status("Running Prisma migrations...");
        try {
            await execAsync('npx prisma migrate deploy');
        } catch (error: unknown) {
            print_error(`Prisma migrations failed for ${service}: ${(error as Error).message}`);
            process.exit(1);
        }
    } else if ((await execAsync(`test -f ormconfig.json || test -f ormconfig.js`) as any).stderr === '') {
        print_status("Running TypeORM migrations...");
        try {
            await execAsync('npx typeorm migration:run');
        } catch (error: unknown) {
            print_error(`TypeORM migrations failed for ${service}: ${(error as Error).message}`);
            process.exit(1);
        }
    } else {
        print_error(`No supported migration system found for ${service}`);
        process.exit(1);
    }

    process.chdir('../..');
};

const main = async () => {
    check_env();
    await wait_for_db();

    const services = [
        "api-gateway",
        "campaign-management",
        "audience-segmentation",
        "analytics-service",
        "project-management",
    ];

    for (const service of services) {
        await run_service_migrations(service);
    }

    print_status("All migrations completed successfully! 🎉");
};

main().catch(err => {
    print_error(`Script failed: ${err}`);
    process.exit(1);
});