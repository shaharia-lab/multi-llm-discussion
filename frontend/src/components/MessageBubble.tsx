import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { Message, Participant } from '../types';

interface MessageBubbleProps {
  message: Message;
  participant: Participant | null;
}

export const MessageBubble: React.FC<MessageBubbleProps> = React.memo(({ message, participant }) => {
  const isHuman = message.sender === 'human';

  // Determine color based on sender
  const getColorClass = () => {
    if (isHuman) return 'bg-human/20 border-human/30';
    if (participant?.provider === 'openai') return 'bg-gpt/20 border-gpt/30';
    if (participant?.provider === 'anthropic') return 'bg-claude/20 border-claude/30';
    if (participant?.provider === 'bedrock') return 'bg-bedrock/20 border-bedrock/30';
    return 'bg-white/10 border-white/20';
  };

  const getSenderName = () => {
    if (isHuman) return 'You';
    return participant?.displayName || 'LLM';
  };

  const getSenderIcon = () => {
    if (isHuman) return '👤';
    if (participant?.provider === 'openai') return '🤖';
    if (participant?.provider === 'anthropic') return '🧠';
    if (participant?.provider === 'bedrock') return '☁️';
    return '💬';
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className={`backdrop-blur-sm rounded-2xl p-6 mb-4 border shadow-md hover:shadow-lg transition-all duration-300 ${getColorClass()}`}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{getSenderIcon()}</span>
          <span className="font-bold text-lg text-gray-900">{getSenderName()}</span>
        </div>
        <span className="text-xs text-gray-600 font-medium px-3 py-1 bg-gray-100 rounded-full">
          {formatTime(message.timestamp)}
        </span>
      </div>
      <div className="prose max-w-none">
        <ReactMarkdown>{message.content}</ReactMarkdown>
        {message.isStreaming && (
          <span className="inline-block w-2 h-5 bg-primary ml-1 animate-pulse rounded">▊</span>
        )}
      </div>
    </div>
  );
});
