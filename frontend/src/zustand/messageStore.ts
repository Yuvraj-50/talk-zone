import { create } from "zustand";
import { ChatMessage } from "../types";

type Messages = {
  messages: ChatMessage[];
  updateMessages: (messages: ChatMessage[]) => void;
  appendMessage: (newmessage: ChatMessage) => void;
};

export const useMessagesStore = create<Messages>()((set) => ({
  messages: [],
  updateMessages: (messages: ChatMessage[]) => set({ messages: messages }),
  appendMessage: (newmessage: ChatMessage) =>
    set((state) => ({ messages: [...state.messages, newmessage] })),
}));
