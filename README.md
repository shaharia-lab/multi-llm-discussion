# Multi-LLM Discussion System

A real-time discussion platform that orchestrates conversations between different Large Language Models (LLMs), enabling AI-to-AI debates with human intervention capabilities.

![Multi-LLM Discussion System](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)

## Features

- 🤖 **Multi-LLM Support**: GPT-5.1, GPT-4, Claude Sonnet 4.5, and more
- 💬 **Real-time Streaming**: Token-by-token conversation updates via Server-Sent Events
- 🎭 **Role-based Discussion**: Primary LLM presents ideas, Critic LLM evaluates
- 👤 **Human Intervention**: Join discussions at any time with your own messages
- 📋 **Copy to Markdown**: Export entire conversations with timestamps
- 🎨 **Clean UI**: Modern, responsive interface with expandable configurations
- ⚡ **Performance Optimized**: Token batching prevents browser freezing during streaming

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Zustand (state management)
- react-markdown

### Backend
- Node.js 20 + Express + TypeScript
- OpenAI SDK
- Anthropic SDK
- Server-Sent Events (SSE)

## Quick Start

### Prerequisites

- Node.js 20.x or higher
- OpenAI API key
- Anthropic API key

### Option 1: Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/shaharia-lab/multi-llm-discussion.git
   cd multi-llm-discussion
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your API keys
   ```

3. **Start with Docker Compose**
   ```bash
   docker-compose up
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Option 2: Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/shaharia-lab/multi-llm-discussion.git
   cd multi-llm-discussion
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys:
   # OPENAI_API_KEY=your_openai_key
   # ANTHROPIC_API_KEY=your_anthropic_key
   ```

4. **Start development servers**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create a `.env` file in the root directory:

```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
PORT=3001
```

## Supported Models

### OpenAI
- **GPT-5.1** (gpt-5.1-2025-11-13)
- GPT-4
- GPT-3.5 Turbo

### Anthropic
- **Claude Sonnet 4.5** (claude-sonnet-4-5-20250929)
- Claude 3 Opus

## How It Works

1. **Configure Discussion**: Set a topic and choose Primary/Critic LLM models with custom system prompts
2. **Start Discussion**: The Primary LLM presents ideas on the topic
3. **Critic Responds**: The Critic LLM evaluates and critiques the Primary's response
4. **Back and Forth**: LLMs continue the discussion automatically
5. **Human Intervention**: Jump in anytime by typing your message
6. **Export**: Copy the entire conversation as markdown for later use

## Usage Guide

### Starting a Discussion

1. **Enter a Topic**: Type your discussion topic in the large expandable textarea

2. **Configure Primary LLM** (Optional): Click to expand and customize
   - Select model (GPT-5.1, GPT-4, etc.)
   - Customize system prompt

3. **Configure Critic LLM** (Optional): Click to expand and customize
   - Select model (Claude Sonnet 4.5, etc.)
   - Customize system prompt

4. **Click "Start Discussion"**: The discussion will begin automatically

### During a Discussion

- **Watch the Discussion**: Messages will stream in real-time with color-coded bubbles:
  - 🟢 Green: OpenAI models (GPT)
  - 🟠 Orange: Anthropic models (Claude)
  - 🟡 Yellow: Your messages

- **Intervene**: Type a message in the input field at the bottom to join the conversation
  - Your message will be sent to the Primary LLM
  - The Primary will respond to you
  - The Critic will then evaluate the Primary's response
  - The discussion continues automatically

- **Stop Discussion**: Click the "Stop Discussion" button to end the conversation

### Discussion Flow

```
Primary LLM → Presents idea on topic
    ↓
Critic LLM → Evaluates and critiques
    ↓
Primary LLM → Responds to critique
    ↓
Critic LLM → Further evaluation
    ↓
(Loop continues until stopped)
```

## Project Structure

```
multi-llm-discussion/
├── backend/
│   ├── src/
│   │   ├── adapters/
│   │   │   ├── openai.ts          # OpenAI API integration
│   │   │   └── anthropic.ts       # Anthropic API integration
│   │   ├── discussionController.ts # Discussion orchestration
│   │   ├── streamManager.ts        # SSE stream handling
│   │   ├── types.ts                # TypeScript interfaces
│   │   └── index.ts                # Express server
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ConfigurationForm.tsx
│   │   │   ├── DiscussionView.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   └── InterventionInput.tsx
│   │   ├── App.tsx                 # Main application
│   │   ├── store.ts                # Zustand state management
│   │   ├── types.ts                # TypeScript interfaces
│   │   └── main.tsx                # Entry point
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── .env.example
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

## API Endpoints

### POST `/api/discussions/start`
Start a new discussion

**Request:**
```json
{
  "topic": "Discussion topic",
  "participants": [
    {
      "id": "uuid",
      "modelId": "gpt-4",
      "provider": "openai",
      "displayName": "GPT-4",
      "systemPrompt": "...",
      "role": "primary"
    },
    {
      "id": "uuid",
      "modelId": "claude-sonnet-3-5-20241022",
      "provider": "anthropic",
      "displayName": "Claude Sonnet",
      "systemPrompt": "...",
      "role": "critic"
    }
  ]
}
```

**Response:**
```json
{
  "discussionId": "uuid"
}
```

### GET `/api/discussions/:id/stream`
Server-Sent Events endpoint for streaming messages

**Events:**
- `token`: Individual token from LLM response
- `complete`: Message generation complete
- `message_start`: New message started
- `error`: Error occurred

### POST `/api/discussions/:id/intervention`
Send a human message to the discussion

**Request:**
```json
{
  "content": "Your message"
}
```

### POST `/api/discussions/:id/stop`
Stop the discussion

**Response:**
```json
{
  "status": "stopped"
}
```

## Building for Production

```bash
# Build both frontend and backend
pnpm build

# Start production server
pnpm start
```

The frontend will be built to `frontend/dist` and the backend to `backend/dist`.

## Troubleshooting

### API Key Issues
- Ensure your `.env` file is in the root directory
- Verify your API keys are valid and have sufficient credits
- Check that there are no extra spaces or quotes around the keys

### Port Already in Use
If port 3001 or 3000 is already in use:
```bash
# Change the backend port in .env
PORT=3002

# Or kill the process using the port
lsof -ti:3001 | xargs kill -9
```

### SSE Connection Issues
- Make sure the backend is running before starting the frontend
- Check browser console for connection errors
- Ensure no firewall is blocking the connection

### TypeScript Errors
```bash
# Clean and reinstall dependencies
rm -rf node_modules backend/node_modules frontend/node_modules
pnpm install
```

## Architecture

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript (ES Modules)
- **State Management**: Zustand
- **Real-time Communication**: Server-Sent Events (SSE)
- **Streaming**: Token-by-token with 50ms batching for performance

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [OpenAI API](https://platform.openai.com/)
- Built with [Anthropic API](https://www.anthropic.com/)
- UI components styled with [Tailwind CSS](https://tailwindcss.com/)

## Support

For issues, questions, or suggestions, please [open an issue](https://github.com/shaharia-lab/multi-llm-discussion/issues).

---

Made with ❤️ by the Shaharia Lab team
