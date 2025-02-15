import { useMessagesStore } from "../../../zustand/messageStore";
import { useChatStore } from "../../../zustand/ChatsStore";
import { memo, useEffect } from "react";
import useActiveChatStore from "../../../zustand/activeChatStore";
import ChatMessage from "./ChatMessage";
import changeChat from "../../../lib";
import { CHATTYPE, MessageType, UserConversation } from "../../../types";
import axios from "axios";
import useWebSocketStore from "../../../zustand/socketStore";
import { ScrollArea } from "../../ui/scroll-area";

function ChatUsers({
  setMessageLoading,
}: {
  setMessageLoading: (loading: boolean) => void;
}) {
  const { chats, updateChat, resetUnreadCount } = useChatStore();
  const { updateMessages } = useMessagesStore();
  const { updateActiveChatId, updateActiveChatName, activechatId } =
    useActiveChatStore();
  const socket = useWebSocketStore((state) => state.socket);
  const sendMessage = useWebSocketStore((state) => state.sendMessage);

  async function handleChangeChat(id: number, chatName: string) {
    if (id === activechatId) return;
    setMessageLoading(true);
    updateMessages([]);
    updateActiveChatId(id);
    updateActiveChatName(chatName);
    const messages = await changeChat(id);
    resetUnreadCount(id);
    updateMessages(messages);
    setMessageLoading(false);
    const chatToChange = chats.find((chat) => chat.chatId == id);

    if (socket && (chatToChange?.unreadCount ?? 0) > 0) {
      const payload = {
        type: MessageType.UNREADMESSAGECOUNT,
        data: {
          chatId: id,
        },
      };

      sendMessage(payload);
    }
  }

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
      }
    }

    getAllChats();
  }, []);

  return (
    <ScrollArea className="flex-1">
      <div className="space-y-2 p-2">
        {chats.map((chat) => {
          const isOnline = chat.chatMembers.every((member) => member.isOnline);
          const isActive = activechatId === chat.chatId;

          return (
            <ChatMessage
              key={chat.chatId}
              chatId={chat.chatId}
              chatName={chat.chatName}
              chatType={chat.chatType}
              isOnline={isOnline}
              unreadCount={chat.unreadCount}
              isActive={isActive}
              onClick={() => handleChangeChat(chat.chatId, chat.chatName)}
            />
          );
        })}
      </div>
    </ScrollArea>
  );
}

export default memo(ChatUsers);
