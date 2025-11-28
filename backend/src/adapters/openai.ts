import OpenAI from 'openai';
import { Message, ModelId } from '../types.js';

export class OpenAIAdapter {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async *streamResponse(
    modelId: ModelId,
    systemPrompt: string,
    conversationHistory: Message[],
    currentMessage: string
  ): AsyncGenerator<string, void, unknown> {
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map((msg) => ({
        role: msg.sender === 'human' ? 'user' as const : 'assistant' as const,
        content: msg.content,
      })),
      { role: 'user', content: currentMessage },
    ];

    const stream = await this.client.chat.completions.create({
      model: modelId,
      messages,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }
}
