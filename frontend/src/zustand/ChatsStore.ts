import { create } from "zustand";
import { UserConversation } from "../types";

type Chats = {
  chats: UserConversation[];
  updateChat: (chats: UserConversation[]) => void;
};

export const useChatStore = create<Chats>()((set) => ({
  chats: [],
  updateChat: (chat: UserConversation[]) => set({ chats: chat }),
}));
