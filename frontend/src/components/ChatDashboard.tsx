import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import CreateChat from "./sidebar/CreateNewChat/CreateChat";
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

interface CreateChatPayload extends UserConversation {
  createdBy: number;
}

function ChatDashboard() {
  const [messageLoading, setMessageLoading] = useState<boolean>(false);

  const { updateMessages } = useMessagesStore();
  const userId = useAuthStore((state) => state.user?.id);
  const { socket, registerMessageHandler, connect, disconnect, sendMessage } =
    useWebSocketStore();
  const { updateActiveChatId, updateActiveChatName, activechatId } =
    useActiveChatStore();
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
          <div className="flex items-center px-4 pt-4">
            <div className="flex justify-between items-center w-full">
              <h2 className="text-lg font-semibold">Chats</h2>
              <CreateChat />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ChatUsers setMessageLoading={setMessageLoading} />
          </div>
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
