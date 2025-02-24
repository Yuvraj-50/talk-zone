import { create } from "zustand";

interface ActiveChatState {
  activechatId: number;
  activeChatName: string;
  activeChatPicture: string;
  isOnline: boolean;
}

interface ActiveChatAction {
  updateActiveChatId: (id: number) => void;
  updateActiveChatName: (name: string) => void;
  updateOnlineStatus: (status: boolean) => void;
  updateActiveChatPicture: (picture: string) => void;
}

const useActiveChatStore = create<ActiveChatState & ActiveChatAction>(
  (set) => ({
    activechatId: 0,
    activeChatName: "",
    isOnline: false,
    activeChatPicture: "",
    updateActiveChatId(id: number) {
      set({ activechatId: id });
    },
    updateActiveChatName(name: string) {
      set({ activeChatName: name });
    },
    updateOnlineStatus(status: boolean) {
      set({ isOnline: status });
    },
    updateActiveChatPicture(picture: string) {
      set({ activeChatPicture: picture });
    },
  })
);

export default useActiveChatStore;
