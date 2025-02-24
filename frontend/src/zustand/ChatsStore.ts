import { create } from "zustand";
import { UserConversation, UserConversationChatMembers } from "../types";
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
  // fetchUserProfile: (chatIds: number[]) => void;
  // updateProfileAndBio: (users: UpdateProfileAndBio[]) => void;
}

export const useChatStore = create<Chats & ChatsAction>()(
  immer((set, get) => ({
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

    // fetchUserProfile: (chatIds: number[]) =>
    //   set(async () => {
    //     const response = await axios.post<{ users: UpdateProfileAndBio[] }>(
    //       "http://localhost:9000/api/v1/auth/userProfiles",
    //       { users: chatIds },
    //       { withCredentials: true }
    //     );

    //     get().updateProfileAndBio(response.data.users);
    //   }),

    // updateProfileAndBio: (users: UpdateProfileAndBio[]) =>
    //   set((state) => {
    //     state.chats.forEach((chat) => {
    //       if (chat.profilePicture == null) {
    //         const user = useAuthStore.getState().user;
    //         if (user && user.id) {
    //           const profilePicture = evalActiveChatProfile(chat, user.id);
    //           chat.profilePicture = profilePicture;
    //         }
    //       }
    //       chat.chatMembers.forEach((member) => {
    //         const userUpdate = users.find((user) => user.id === member.userId);
    //         if (userUpdate) {
    //           member.profilePicture = userUpdate.profileUrl;
    //           member.bio = userUpdate.bio;
    //         }
    //       });
    //     });
    //   }),
  }))
);
