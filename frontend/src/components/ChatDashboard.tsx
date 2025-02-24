import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import ChatUsers from "./sidebar/UserChats/ChatUsers";
import { useMessagesStore } from "../zustand/messageStore";
import MessageArea from "./MessagingArea/MessageArea";
import { useChatStore } from "../zustand/ChatsStore";
import useWebSocketStore from "../zustand/socketStore";
import useActiveChatStore from "../zustand/activeChatStore";
import changeChat from "../lib";
import { useAuthStore } from "../zustand/authStore";
import {
  AddMemberToChat,
  ChatMessage,
  MessageType,
  TypingIndicator,
  UpdateOnlineStatus,
  UserConversation,
} from "../types";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";
import NoChatSelected from "./NoChatSelected";
import {
  fetchUserProfile,
  getUserIds,
  processUserProfileAndBio,
} from "@/lib/utils";

function ChatDashboard() {
  const [messageLoading, setMessageLoading] = useState<boolean>(false);

  const updateMessages = useMessagesStore((state) => state.updateMessages);
  const userId = useAuthStore((state) => state.user?.id);
  const { socket, registerMessageHandler, connect, disconnect, sendMessage } =
    useWebSocketStore();
  const {
    updateActiveChatId,
    updateActiveChatName,
    activechatId,
    updateActiveChatPicture,
  } = useActiveChatStore();
  const {
    chats,
    updateChat,
    updateMemberOnlineStatus,
    setTypingUser,
    removeTypingUser,
    updateUnreadCount,
    addMemberToChat,
  } = useChatStore();

  useEffect(() => {
    connect("ws://localhost:3000");
    return () => {
      disconnect();
    };
  }, []);

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

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b">
        <Navbar />
      </div>

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel
          defaultSize={30}
          minSize={20}
          maxSize={40}
          className="flex flex-col border-r"
        >
          <ChatUsers setMessageLoading={setMessageLoading} />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={70} className="flex flex-col">
          {activechatId ? (
            <MessageArea messageLoading={messageLoading} />
          ) : (
            <NoChatSelected />
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default ChatDashboard;
