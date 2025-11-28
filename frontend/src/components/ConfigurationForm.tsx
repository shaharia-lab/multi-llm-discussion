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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Discussion Setup</h2>
        <p className="text-sm text-gray-600">Configure your multi-LLM discussion</p>
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
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 placeholder-gray-400 resize-y transition-all shadow-sm"
          required
        />
        <div className="text-xs text-gray-500 mt-2 flex justify-between items-center">
          <span>Be specific and clear</span>
          <span className="font-medium">{topic.length}/1000</span>
        </div>
      </div>

      {/* Primary LLM - Collapsible */}
      <div className="flex-shrink-0">
        <button
          type="button"
          onClick={() => setPrimaryExpanded(!primaryExpanded)}
          disabled={disabled}
          className="w-full px-4 py-3 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl flex items-center justify-between hover:from-emerald-100 hover:to-green-100 transition-all shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-gpt shadow-lg"></div>
            <span className="font-semibold text-gray-900 text-sm">Primary LLM</span>
            <span className="text-xs text-gray-600 px-2 py-1 bg-white/60 rounded-full font-medium">
              {MODEL_OPTIONS.find((m) => m.id === primaryModelId)?.name}
            </span>
          </div>
          <svg
            className={`w-5 h-5 text-gray-600 transition-transform ${
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
          <div className="mt-3 p-4 bg-white border border-gray-200 rounded-xl space-y-4 shadow-sm">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Select Model</label>
              <select
                value={primaryModelId}
                onChange={(e) => setPrimaryModelId(e.target.value as ModelId)}
                disabled={disabled}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 text-sm"
              >
                {MODEL_OPTIONS.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">System Prompt</label>
              <textarea
                value={primaryPrompt}
                onChange={(e) => setPrimaryPrompt(e.target.value)}
                placeholder="System prompt for primary LLM..."
                maxLength={2000}
                disabled={disabled}
                rows={3}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 text-sm resize-y placeholder-gray-400"
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
          className="w-full px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl flex items-center justify-between hover:from-amber-100 hover:to-orange-100 transition-all shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-claude shadow-lg"></div>
            <span className="font-semibold text-gray-900 text-sm">Critic LLM</span>
            <span className="text-xs text-gray-600 px-2 py-1 bg-white/60 rounded-full font-medium">
              {MODEL_OPTIONS.find((m) => m.id === criticModelId)?.name}
            </span>
          </div>
          <svg
            className={`w-5 h-5 text-gray-600 transition-transform ${
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
          <div className="mt-3 p-4 bg-white border border-gray-200 rounded-xl space-y-4 shadow-sm">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Select Model</label>
              <select
                value={criticModelId}
                onChange={(e) => setCriticModelId(e.target.value as ModelId)}
                disabled={disabled}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 text-sm"
              >
                {MODEL_OPTIONS.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">System Prompt</label>
              <textarea
                value={criticPrompt}
                onChange={(e) => setCriticPrompt(e.target.value)}
                placeholder="System prompt for critic LLM..."
                maxLength={2000}
                disabled={disabled}
                rows={3}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 text-sm resize-y placeholder-gray-400"
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
          className="w-full px-6 py-3.5 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-xl font-semibold hover:from-primary-hover hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          {disabled ? 'Discussion Running...' : 'Start Discussion'}
        </button>
      </div>
    </form>
  );
};
