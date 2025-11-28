import { v4 as uuidv4 } from 'uuid';
import { Discussion, Message, Participant } from './types.js';
import { StreamManager } from './streamManager.js';
import { OpenAIAdapter } from './adapters/openai.js';
import { AnthropicAdapter } from './adapters/anthropic.js';

export class DiscussionController {
  private discussions: Map<string, Discussion> = new Map();
  private streamManager: StreamManager;
  private openAIAdapter: OpenAIAdapter;
  private anthropicAdapter: AnthropicAdapter;
  private discussionLoops: Map<string, boolean> = new Map();

  constructor(
    streamManager: StreamManager,
    openaiApiKey: string,
    anthropicApiKey: string
  ) {
    this.streamManager = streamManager;
    this.openAIAdapter = new OpenAIAdapter(openaiApiKey);
    this.anthropicAdapter = new AnthropicAdapter(anthropicApiKey);
  }

  createDiscussion(topic: string, participants: Participant[]): string {
    const discussionId = uuidv4();
    const discussion: Discussion = {
      id: discussionId,
      topic,
      participants,
      messages: [],
      status: 'running',
    };
    this.discussions.set(discussionId, discussion);
    this.discussionLoops.set(discussionId, true);
    return discussionId;
  }

  getDiscussion(discussionId: string): Discussion | undefined {
    return this.discussions.get(discussionId);
  }

  stopDiscussion(discussionId: string): void {
    const discussion = this.discussions.get(discussionId);
    if (discussion) {
      discussion.status = 'stopped';
      this.discussionLoops.set(discussionId, false);
    }
  }

  async startDiscussionLoop(discussionId: string): Promise<void> {
    const discussion = this.discussions.get(discussionId);
    if (!discussion) {
      throw new Error('Discussion not found');
    }

    const primary = discussion.participants.find((p) => p.role === 'primary');
    const critic = discussion.participants.find((p) => p.role === 'critic');

    if (!primary || !critic) {
      throw new Error('Discussion must have both primary and critic participants');
    }

    // Start with primary LLM discussing the topic
    await this.generateResponse(discussionId, primary, discussion.topic);

    // Continue the loop
    this.continueDiscussionLoop(discussionId);
  }

  private async continueDiscussionLoop(discussionId: string): Promise<void> {
    const discussion = this.discussions.get(discussionId);
    if (!discussion || !this.discussionLoops.get(discussionId)) {
      return;
    }

    const primary = discussion.participants.find((p) => p.role === 'primary');
    const critic = discussion.participants.find((p) => p.role === 'critic');

    if (!primary || !critic) {
      return;
    }

    // Determine whose turn it is based on the last message
    const lastMessage = discussion.messages[discussion.messages.length - 1];
    const nextParticipant = lastMessage.sender === primary.id ? critic : primary;

    // Add 2 second delay between responses
    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (!this.discussionLoops.get(discussionId)) {
      return;
    }

    // Get the last message content
    const lastContent = lastMessage.content;

    // Generate response
    await this.generateResponse(discussionId, nextParticipant, lastContent);

    // Continue the loop if still running
    if (this.discussionLoops.get(discussionId)) {
      this.continueDiscussionLoop(discussionId);
    }
  }

  async handleIntervention(discussionId: string, content: string): Promise<string> {
    const discussion = this.discussions.get(discussionId);
    if (!discussion) {
      throw new Error('Discussion not found');
    }

    // Add human message
    const messageId = uuidv4();
    const message: Message = {
      id: messageId,
      sender: 'human',
      content,
      timestamp: new Date(),
    };
    discussion.messages.push(message);

    // Send message event
    this.streamManager.sendEvent(discussionId, {
      type: 'message_start',
      message,
    });

    // Primary responds to human intervention
    const primary = discussion.participants.find((p) => p.role === 'primary');
    if (primary) {
      await this.generateResponse(discussionId, primary, content);

      // Continue the discussion loop
      if (this.discussionLoops.get(discussionId)) {
        this.continueDiscussionLoop(discussionId);
      }
    }

    return messageId;
  }

  private async generateResponse(
    discussionId: string,
    participant: Participant,
    promptMessage: string
  ): Promise<void> {
    const discussion = this.discussions.get(discussionId);
    if (!discussion || !this.discussionLoops.get(discussionId)) {
      return;
    }

    const messageId = uuidv4();
    let fullContent = '';

    try {
      console.log(`[${discussionId}] Generating response from ${participant.displayName}...`);

      // Get the adapter based on provider
      const adapter =
        participant.provider === 'openai' ? this.openAIAdapter : this.anthropicAdapter;

      // Stream the response
      const stream = adapter.streamResponse(
        participant.modelId,
        participant.systemPrompt,
        discussion.messages,
        promptMessage
      );

      for await (const token of stream) {
        if (!this.discussionLoops.get(discussionId)) {
          console.log(`[${discussionId}] Discussion loop stopped during streaming`);
          break;
        }
        fullContent += token;
        this.streamManager.sendEvent(discussionId, {
          type: 'token',
          participantId: participant.id,
          token,
          messageId,
        });
      }

      console.log(`[${discussionId}] ${participant.displayName} completed response (${fullContent.length} chars)`);

      // Add complete message to discussion
      const message: Message = {
        id: messageId,
        sender: participant.id,
        content: fullContent,
        timestamp: new Date(),
      };
      discussion.messages.push(message);

      // Send completion event
      this.streamManager.sendEvent(discussionId, {
        type: 'complete',
        participantId: participant.id,
        messageId,
      });
    } catch (error) {
      console.error(`[${discussionId}] Error generating response from ${participant.displayName}:`, error);
      this.streamManager.sendEvent(discussionId, {
        type: 'error',
        participantId: participant.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      // Stop the discussion loop on error
      this.discussionLoops.set(discussionId, false);
    }
  }
}
