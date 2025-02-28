import changeChat from "@/lib";
import {
  fetchUserProfile,
  getUserIds,
  processUserProfileAndBio,
} from "@/lib/utils";
import {
  AddMemberToChat,
  ChatMessage,
  MessageType,
  TypingIndicator,
  UpdateOnlineStatus,
  UserConversation,
} from "@/types";
import useActiveChatStore from "@/zustand/activeChatStore";
import { useAuthStore } from "@/zustand/authStore";
import { useChatStore } from "@/zustand/ChatsStore";
import { useMessagesStore } from "@/zustand/messageStore";
import useWebSocketStore from "@/zustand/socketStore";
import { useEffect, useState } from "react";

function useRegisterHandlers() {
  const [messageLoading, setMessageLoading] = useState<boolean>(false);

  const {
    chats,
    updateChat,
    updateMemberOnlineStatus,
    setTypingUser,
    removeTypingUser,
    updateUnreadCount,
    addMemberToChat,
    updateLatestMessage,
  } = useChatStore();

  const {
    updateActiveChatId,
    updateActiveChatName,
    activechatId,
    updateActiveChatPicture,
  } = useActiveChatStore();

  const updateMessages = useMessagesStore((state) => state.updateMessages);
  const userId = useAuthStore((state) => state.user?.id);
  const { socket, registerMessageHandler, sendMessage } = useWebSocketStore();

  useEffect(() => {
    registerMessageHandler(MessageType.SEND_MESSAGE, (message: ChatMessage) => {
      if (message.chatId === activechatId) {
        useMessagesStore.getState().appendMessage(message);
        const payload = {
          type: MessageType.UNREADMESSAGECOUNT,
          data: {
            chatId: activechatId,
          },
        };
        sendMessage(payload);
      }

      if (message.senderId !== userId && message.chatId !== activechatId) {
        updateUnreadCount(message.chatId);
      }

      updateLatestMessage(
        {
          message: message.message,
          senderId: message.senderId,
          sent_at: message.sent_at,
        },
        message.chatId
      );

      const prevIdx = chats.findIndex((chat) => chat.chatId === message.chatId);

      if (prevIdx !== -1) {
        if (chats[prevIdx].chatId != chats[0].chatId) {
          const moveTofirstChat = chats[prevIdx];
          const newList = [
            moveTofirstChat,
            ...chats.filter((_, index) => index !== prevIdx),
          ];
          updateChat(newList);
        }
      }
    });

    registerMessageHandler(
      MessageType.CREATE_CHAT,
      async (message: UserConversation) => {
        if (message.createdBy == userId) {
          updateActiveChatPicture("");
          updateActiveChatId(message.chatId);
          updateActiveChatName(message.chatName);
          updateMessages([]);
          setMessageLoading(true);
          const messages = await changeChat(message.chatId);
          setMessageLoading(false);
          updateMessages(messages);
          const messageArr = [message];
          const userIds = getUserIds(messageArr);
          const userProfiles = await fetchUserProfile(userIds);
          processUserProfileAndBio(messageArr, userId, userProfiles.users);
          message = messageArr[0];
          updateActiveChatPicture(message.profilePicture);
        }
        updateChat([...useChatStore.getState().chats, message]);
      }
    );

    registerMessageHandler(
      MessageType.ONLINE_STATUS,
      (message: UpdateOnlineStatus) => {
        updateMemberOnlineStatus(message.userId, message.isOnline);
      }
    );

    registerMessageHandler(MessageType.TYPING, (message: TypingIndicator) => {
      if (message.isTyping == true) {
        setTypingUser(message.chatId, message.userName);
      } else {
        removeTypingUser(message.chatId, message.userName);
      }
    });

    registerMessageHandler(
      MessageType.ADD_MEMBER,
      (message: AddMemberToChat) => {
        addMemberToChat(message.chatId, message.members);
      }
    );
  }, [activechatId, socket, chats]);

  return { messageLoading, setMessageLoading };
}

export default useRegisterHandlers;
