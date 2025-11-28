export type ModelId = 'gpt-5.1-2025-11-13' | 'gpt-4' | 'gpt-3.5-turbo' | 'claude-sonnet-4-5-20250929' | 'claude-3-opus-20240229' | 'eu.anthropic.claude-sonnet-4-5-20250929-v1:0' | 'eu.anthropic.claude-opus-4-20250514-v1:0';
export type Provider = 'openai' | 'anthropic' | 'bedrock';
export type ParticipantRole = 'primary' | 'critic';
export type DiscussionStatus = 'idle' | 'running' | 'stopped';

export interface Participant {
  id: string;
  modelId: ModelId;
  provider: Provider;
  displayName: string;
  systemPrompt: string;
  role: ParticipantRole;
}

export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface ModelOption {
  id: ModelId;
  name: string;
  provider: Provider;
}

export const MODEL_OPTIONS: ModelOption[] = [
  { id: 'gpt-5.1-2025-11-13', name: 'GPT-5.1', provider: 'openai' },
  { id: 'gpt-4', name: 'GPT-4', provider: 'openai' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai' },
  { id: 'claude-sonnet-4-5-20250929', name: 'Claude Sonnet 4.5', provider: 'anthropic' },
  { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', provider: 'anthropic' },
  { id: 'eu.anthropic.claude-sonnet-4-5-20250929-v1:0', name: 'Claude Sonnet 4.5 (Bedrock)', provider: 'bedrock' },
  { id: 'eu.anthropic.claude-opus-4-20250514-v1:0', name: 'Claude Opus 4 (Bedrock)', provider: 'bedrock' },
];

export const DEFAULT_PRIMARY_PROMPT = `You are participating in a structured discussion. Your role is to present ideas, proposals, and arguments on the given topic. Consider feedback from others and refine your position accordingly. Be thoughtful and constructive.`;

export const DEFAULT_CRITIC_PROMPT = `You are participating as a critical evaluator. Your role is to analyze the Primary's proposals, identify weaknesses, potential issues, and suggest improvements. Be constructive but thorough in your critique.`;
