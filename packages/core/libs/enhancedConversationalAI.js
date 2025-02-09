// Import required libraries for the enhanced conversational AI system
// Fireworks.ai for language model access (DeepSeek R1 / Azure AI)
import Fireworks from 'fireworks-ai';

// Zep for conversational memory management
import { ZepClient } from 'zep-sdk';

// NeMo Guardrails for ethical AI governance
import NeMoGuardrails from 'nemo-guardrails';

// EnhancedConversationalAI class encapsulates the integration of the three components
class EnhancedConversationalAI {
  constructor(config = {}) {
    // Configuration for language model provider (default to Fireworks.ai with DeepSeek R1)
    this.lmProvider = config.lmProvider || 'fireworks';
    this.model = config.model || 'DeepSeekR1';
    this.apiKey = process.env.FIREWORKS_API_KEY;

    // Initialize Fireworks.ai client
    this.fireworksClient = new Fireworks({
      apiKey: this.apiKey,
      model: this.model,
      provider: this.lmProvider,
    });

    // Initialize Zep client for conversational memory
    // Zep distinguishes between short-term (context) and long-term (user profile) memories.
    this.zepClient = new ZepClient({
      baseUrl: process.env.ZEP_BASE_URL || 'http://localhost:8000',
    });

    // Initialize NeMo Guardrails for ethical governance with customizable policies
    this.nemoGuardrails = new NeMoGuardrails({
      policies: config.guardrailPolicies || {
        bias: true,
        toxicity: true,
        privacy: true,
      },
    });
  }

  // Method to request a response from the language model
  async getLanguageModelResponse(prompt) {
    try {
      // Validate the input prompt against ethical guardrails
      const safePrompt = await this.nemoGuardrails.validateInput(prompt);

      // Request a response from Fireworks.ai
      const lmResponse = await this.fireworksClient.generate(safePrompt);

      // Validate the output from the language model
      const safeResponse = await this.nemoGuardrails.validateOutput(lmResponse);

      return safeResponse;
    } catch (error) {
      console.error('Error in language model response:', error);
      throw new Error('Language model service error');
    }
  }

  // Update conversation memory using Zep
  // isShortTerm flag indicates whether this update is for short-term context or long-term user profile
  async updateConversationMemory(conversationId, message, isShortTerm = true) {
    try {
      if (isShortTerm) {
        await this.zepClient.updateShortTermMemory(conversationId, message);
      } else {
        await this.zepClient.updateLongTermMemory(conversationId, message);
      }
    } catch (error) {
      console.error('Error updating conversation memory:', error);
      // Not throwing error to avoid breaking conversation flow
    }
  }

  // Retrieve conversation history from Zep (short-term context)
  async getConversationHistory(conversationId) {
    try {
      const history =
        await this.zepClient.getConversationHistory(conversationId);
      return history;
    } catch (error) {
      console.error('Error retrieving conversation history:', error);
      return [];
    }
  }

  // Build the prompt for the language model by combining context history and the new input
  buildPrompt(contextHistory, userInput) {
    // For demonstration, we'll combine the last 5 messages from the conversation
    let prompt = 'The following is the conversation history:\n';
    contextHistory.slice(-5).forEach((msg) => {
      prompt += `${msg.from}: ${msg.message}\n`;
    });
    prompt += `user: ${userInput}\nAI: `;
    return prompt;
  }

  // Main interaction method for conversation
  async converse(conversationId, userInput) {
    try {
      // Update short-term memory with user's new input
      await this.updateConversationMemory(
        conversationId,
        { from: 'user', message: userInput },
        true,
      );

      // Retrieve conversation history for context
      const contextHistory = await this.getConversationHistory(conversationId);

      // Build the prompt for language model
      const prompt = this.buildPrompt(contextHistory, userInput);

      // Get the AI's response from the language model
      const aiResponse = await this.getLanguageModelResponse(prompt);

      // Update conversation memory with the AI's response
      await this.updateConversationMemory(
        conversationId,
        { from: 'ai', message: aiResponse },
        true,
      );

      // Optionally, update long-term memory if needed (e.g., if key profile info is detected)
      // await this.updateConversationMemory(conversationId, { from: 'user', message: userInput }, false);

      return aiResponse;
    } catch (error) {
      console.error('Error during conversation:', error);
      return "I'm sorry, but something went wrong while processing your request.";
    }
  }
}

export default EnhancedConversationalAI;
