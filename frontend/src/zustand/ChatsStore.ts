import { create } from "zustand";
import { UserConversation } from "../types";
import { immer } from "zustand/middleware/immer";

type Chats = {
  chats: UserConversation[];
  updateChat: (chats: UserConversation[]) => void;
  updateMemberOnlineStatus: (id: number, status: boolean) => void;
};

export const useChatStore = create<Chats>()(
  immer((set) => ({
    chats: [],

    updateChat: (chat: UserConversation[]) =>
      set((state) => {
        state.chats = chat;
      }),

    updateMemberOnlineStatus: (id: number, status: boolean) =>
      set((state) => {
        state.chats.forEach((chat) => {
          chat.chatMembers.forEach((member) => {
            if (member.userId == id) {
              member.isOnline = status;
            }
          });
        });
      }),
  }))
);
