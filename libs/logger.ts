// libs/logger.ts

export function logError(service: string, error: Error): void {
  console.error(`[${service}] ${error.message}`);
}

export function logInfo(service: string, message: string): void {
  console.info(`[${service}] ${message}`);
} 