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
    if (isHuman) return 'bg-purple-50';
    if (participant?.provider === 'openai') return 'bg-emerald-50';
    if (participant?.provider === 'anthropic') return 'bg-amber-50';
    return 'bg-gray-50';
  };

  const getSenderName = () => {
    if (isHuman) return 'You';
    return participant?.displayName || 'LLM';
  };

  const getSenderIcon = () => {
    if (isHuman) return '👤';
    if (participant?.provider === 'openai') return '🤖';
    if (participant?.provider === 'anthropic') return '🧠';
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
    <div className={`rounded-xl p-5 mb-4 ${getColorClass()}`}>
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getSenderIcon()}</span>
          <span className="font-bold text-base text-gray-900">{getSenderName()}</span>
        </div>
        <span className="text-xs text-gray-600">{formatTime(message.timestamp)}</span>
      </div>
      <div className="prose max-w-none">
        <ReactMarkdown>{message.content}</ReactMarkdown>
        {message.isStreaming && (
          <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse">▊</span>
        )}
      </div>
    </div>
  );
});
