import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import CreateChat from "./sidebar/CreateNewChat/CreateChat";
import ChatUsers from "./sidebar/UserChats/ChatUsers";
import { useMessagesStore } from "../zustand/messageStore";
import MessageArea from "./MessagingArea/MessageArea";
import { useChatStore } from "../zustand/ChatsStore";
import useWebSocketStore from "../zustand/socketStore";
import MessageInput from "./MessagingArea/MessageInput";
import useActiveChatStore from "../zustand/activeChatStore";
import changeChat from "../utils";
import { useAuthStore } from "../zustand/authStore";
import {
  ChatMessage,
  MessageType,
  TypingIndicator,
  UpdateOnlineStatus,
  UserConversation,
} from "../types";

interface CreateChatPayload extends UserConversation {
  createdBy: number;
}

function ChatDashboard() {
  const [messageLoading, setMessageLoading] = useState<boolean>(false);
  const chats = useChatStore((state) => state.chats);
  const { updateMessages } = useMessagesStore();
  const userId = useAuthStore((state) => state.UserId);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const { socket, registerMessageHandler, connect, disconnect } =
    useWebSocketStore();

  const { updateActiveChatId, updateActiveChatName, activechatId } =
    useActiveChatStore();

  const sendMessage = useWebSocketStore((state) => state.sendMessage);

  const {
    updateChat,
    updateMemberOnlineStatus,
    setTypingUser,
    removeTypingUser,
    updateUnreadCount,
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

      const prevIdx = chats.findIndex((chat) => chat.chatId === message.chatId);

      if (prevIdx !== -1) {
        const modifiedChat = chats[prevIdx];
        const newList = [
          modifiedChat,
          ...chats.filter((_, index) => index !== prevIdx),
        ];
        updateChat(newList);

        if (message.senderId !== userId && message.chatId !== activechatId) {
          updateUnreadCount(message.chatId);
        }
      }
    });

    registerMessageHandler(
      MessageType.CREATE_CHAT,
      async (message: CreateChatPayload) => {
        if (message.createdBy == userId) {
          updateActiveChatId(message.chatId);
          updateActiveChatName(message.chatName);
          const messages = await changeChat(message.chatId);
          updateMessages(messages);
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
  }, [activechatId, socket, chats]);

  return (
    <div className="h-screen flex flex-col bg-[#121212] text-white">
      <div className="h-14 min-h-[56px] bg-[#1E1E1E] shadow-md">
        <Navbar />
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className=" bg-[#1E1E1E] border-r border-gray-700 flex flex-col w-[30%]">
          <div className="p-4 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <h1 className="text-lg font-semibold">Chats</h1>
              <CreateChat />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ChatUsers setMessageLoading={setMessageLoading} />
          </div>
        </div>

        <div className="flex-1 bg-[#1E1E1E] flex flex-col mb-2 h-full w-[70%]">
          <div className="flex-1 overflow-y-auto">
            <MessageArea messageLoading={messageLoading} isTyping={isTyping} />
          </div>
          <div className="border-t border-gray-700">
            <MessageInput />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatDashboard;
