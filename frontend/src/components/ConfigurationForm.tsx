import React, { useState } from 'react';
import type { ModelId } from '../types';
import {
  MODEL_OPTIONS,
  DEFAULT_PRIMARY_PROMPT,
  DEFAULT_CRITIC_PROMPT,
} from '../types';

interface ConfigurationFormProps {
  onStart: (
    topic: string,
    primaryModelId: ModelId,
    primaryPrompt: string,
    criticModelId: ModelId,
    criticPrompt: string
  ) => void;
  disabled: boolean;
}

export const ConfigurationForm: React.FC<ConfigurationFormProps> = ({
  onStart,
  disabled,
}) => {
  const [topic, setTopic] = useState('');
  const [primaryModelId, setPrimaryModelId] = useState<ModelId>('gpt-5.1-2025-11-13');
  const [primaryPrompt, setPrimaryPrompt] = useState(DEFAULT_PRIMARY_PROMPT);
  const [criticModelId, setCriticModelId] = useState<ModelId>('claude-sonnet-4-5-20250929');
  const [criticPrompt, setCriticPrompt] = useState(DEFAULT_CRITIC_PROMPT);
  const [primaryExpanded, setPrimaryExpanded] = useState(false);
  const [criticExpanded, setCriticExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onStart(topic, primaryModelId, primaryPrompt, criticModelId, criticPrompt);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col space-y-6">
      <div className="flex-shrink-0">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Discussion Setup</h2>
        <p className="text-xs text-gray-600">Configure your multi-LLM discussion</p>
      </div>

      {/* Topic - Large Expandable Text Area */}
      <div className="flex-shrink-0">
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Discussion Topic <span className="text-red-500">*</span>
        </label>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter your discussion topic here... Be specific and clear about what you want the LLMs to discuss."
          maxLength={1000}
          disabled={disabled}
          rows={8}
          className="w-full px-3 py-3 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white text-gray-900 placeholder-gray-500 resize-y transition-all"
          required
        />
        <div className="text-xs text-gray-600 mt-1">
          {topic.length}/1000 characters
        </div>
      </div>

      {/* Primary LLM - Collapsible */}
      <div className="flex-shrink-0">
        <button
          type="button"
          onClick={() => setPrimaryExpanded(!primaryExpanded)}
          disabled={disabled}
          className="w-full px-3 py-2 bg-gray-50 rounded-lg flex items-center justify-between hover:bg-gray-100 transition-all"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gpt"></div>
            <span className="font-medium text-gray-900 text-sm">Primary LLM</span>
            <span className="text-xs text-gray-600">
              ({MODEL_OPTIONS.find((m) => m.id === primaryModelId)?.name})
            </span>
          </div>
          <svg
            className={`w-4 h-4 text-gray-600 transition-transform ${
              primaryExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {primaryExpanded && (
          <div className="mt-2 p-3 bg-gray-50 rounded-lg space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-900 mb-1">Select Model</label>
              <select
                value={primaryModelId}
                onChange={(e) => setPrimaryModelId(e.target.value as ModelId)}
                disabled={disabled}
                className="w-full px-2 py-2 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 text-sm"
              >
                {MODEL_OPTIONS.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-900 mb-1">System Prompt</label>
              <textarea
                value={primaryPrompt}
                onChange={(e) => setPrimaryPrompt(e.target.value)}
                placeholder="System prompt for primary LLM..."
                maxLength={2000}
                disabled={disabled}
                rows={3}
                className="w-full px-2 py-2 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 text-xs resize-y"
              />
            </div>
          </div>
        )}
      </div>

      {/* Critic LLM - Collapsible */}
      <div className="flex-shrink-0">
        <button
          type="button"
          onClick={() => setCriticExpanded(!criticExpanded)}
          disabled={disabled}
          className="w-full px-3 py-2 bg-gray-50 rounded-lg flex items-center justify-between hover:bg-gray-100 transition-all"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-claude"></div>
            <span className="font-medium text-gray-900 text-sm">Critic LLM</span>
            <span className="text-xs text-gray-600">
              ({MODEL_OPTIONS.find((m) => m.id === criticModelId)?.name})
            </span>
          </div>
          <svg
            className={`w-4 h-4 text-gray-600 transition-transform ${
              criticExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {criticExpanded && (
          <div className="mt-2 p-3 bg-gray-50 rounded-lg space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-900 mb-1">Select Model</label>
              <select
                value={criticModelId}
                onChange={(e) => setCriticModelId(e.target.value as ModelId)}
                disabled={disabled}
                className="w-full px-2 py-2 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 text-sm"
              >
                {MODEL_OPTIONS.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-900 mb-1">System Prompt</label>
              <textarea
                value={criticPrompt}
                onChange={(e) => setCriticPrompt(e.target.value)}
                placeholder="System prompt for critic LLM..."
                maxLength={2000}
                disabled={disabled}
                rows={3}
                className="w-full px-2 py-2 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 text-xs resize-y"
              />
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex-shrink-0 mt-auto">
        <button
          type="submit"
          disabled={disabled || !topic.trim()}
          className="w-full px-4 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all"
        >
          {disabled ? 'Discussion Running...' : 'Start Discussion'}
        </button>
      </div>
    </form>
  );
};
