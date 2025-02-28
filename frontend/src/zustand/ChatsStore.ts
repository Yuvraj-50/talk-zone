import { create } from "zustand";
import {
  LatestMessage,
  UserConversation,
  UserConversationChatMembers,
} from "../types";
import { immer } from "zustand/middleware/immer";

interface Chats {
  chats: UserConversation[];
  typingUsers: Record<number, string[]>;
}

interface ChatsAction {
  updateChat: (chats: UserConversation[]) => void;
  updateMemberOnlineStatus: (id: number, status: boolean) => void;
  setTypingUser: (chatId: number, userName: string) => void;
  removeTypingUser: (chatId: number, userName: string) => void;
  updateUnreadCount: (chatId: number) => void;
  resetUnreadCount: (chatId: number) => void;
  addMemberToChat: (
    chatId: number,
    chatMembers: UserConversationChatMembers[]
  ) => void;
  updateLatestMessage: (newMessage: LatestMessage, chatId: number) => void;
}

export const useChatStore = create<Chats & ChatsAction>()(
  immer((set) => ({
    chats: [],
    typingUsers: {},

    updateChat: (chat: UserConversation[]) =>
      set((state) => {
        state.chats = chat;
      }),

    updateMemberOnlineStatus: (id: number, status: boolean) =>
      set((state) => {
        state.chats.forEach((chat) => {
          chat.chatMembers.forEach((member) => {
            if (member.userId === id) {
              member.isOnline = status;
            }
          });
        });
      }),

    setTypingUser: (chatId: number, userName: string) =>
      set((state) => {
        const prevTyping = new Set(state.typingUsers[chatId] || []);
        prevTyping.add(userName);
        state.typingUsers[chatId] = [...prevTyping];
      }),

    removeTypingUser: (chatId: number, userName: string) =>
      set((state) => {
        const filtered = (state.typingUsers[chatId] || []).filter(
          (user) => user !== userName
        );

        if (filtered.length) {
          state.typingUsers[chatId] = filtered;
        } else {
          delete state.typingUsers[chatId];
        }
      }),

    updateUnreadCount: (chatId: number) =>
      set((state) => {
        const chat = state.chats.find((chat) => chat.chatId == chatId);
        if (chat) {
          chat.unreadCount++;
        }
      }),

    resetUnreadCount: (chatId: number) =>
      set((state) => {
        const chat = state.chats.find((chat) => chat.chatId == chatId);
        if (chat) {
          chat.unreadCount = 0;
        }
      }),

    addMemberToChat: (
      chatId: number,
      chatMembers: UserConversationChatMembers[]
    ) =>
      set((state) => {
        const chat = state.chats.find((chat) => chat.chatId == chatId);
        if (chat) {
          chat.chatMembers = [...chat.chatMembers, ...chatMembers];
        }
      }),

    updateLatestMessage: (newMessage: LatestMessage, chatId: number) =>
      set((state) => {
        const chat = state.chats.find((chat) => chat.chatId == chatId);
        if (chat) {
          chat.latestMessage = newMessage;
        }
      }),
  }))
);
