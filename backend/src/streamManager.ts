import { Response } from 'express';
import { StreamEvent } from './types.js';

export class StreamManager {
  private clients: Map<string, Response> = new Map();

  addClient(discussionId: string, res: Response): void {
    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    this.clients.set(discussionId, res);

    // Clean up on client disconnect
    res.on('close', () => {
      this.clients.delete(discussionId);
    });
  }

  sendEvent(discussionId: string, event: StreamEvent): void {
    const client = this.clients.get(discussionId);
    if (client) {
      client.write(`data: ${JSON.stringify(event)}\n\n`);
    }
  }

  removeClient(discussionId: string): void {
    const client = this.clients.get(discussionId);
    if (client) {
      client.end();
      this.clients.delete(discussionId);
    }
  }

  hasClient(discussionId: string): boolean {
    return this.clients.has(discussionId);
  }
}
