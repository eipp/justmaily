#!/usr/bin/env node

import { execSync } from 'child_process';
import * as fs from 'fs';

// Colors for output
const RED = '\u001b[0;31m';
const GREEN = '\u001b[0;32m';
const YELLOW = '\u001b[1;33m';
const NC = '\u001b[0m'; // No Color

// Function to print colored output
function printStatus(color: string, message: string): void {
}

// Function to check if command exists
function commandExists(command: string): boolean {
    try {
        execSync(`command -v ${command}`, { stdio: 'ignore' });
        return true;
    } catch (error) {
        return false;
    }
}

printStatus(YELLOW, "Checking prerequisites...");

if (!commandExists('aws')) {
    printStatus(RED, "AWS CLI is not installed. Please install it first.");
    process.exit(1);
}

if (!commandExists('jq')) {
    printStatus(RED, "jq is not installed. Please install it first.");
    process.exit(1);
}

try {
    execSync('aws sts get-caller-identity', { stdio: 'ignore' });
} catch (error) {
    printStatus(RED, "AWS credentials not configured. Please run 'aws configure' first.");
    process.exit(1);
}

printStatus(YELLOW, "Creating IAM user for SES...");
execSync('aws iam create-user --user-name justmaily-ses || true');

printStatus(YELLOW, "Attaching required policies...");
execSync('aws iam attach-user-policy --user-name justmaily-ses --policy-arn arn:aws:iam::aws:policy/AmazonSESFullAccess');
execSync('aws iam attach-user-policy --user-name justmaily-ses --policy-arn arn:aws:iam::aws:policy/CloudWatchFullAccess');

printStatus(YELLOW, "Creating access keys...");
const accessKeysOutput = execSync('aws iam create-access-key --user-name justmaily-ses').toString();
const accessKeyId = JSON.parse(accessKeysOutput).AccessKey.AccessKeyId;
const secretAccessKey = JSON.parse(accessKeysOutput).AccessKey.SecretAccessKey;

printStatus(YELLOW, "Verifying domain in SES...");
const verificationTokenOutput = execSync('aws ses verify-domain-identity --domain justmaily.com').toString();
const verificationToken = JSON.parse(verificationTokenOutput).VerificationToken;

printStatus(YELLOW, "Configuring DKIM...");
const dkimTokensOutput = execSync('aws ses verify-domain-dkim --domain justmaily.com').toString();
const dkimTokens = JSON.parse(dkimTokensOutput).DkimTokens;

printStatus(YELLOW, "Creating configuration set...");
execSync('aws ses create-configuration-set --configuration-set-name justmaily-production || true');

printStatus(YELLOW, "Configuring tracking options...");
execSync('aws ses update-configuration-set-tracking-options --configuration-set-name justmaily-production --tracking-options CustomRedirectDomain=click.justmaily.com || true');

printStatus(YELLOW, "Configuring event publishing...");
execSync(`aws ses create-configuration-set-event-destination \
    --configuration-set-name justmaily-production \
    --event-destination-name ses-events \
    --event-destination '{
        "CloudWatchDestination": {
            "DimensionConfigurations": [
                {
                    "DimensionName": "ses:source-ip",
                    "DimensionValueSource": "messageTag",
                    "DefaultDimensionValue": "none"
                }
            ]
        },
        "Enabled": true,
        "MatchingEventTypes": ["send", "bounce", "complaint", "delivery", "open", "click"]
    }' || true`);

const webhookSecret = execSync('openssl rand -hex 32').toString().trim();

printStatus(YELLOW, "Updating .env file...");
let envFileContent = fs.readFileSync('.env', 'utf8');
envFileContent = envFileContent.replace(/AWS_SES_ACCESS_KEY_ID=/, `AWS_SES_ACCESS_KEY_ID=${accessKeyId}`);
envFileContent = envFileContent.replace(/AWS_SES_SECRET_ACCESS_KEY=/, `AWS_SES_SECRET_ACCESS_KEY=${secretAccessKey}`);
envFileContent = envFileContent.replace(/SES_WEBHOOK_SECRET=/, `SES_WEBHOOK_SECRET=${webhookSecret}`);
fs.writeFileSync('.env', envFileContent);


printStatus(GREEN, "\nSES Configuration completed! Please add the following DNS records:\n");


dkimTokens.forEach((token: string) => {
});


printStatus(YELLOW, "Important Next Steps:");

printStatus(GREEN, "\nConfiguration values have been saved to .env");
printStatus(YELLOW, "Please keep your credentials secure and never commit them to version control.");