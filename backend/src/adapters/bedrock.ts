import { BedrockRuntimeClient, ConverseStreamCommand } from '@aws-sdk/client-bedrock-runtime';
import { Message, ModelId } from '../types.js';

export class BedrockAdapter {
  private client: BedrockRuntimeClient;

  constructor(region: string = 'eu-west-1') {
    this.client = new BedrockRuntimeClient({
      region,
      // AWS SDK will automatically use credentials from environment variables:
      // AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and optionally AWS_SESSION_TOKEN
    });
  }

  async *streamResponse(
    modelId: ModelId,
    systemPrompt: string,
    conversationHistory: Message[],
    currentMessage: string
  ): AsyncGenerator<string, void, unknown> {
    // Build conversation history in Bedrock's Converse API format
    const messages: any[] = [];

    // Add conversation history
    for (const msg of conversationHistory) {
      if (msg.sender === 'human') {
        messages.push({
          role: 'user',
          content: [{ text: msg.content }]
        });
      } else {
        messages.push({
          role: 'assistant',
          content: [{ text: msg.content }]
        });
      }
    }

    // Add current message
    messages.push({
      role: 'user',
      content: [{ text: currentMessage }]
    });

    const command = new ConverseStreamCommand({
      modelId: modelId,
      messages,
      system: [{ text: systemPrompt }],
      inferenceConfig: {
        maxTokens: 4096,
        temperature: 1.0,
      },
    });

    const response = await this.client.send(command);

    if (response.stream) {
      for await (const event of response.stream) {
        if (event.contentBlockDelta?.delta?.text) {
          yield event.contentBlockDelta.delta.text;
        }
      }
    }
  }
}
