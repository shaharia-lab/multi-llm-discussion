import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { StreamManager } from './streamManager.js';
import { DiscussionController } from './discussionController.js';
import { StartDiscussionRequest, InterventionRequest } from './types.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Check for required environment variables
if (!process.env.OPENAI_API_KEY || !process.env.ANTHROPIC_API_KEY) {
  console.error('Error: OPENAI_API_KEY and ANTHROPIC_API_KEY must be set in environment variables');
  process.exit(1);
}

// Initialize services
const streamManager = new StreamManager();
const discussionController = new DiscussionController(
  streamManager,
  process.env.OPENAI_API_KEY,
  process.env.ANTHROPIC_API_KEY
);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start a new discussion
app.post('/api/discussions/start', async (req: Request, res: Response) => {
  try {
    const { topic, participants } = req.body as StartDiscussionRequest;

    if (!topic || !participants || participants.length !== 2) {
      res.status(400).json({ error: 'Invalid request: topic and exactly 2 participants required' });
      return;
    }

    const discussionId = discussionController.createDiscussion(topic, participants);

    // Start the discussion loop in the background
    discussionController.startDiscussionLoop(discussionId).catch((error) => {
      console.error('Error in discussion loop:', error);
    });

    res.json({ discussionId });
  } catch (error) {
    console.error('Error starting discussion:', error);
    res.status(500).json({ error: 'Failed to start discussion' });
  }
});

// Stream endpoint for receiving messages
app.get('/api/discussions/:id/stream', (req: Request, res: Response) => {
  const discussionId = req.params.id;
  const discussion = discussionController.getDiscussion(discussionId);

  if (!discussion) {
    res.status(404).json({ error: 'Discussion not found' });
    return;
  }

  // Disable timeout for this specific SSE connection
  req.socket.setTimeout(0);
  res.socket?.setTimeout(0);

  streamManager.addClient(discussionId, res);

  // Send keep-alive comments every 15 seconds to prevent timeout
  const keepAliveInterval = setInterval(() => {
    if (res.writable) {
      res.write(':keep-alive\n\n');
    } else {
      clearInterval(keepAliveInterval);
    }
  }, 15000);

  // Clean up on client disconnect
  req.on('close', () => {
    clearInterval(keepAliveInterval);
    console.log(`Client disconnected from discussion: ${discussionId}`);
  });
});

// Handle human intervention
app.post('/api/discussions/:id/intervention', async (req: Request, res: Response) => {
  try {
    const discussionId = req.params.id;
    const { content } = req.body as InterventionRequest;

    if (!content || content.trim().length === 0) {
      res.status(400).json({ error: 'Message content is required' });
      return;
    }

    const discussion = discussionController.getDiscussion(discussionId);
    if (!discussion) {
      res.status(404).json({ error: 'Discussion not found' });
      return;
    }

    if (discussion.status === 'stopped') {
      res.status(400).json({ error: 'Discussion has been stopped' });
      return;
    }

    const messageId = await discussionController.handleIntervention(discussionId, content);
    res.json({ messageId });
  } catch (error) {
    console.error('Error handling intervention:', error);
    res.status(500).json({ error: 'Failed to handle intervention' });
  }
});

// Stop a discussion
app.post('/api/discussions/:id/stop', (req: Request, res: Response) => {
  try {
    const discussionId = req.params.id;
    const discussion = discussionController.getDiscussion(discussionId);

    if (!discussion) {
      res.status(404).json({ error: 'Discussion not found' });
      return;
    }

    discussionController.stopDiscussion(discussionId);
    res.json({ status: 'stopped' });
  } catch (error) {
    console.error('Error stopping discussion:', error);
    res.status(500).json({ error: 'Failed to stop discussion' });
  }
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});

// Disable timeout for SSE connections (default is 2 minutes)
server.timeout = 0;
server.keepAliveTimeout = 0;
server.headersTimeout = 0;
