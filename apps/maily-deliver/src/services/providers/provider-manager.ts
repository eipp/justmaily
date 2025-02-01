interface EmailProvider {
  send(params: EmailParams): Promise<SendResponse>;
}

class ProviderManager {
  private providers: Map<string, EmailProvider> = new Map();

  registerProvider(name: string, provider: EmailProvider) {
    this.providers.set(name, provider);
  }

  getProvider(name: string): EmailProvider {
    const provider = this.providers.get(name);
    if (!provider) throw new Error(`Provider ${name} not registered`);
    return provider;
  }
} 