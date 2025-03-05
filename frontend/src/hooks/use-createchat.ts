import { changeChat } from "@/lib";
import { ChatMembers, CHATTYPE, MessageType, UserConversation } from "@/types";
import { useAuthStore } from "@/zustand/authStore";
import { useChatStore } from "@/zustand/ChatsStore";
import useLoadersStore from "@/zustand/loaderStore";
import useWebSocketStore from "@/zustand/socketStore";

const useCreateChat = () => {
  const user = useAuthStore((state) => state.user);
  const chats = useChatStore((state) => state.chats);
  const { socket, sendMessage } = useWebSocketStore();
  const setLoading = useLoadersStore((state) => state.setLoading);

  function findExistingChat(chatMembers: ChatMembers[]) {
    const sortedMemberList = [...chatMembers].sort((a, b) =>
      a.userEmail.toLowerCase().localeCompare(b.userEmail.toLowerCase())
    );

    for (const chat of chats) {
      if (chat.chatType == CHATTYPE.GROUPCHAT) continue;

      const sortedMember = [...chat.chatMembers].sort((a, b) =>
        a.userEmail.toLowerCase().localeCompare(b.userEmail.toLowerCase())
      );

      if (
        sortedMember[0].userEmail == sortedMemberList[0].userEmail &&
        sortedMember[1].userEmail == sortedMemberList[1].userEmail
      ) {
        return chat;
      }
    }

    return null;
  }

  async function handleExistingChat(chat: UserConversation) {
    await changeChat(chat);
  }

  async function createNewChat(
    members: ChatMembers[],
    chatType: CHATTYPE,
    profilePicture: string | null = null,
    groupName?: string
  ) {
    if (socket) {
      const data = {
        members,
        chatType,
        groupName: null,
        createrId: user?.id,
      };

      const payload = {
        type: MessageType.CREATE_CHAT,
        data:
          chatType == CHATTYPE.GROUPCHAT
            ? { ...data, profilePicture, groupName }
            : data,
      };
      sendMessage(payload);
    }
  }

  function createChat(
    member: ChatMembers[],
    chatType: CHATTYPE,
    profilePicture: string | null = null,
    groupName?: string
  ) {
    if (chatType == CHATTYPE.ONETOONE) {
      const existingChat = findExistingChat(member);
      if (existingChat) {
        handleExistingChat(existingChat);
        setLoading("CREATE_CHAT", false);
        return;
      } else {
        createNewChat(member, chatType);
      }
    } else {
      if (!groupName) {
        return "groupName is compulsary";
      }
      createNewChat(member, chatType, profilePicture, groupName);
    }
  }

  return { createChat, findExistingChat };
};

export default useCreateChat;
