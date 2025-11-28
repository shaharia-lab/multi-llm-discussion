export type ModelId = 'gpt-5.1-2025-11-13' | 'gpt-4' | 'gpt-3.5-turbo' | 'claude-sonnet-4-5-20250929' | 'claude-3-opus-20240229' | 'eu.anthropic.claude-sonnet-4-5-20250929-v1:0' | 'eu.anthropic.claude-opus-4-20250514-v1:0';
export type Provider = 'openai' | 'anthropic' | 'bedrock';
export type ParticipantRole = 'primary' | 'critic';
export type DiscussionStatus = 'running' | 'stopped';

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
  sender: string; // 'human' or participant ID
  content: string;
  timestamp: Date;
}

export interface Discussion {
  id: string;
  topic: string;
  participants: Participant[];
  messages: Message[];
  status: DiscussionStatus;
}

export interface StreamEvent {
  type: 'token' | 'complete' | 'error' | 'message_start';
  participantId?: string;
  token?: string;
  messageId?: string;
  error?: string;
  message?: Message;
}

export interface StartDiscussionRequest {
  topic: string;
  participants: Participant[];
}

export interface InterventionRequest {
  content: string;
}
