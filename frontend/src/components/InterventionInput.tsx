import React, { useState } from 'react';

interface InterventionInputProps {
  onSend: (message: string) => void;
  onStop: () => void;
  disabled: boolean;
  isRunning: boolean;
}

export const InterventionInput: React.FC<InterventionInputProps> = ({
  onSend,
  onStop,
  disabled,
  isRunning,
}) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message to intervene in the discussion..."
          disabled={disabled || !isRunning}
          className="flex-1 px-4 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-gray-900 placeholder-gray-500 disabled:bg-gray-100 disabled:text-gray-500 transition-all"
        />
        <button
          type="submit"
          disabled={disabled || !isRunning || !message.trim()}
          className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all"
        >
          Send
        </button>
      </form>

      {isRunning && (
        <button
          onClick={onStop}
          disabled={disabled}
          className="w-full px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all"
        >
          Stop Discussion
        </button>
      )}
    </div>
  );
};
