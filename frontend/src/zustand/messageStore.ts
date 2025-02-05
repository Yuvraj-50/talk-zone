import { create } from "zustand";

enum Role {
  "MEMBER",
  "ADMIN",
}

type MessageItem = {
  id: number;
  message: string;
  senderId: number;
  sent_at: string;
  chatId: number;
  role: Role;
  userId: number;
  userName: string;
};

type Messages = {
  messages: MessageItem[];
  updateMessages: (messages: MessageItem[]) => void;
  appendMessage: (newmessage: MessageItem) => void;
};

export const useMessagesStore = create<Messages>()((set) => ({
  messages: [],
  updateMessages: (messages: MessageItem[]) => set({ messages: messages }),
  appendMessage: (newmessage: MessageItem) =>
    set((state) => ({ messages: [...state.messages, newmessage] })),
}));
