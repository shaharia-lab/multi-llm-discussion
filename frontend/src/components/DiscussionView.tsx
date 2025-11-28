import React, { useEffect, useRef, useState } from 'react';
import { MessageBubble } from './MessageBubble';
import type { Message, Participant } from '../types';

interface DiscussionViewProps {
  messages: Message[];
  participants: Participant[];
}

export const DiscussionView: React.FC<DiscussionViewProps> = ({
  messages,
  participants,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getParticipant = (senderId: string): Participant | null => {
    if (senderId === 'human') return null;
    return participants.find((p) => p.id === senderId) || null;
  };

  const copyAsMarkdown = () => {
    const markdown = messages
      .map((message) => {
        const participant = getParticipant(message.sender);
        const sender = message.sender === 'human' ? 'You' : participant?.displayName || 'LLM';
        const timestamp = new Date(message.timestamp).toLocaleString();
        return `### ${sender} (${timestamp})\n\n${message.content}\n`;
      })
      .join('\n---\n\n');

    navigator.clipboard.writeText(markdown).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500 text-lg">Discussion will appear here once started...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header with Copy Button */}
      <div className="bg-white shadow-sm px-6 py-3 flex justify-between items-center flex-shrink-0">
        <h3 className="font-semibold text-gray-900">Conversation</h3>
        <button
          onClick={copyAsMarkdown}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy as Markdown
            </>
          )}
        </button>
      </div>

      {/* Messages Container - Full height */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-5xl mx-auto">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              participant={getParticipant(message.sender)}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
};
