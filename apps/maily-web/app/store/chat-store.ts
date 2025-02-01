import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface Message {
  id: number;
  content: string;
  type: 'user' | 'assistant' | 'system' | 'error' | 'warning' | 'success';
  timestamp: string;
  status?: 'sending' | 'sent' | 'failed' | 'generating';
  metadata?: {
    progress?: number;
    error?: string;
    retryCount?: number;
    expandable?: boolean;
    expanded?: boolean;
    actions?: Array<{
      label: string;
      action: string;
      type?: 'primary' | 'secondary' | 'destructive';
    }>;
    contextMenu?: Array<{
      label: string;
      action: string;
      icon?: string;
    }>;
    debug?: any;
  };
}

interface CommandHistory {
  command: string;
  timestamp: string;
  successful: boolean;
}

interface ChatState {
  messages: Message[];
  commandHistory: CommandHistory[];
  isProcessing: boolean;
  currentOperation: {
    type: string;
    progress: number;
    status: string;
    cancelable: boolean;
  } | null;
  suggestions: Array<{
    text: string;
    type: 'command' | 'template' | 'improvement';
    category?: string;
  }>;
  templates: Array<{
    id: string;
    name: string;
    category: string;
    content: string;
  }>;
  agents: Array<{
    id: string;
    name: string;
    status: 'idle' | 'working' | 'error';
    task?: string;
  }>;
  // Actions
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateMessage: (id: number, update: Partial<Message>) => void;
  setProcessing: (isProcessing: boolean) => void;
  setOperation: (operation: ChatState['currentOperation']) => void;
  addToCommandHistory: (command: string, successful: boolean) => void;
  updateSuggestions: (suggestions: ChatState['suggestions']) => void;
  toggleMessageExpanded: (id: number) => void;
  retryMessage: (id: number) => void;
  cancelOperation: () => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>()(
  devtools(
    persist(
      (set, get) => ({
        messages: [],
        commandHistory: [],
        isProcessing: false,
        currentOperation: null,
        suggestions: [],
        templates: [],
        agents: [],

        addMessage: (message) =>
          set((state) => ({
            messages: [
              ...state.messages,
              {
                ...message,
                id: Date.now(),
                timestamp: new Date().toISOString(),
              },
            ],
          })),

        updateMessage: (id, update) =>
          set((state) => ({
            messages: state.messages.map((msg) =>
              msg.id === id ? { ...msg, ...update } : msg
            ),
          })),

        setProcessing: (isProcessing) => set({ isProcessing }),

        setOperation: (operation) => set({ currentOperation: operation }),

        addToCommandHistory: (command, successful) =>
          set((state) => ({
            commandHistory: [
              {
                command,
                timestamp: new Date().toISOString(),
                successful,
              },
              ...state.commandHistory,
            ].slice(0, 100), // Keep last 100 commands
          })),

        updateSuggestions: (suggestions) => set({ suggestions }),

        toggleMessageExpanded: (id) =>
          set((state) => ({
            messages: state.messages.map((msg) =>
              msg.id === id && msg.metadata?.expandable
                ? {
                    ...msg,
                    metadata: {
                      ...msg.metadata,
                      expanded: !msg.metadata.expanded,
                    },
                  }
                : msg
            ),
          })),

        retryMessage: (id) => {
          const message = get().messages.find((msg) => msg.id === id);
          if (message) {
            set((state) => ({
              messages: state.messages.map((msg) =>
                msg.id === id
                  ? {
                      ...msg,
                      status: 'sending',
                      metadata: {
                        ...msg.metadata,
                        retryCount: (msg.metadata?.retryCount || 0) + 1,
                      },
                    }
                  : msg
              ),
            }));
            // TODO: Implement actual retry logic
          }
        },

        cancelOperation: () => {
          const operation = get().currentOperation;
          if (operation?.cancelable) {
            // TODO: Implement cancellation logic
            set({ currentOperation: null });
          }
        },

        clearMessages: () => set({ messages: [] }),
      }),
      {
        name: 'chat-storage',
        partialize: (state) => ({
          messages: state.messages,
          commandHistory: state.commandHistory,
          templates: state.templates,
        }),
      }
    )
  )
); 