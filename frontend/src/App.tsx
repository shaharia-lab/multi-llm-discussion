import { useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ConfigurationForm } from './components/ConfigurationForm';
import { DiscussionView } from './components/DiscussionView';
import { InterventionInput } from './components/InterventionInput';
import { useDiscussionStore } from './store';
import type { ModelId, Participant } from './types';
import { MODEL_OPTIONS } from './types';

const API_BASE_URL = '/api';

function App() {
  const {
    topic,
    participants,
    messages,
    status,
    discussionId,
    error,
    setTopic,
    setParticipants,
    addMessage,
    updateStreamingMessage,
    completeStreamingMessage,
    setStatus,
    setDiscussionId,
    setError,
  } = useDiscussionStore();

  const eventSourceRef = useRef<EventSource | null>(null);
  const tokenBufferRef = useRef<Map<string, string>>(new Map());
  const flushTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (flushTimerRef.current) {
        clearTimeout(flushTimerRef.current);
      }
    };
  }, []);

  const handleStart = async (
    topicValue: string,
    primaryModelId: ModelId,
    primaryPrompt: string,
    criticModelId: ModelId,
    criticPrompt: string
  ) => {
    try {
      setError(null);
      setTopic(topicValue);

      // Create participants
      const primary: Participant = {
        id: uuidv4(),
        modelId: primaryModelId,
        provider: MODEL_OPTIONS.find((m) => m.id === primaryModelId)!.provider,
        displayName: MODEL_OPTIONS.find((m) => m.id === primaryModelId)!.name,
        systemPrompt: primaryPrompt,
        role: 'primary',
      };

      const critic: Participant = {
        id: uuidv4(),
        modelId: criticModelId,
        provider: MODEL_OPTIONS.find((m) => m.id === criticModelId)!.provider,
        displayName: MODEL_OPTIONS.find((m) => m.id === criticModelId)!.name,
        systemPrompt: criticPrompt,
        role: 'critic',
      };

      const participantsList = [primary, critic];
      setParticipants(participantsList);

      // Start discussion
      const response = await fetch(`${API_BASE_URL}/discussions/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicValue,
          participants: participantsList,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start discussion');
      }

      const data = await response.json();
      setDiscussionId(data.discussionId);
      setStatus('running');

      // Connect to SSE stream
      connectToStream(data.discussionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start discussion');
      setStatus('idle');
    }
  };

  // Flush buffered tokens to the UI
  const flushTokenBuffer = () => {
    const buffer = tokenBufferRef.current;
    if (buffer.size === 0) return;

    buffer.forEach((tokens, messageId) => {
      const currentMessages = useDiscussionStore.getState().messages;
      const existingMessage = currentMessages.find((m) => m.id === messageId);

      if (existingMessage) {
        updateStreamingMessage(messageId, existingMessage.content + tokens);
      }
    });

    buffer.clear();
  };

  const connectToStream = (id: string) => {
    const eventSource = new EventSource(`${API_BASE_URL}/discussions/${id}/stream`);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      const streamEvent = JSON.parse(event.data);

      switch (streamEvent.type) {
        case 'token': {
          // Buffer tokens instead of updating immediately
          const buffer = tokenBufferRef.current;
          const existingBuffer = buffer.get(streamEvent.messageId) || '';
          buffer.set(streamEvent.messageId, existingBuffer + streamEvent.token);

          // Check if this is the first token (create message)
          const currentMessages = useDiscussionStore.getState().messages;
          const existingMessage = currentMessages.find((m) => m.id === streamEvent.messageId);

          if (!existingMessage) {
            // Create new streaming message with first token
            addMessage({
              id: streamEvent.messageId,
              sender: streamEvent.participantId,
              content: streamEvent.token,
              timestamp: new Date(),
              isStreaming: true,
            });
          }

          // Schedule flush (batches updates every 50ms)
          if (flushTimerRef.current) {
            clearTimeout(flushTimerRef.current);
          }
          flushTimerRef.current = setTimeout(flushTokenBuffer, 50);

          break;
        }

        case 'complete': {
          // Flush any remaining tokens before marking complete
          flushTokenBuffer();
          completeStreamingMessage(streamEvent.messageId);
          break;
        }

        case 'message_start': {
          // Human intervention message
          if (streamEvent.message) {
            addMessage({
              ...streamEvent.message,
              timestamp: new Date(streamEvent.message.timestamp),
            });
          }
          break;
        }

        case 'error': {
          setError(streamEvent.error || 'An error occurred');
          break;
        }
      }
    };

    eventSource.onerror = () => {
      console.error('SSE connection error');
      eventSource.close();
    };
  };

  const handleIntervention = async (message: string) => {
    if (!discussionId) return;

    try {
      await fetch(`${API_BASE_URL}/discussions/${discussionId}/intervention`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message }),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send intervention');
    }
  };

  const handleStop = async () => {
    if (!discussionId) return;

    try {
      await fetch(`${API_BASE_URL}/discussions/${discussionId}/stop`, {
        method: 'POST',
      });

      setStatus('stopped');

      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop discussion');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-6 px-8">
        <div className="max-w-[1800px] mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Multi-LLM Discussion System</h1>
          <p className="text-gray-600 mt-1">Orchestrated discussions between LLMs</p>
        </div>
      </header>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 px-8 py-4">
          <div className="max-w-[1800px] mx-auto">
            <p className="text-red-700 font-medium">⚠️ Error: {error}</p>
          </div>
        </div>
      )}

      {/* Main Content - Full Width Layout */}
      <div className="flex-1 flex">
        {/* Left Sidebar - Configuration */}
        <div className="w-80 bg-white shadow-sm p-6 overflow-y-auto">
          <ConfigurationForm
            onStart={handleStart}
            disabled={status !== 'idle'}
          />
        </div>

        {/* Right - Conversation Area (Full Width) */}
        <div className="flex-1 flex flex-col">
          {status !== 'idle' && (
            <>
              <div className="flex-1 overflow-hidden">
                <DiscussionView messages={messages} participants={participants} />
              </div>
              <div className="bg-white shadow-sm p-4">
                <div className="max-w-4xl mx-auto">
                  <InterventionInput
                    onSend={handleIntervention}
                    onStop={handleStop}
                    disabled={false}
                    isRunning={status === 'running'}
                  />
                </div>
              </div>
            </>
          )}
          {status === 'idle' && (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500 text-xl">
                👈 Configure and start a discussion to see the conversation here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
