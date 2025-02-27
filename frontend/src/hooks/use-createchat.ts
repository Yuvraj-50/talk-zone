import changeChat from "@/lib";
import { ChatMembers, CHATTYPE, MessageType, UserConversation } from "@/types";
import useActiveChatStore from "@/zustand/activeChatStore";
import { useAuthStore } from "@/zustand/authStore";
import { useChatStore } from "@/zustand/ChatsStore";
import { useMessagesStore } from "@/zustand/messageStore";
import useWebSocketStore from "@/zustand/socketStore";

const useCreateChat = () => {
  const user = useAuthStore((state) => state.user);
  const chats = useChatStore((state) => state.chats);
  const updateMessages = useMessagesStore((state) => state.updateMessages);
  const { activechatId, updateActiveChatId, updateActiveChatName, updateActiveChatPicture } =
    useActiveChatStore();
  const resetUnreadCount = useChatStore((state) => state.resetUnreadCount);
  const { socket, sendMessage } = useWebSocketStore();

  function findExistingChat(chatMembers: ChatMembers[]) {
    const sortedMemberList = [...chatMembers].sort((a, b) =>
      a.userEmail.toLowerCase().localeCompare(b.userEmail.toLowerCase())
    );

    for (const chat of chats) {
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
    if(activechatId == chat.chatId) return;
    updateMessages([]);
    updateActiveChatId(chat.chatId);
    updateActiveChatName(chat.chatName);
    updateActiveChatPicture(chat.profilePicture);
    const messages = await changeChat(chat.chatId);
    resetUnreadCount(chat.chatId);
    updateMessages(messages);
    const chatToChange = chats.find((chat) => chat.chatId == chat.chatId);
    if (socket && (chatToChange?.unreadCount ?? 0) > 0) {
      const payload = {
        type: MessageType.UNREADMESSAGECOUNT,
        data: {
          chatId: chat.chatId,
        },
      };

      sendMessage(payload);
    }
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
  //   const payload = {
  //   type: MessageType.CREATE_CHAT,
  //   data: {
  //     members: updatedMemberList,
  //     chatType: CHATTYPE.GROUPCHAT,
  //     groupName: groupName,
  //     createrId: user.id,
  //     profilePicture: profilePicture,
  //   },
  // };
  // sendMessage(payload);

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
