import { create } from 'zustand';
import type { Message, Participant, DiscussionStatus } from './types';

interface DiscussionStore {
  // State
  topic: string;
  participants: Participant[];
  messages: Message[];
  status: DiscussionStatus;
  discussionId: string | null;
  error: string | null;

  // Actions
  setTopic: (topic: string) => void;
  setParticipants: (participants: Participant[]) => void;
  addMessage: (message: Message) => void;
  updateStreamingMessage: (messageId: string, content: string) => void;
  completeStreamingMessage: (messageId: string) => void;
  setStatus: (status: DiscussionStatus) => void;
  setDiscussionId: (id: string) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  topic: '',
  participants: [],
  messages: [],
  status: 'idle' as DiscussionStatus,
  discussionId: null,
  error: null,
};

export const useDiscussionStore = create<DiscussionStore>((set) => ({
  ...initialState,

  setTopic: (topic) => set({ topic }),

  setParticipants: (participants) => set({ participants }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  updateStreamingMessage: (messageId, content) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, content, isStreaming: true } : msg
      ),
    })),

  completeStreamingMessage: (messageId) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, isStreaming: false } : msg
      ),
    })),

  setStatus: (status) => set({ status }),

  setDiscussionId: (discussionId) => set({ discussionId }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));
