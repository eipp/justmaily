export abstract class BaseProvider {
  protected handleError(provider: string, error: unknown): never {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorCode = this.isRetryable(error) ? 'RETRYABLE_ERROR' : 'FATAL_ERROR';
    logger.error(`[${provider}] ${errorCode}: ${errorMessage}`);
    throw new ProviderError(errorCode, errorMessage);
  }

  private isRetryable(error: any): boolean {
    // Implement retry logic based on provider-specific codes
  }
} 