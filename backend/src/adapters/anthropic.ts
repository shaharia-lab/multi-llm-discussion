import Anthropic from '@anthropic-ai/sdk';
import { Message, ModelId } from '../types.js';

export class AnthropicAdapter {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async *streamResponse(
    modelId: ModelId,
    systemPrompt: string,
    conversationHistory: Message[],
    currentMessage: string
  ): AsyncGenerator<string, void, unknown> {
    // Build conversation history in Anthropic's format
    const messages: Anthropic.MessageParam[] = [];

    // Add conversation history
    for (const msg of conversationHistory) {
      if (msg.sender === 'human') {
        messages.push({ role: 'user', content: msg.content });
      } else {
        messages.push({ role: 'assistant', content: msg.content });
      }
    }

    // Add current message
    messages.push({ role: 'user', content: currentMessage });

    const stream = await this.client.messages.create({
      model: modelId,
      max_tokens: 4096,
      system: systemPrompt,
      messages,
      stream: true,
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        yield event.delta.text;
      }
    }
  }
}
