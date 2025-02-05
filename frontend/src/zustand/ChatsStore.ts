import { create } from "zustand";

type ChatItem = {
  chatId: number;
  chatName: string;
  chatType: "oneToOne" | "groupchat";
  chatMembers: {
    userId: number;
    userName: string;
  }[];
};

type Chats = {
  chats: ChatItem[];
  updateChat: (chats: ChatItem[]) => void;
};

export const useChatStore = create<Chats>()((set) => ({
  chats: [],
  updateChat: (chat: ChatItem[]) => set({ chats: chat }),
}));
