import type { ModelProvider } from '../types';
import type { AIClient } from './base';
export declare class AIClientFactory {
    private static clients;
    static createClient(provider: ModelProvider, apiKey: string, apiEndpoint?: string): AIClient;
    static clearClients(): void;
}
