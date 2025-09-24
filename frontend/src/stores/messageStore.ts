import { create } from 'zustand';
import { persist, createJSONStorage, PersistOptions } from 'zustand/middleware';

export interface MessageData {
  _id?: string;
  senderName: string;
  senderId: string;
  timestamp: string;
  content: string;
}

interface MessageState {
  message: MessageData[];
  setMessage: (message: MessageData[]) => void;
  addMessage: (message: MessageData) => void;
  getMessage: () => MessageData[];
  deleteMessage: (messageId: string) => void;
}

type MyPersist = (
  config: (set: any, get: any, api: any) => MessageState,
  options: PersistOptions<MessageState>
) => (set: any, get: any, api: any) => MessageState;

export const useMessage = create<MessageState>(
  (persist as MyPersist)(
    (set, get) => ({
      message: [],
      setMessage: (message) => set({ message }),
      addMessage: (message) => set((state:MessageState) => ({ message: [...state.message, message] })),
      getMessage: () => get().message,
      deleteMessage: (messageId) => set((state:MessageState) => ({
        message: state.message.filter(msg => msg._id !== messageId)
      })),
    }),
    {
      name: 'message-storage', // unique name
      storage: createJSONStorage(() => localStorage), // use `localStorage` as storage
    }
  )
);
