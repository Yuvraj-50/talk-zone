import { create } from "zustand";

interface ActiveChatState {
  activechatId: number;
  activeChatName: string;
  isOnline: boolean;
}

interface ActiveChatAction {
  updateActiveChatId: (id: number) => void;
  updateActiveChatName: (name: string) => void;
  updateOnlineStatus: (status: boolean) => void;
}

const useActiveChatStore = create<ActiveChatState & ActiveChatAction>(
  (set) => ({
    activechatId: 0,
    activeChatName: "",
    isOnline: false,
    updateActiveChatId(id: number) {
      set({ activechatId: id });
    },
    updateActiveChatName(name: string) {
      set({ activeChatName: name });
    },
    updateOnlineStatus(status: boolean) {
      set({ isOnline: status });
    },
  })
);

export default useActiveChatStore;
