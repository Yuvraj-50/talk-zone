import { create } from "zustand";
import { ChatMessage } from "../types";

type Messages = {
  messages: ChatMessage[];
};

interface MessageStoreAction {
  updateMessages: (messages: ChatMessage[]) => void;
  appendMessage: (newmessage: ChatMessage) => void;
  reset: () => void;
}

export const useMessagesStore = create<Messages & MessageStoreAction>()(
  (set) => ({
    messages: [],
    updateMessages: (messages: ChatMessage[]) => set({ messages: messages }),
    appendMessage: (newmessage: ChatMessage) =>
      set((state) => ({ messages: [...state.messages, newmessage] })),
    reset() {
      set({ messages: [] });
    },
  })
);
