import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import CreateChat from "./Dashboard/CreateNewChat/CreateChat";
import ChatUsers from "./Dashboard/UserChats/ChatUsers";
import { useMessagesStore } from "../zustand/messageStore";
import MessageArea from "./Dashboard/MessagingArea/MessageArea";
import axios from "axios";
import { useChatStore } from "../zustand/ChatsStore";
import useWebSocketStore from "../zustand/socketStore";
import MessageInput from "./Dashboard/MessagingArea/MessageInput/MessageInput";
import useActiveChatStore from "../zustand/activeChatStore";
import changeChat from "../utils";
import { useAuthStore } from "../zustand/authStore";
import {
  ChatMessage,
  MessageType,
  UpdateOnlineStatus,
  UserConversation,
} from "../types";

interface CreateChatPayload extends UserConversation {
  createdBy: number;
}

function ChatDashboard() {
  const [messageLoading, setMessageLoading] = useState<boolean>(false);
  const [dashboardLoading, setDashboardLoading] = useState<boolean>(true);
  const activeChatId = useActiveChatStore((state) => state.activechatId);
  const activeChatName = useActiveChatStore((state) => state.activeChatName);
  const chats = useChatStore((state) => state.chats);
  const { updateMessages } = useMessagesStore();
  const userId = useAuthStore((state) => state.UserId);

  const { socket, connect, disconnect, registerMessageHandler } =
    useWebSocketStore();

  const updateActiveChatId = useActiveChatStore(
    (state) => state.updateActiveChatId
  );

  const updateActiveChatName = useActiveChatStore(
    (state) => state.updateActiveChatName
  );

  const { updateChat, updateMemberOnlineStatus } = useChatStore();

  useEffect(() => {
    connect("ws://localhost:3000");
    return () => {
      disconnect();
    };
  }, []);

  useEffect(() => {
    registerMessageHandler(MessageType.SEND_MESSAGE, (message: ChatMessage) => {
      if (message.chatId === activeChatId) {
        useMessagesStore.getState().appendMessage(message);
      }

      const prevIdx = chats.findIndex((chat) => chat.chatId === message.chatId);

      if (prevIdx !== -1) {
        const modifiedChat = chats[prevIdx];
        const newList = [
          modifiedChat,
          ...chats.filter((_, index) => index !== prevIdx),
        ];
        updateChat(newList);
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

    console.log(chats);

    registerMessageHandler(
      MessageType.ONLINE_STATUS,
      (message: UpdateOnlineStatus) => {
        // TODO THIS MAY CAUSE SOME BUG SO BE CARE FUL
        console.log(message);

        updateMemberOnlineStatus(message.userId, message.isOnline);
        // THIS DOES NOT CAUSED ANY BUGS OKAY
      }
    );
  }, [activeChatId, socket, chats]);

  useEffect(() => {
    async function getAllChats() {
      try {
        const response = await axios.get<UserConversation[]>(
          "http://localhost:3000/api/v1/chat",
          {
            withCredentials: true,
          }
        );

        updateChat(response.data);
      } catch (error) {
        console.error("Failed to fetch chats", error);
      } finally {
        setDashboardLoading(false);
      }
    }

    getAllChats();
  }, []);

  return (
    <div className="grid grid-rows-[50px_auto] grid-cols-[30%_auto] bg-green-300 h-screen">
      <div className="col-span-2">
        <Navbar />
      </div>

      <div className="bg-red-400">
        <div className="flex justify-between items-center">
          <h1>Chats</h1>
          <CreateChat />
        </div>
        <ChatUsers setMessageLoading={setMessageLoading} />
      </div>

      <div className="bg-slate-600 overflow-auto grid grid-rows-[30px_auto_60px]">
        <div className="bg-white h-20px">{activeChatName}</div>
        <div className="overflow-y-auto">
          <MessageArea messageLoading={messageLoading} />
        </div>
        <div className="p-2">
          <MessageInput />
        </div>
      </div>
    </div>
  );
}

export default ChatDashboard;
