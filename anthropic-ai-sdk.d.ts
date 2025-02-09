declare module '@anthropic-ai/sdk' {
  export class Anthropic {
    constructor(options: { apiKey: string });
    messages: {
      create(options: any): Promise<any>;
    };
  }
  export type Message = any;
} 