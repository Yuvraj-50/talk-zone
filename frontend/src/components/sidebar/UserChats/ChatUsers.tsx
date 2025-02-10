import { useMessagesStore } from "../../../zustand/messageStore";
import { useChatStore } from "../../../zustand/ChatsStore";
import { memo, useEffect } from "react";
import useActiveChatStore from "../../../zustand/activeChatStore";
import ChatMessage from "./ChatMessage";
import changeChat from "../../../utils";
import { CHATTYPE, UserConversation } from "../../../types";
import axios from "axios";

function ChatUsers({
  setMessageLoading,
}: {
  setMessageLoading: (loading: boolean) => void;
}) {
  const { chats } = useChatStore();
  const { updateMessages } = useMessagesStore();
  const { updateActiveChatId, updateActiveChatName, activechatId } =
    useActiveChatStore();
  const { updateChat } = useChatStore();

  async function handleChangeChat(id: number, chatName: string) {
    setMessageLoading(true);
    updateMessages([]);
    updateActiveChatId(id);
    updateActiveChatName(chatName);
    const messages = await changeChat(id);
    updateMessages(messages);
    setMessageLoading(false);
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
    <div className="bg-[#121212] h-full p-4 text-white border-r border-gray-800 overflow-y-auto">
      <div className="space-y-4">
        {chats.map((chat) => {
          const isOnline = chat.chatMembers.every((member) => member.isOnline);

          return (
            <ChatMessage
              key={chat.chatId}
              chatName={chat.chatName}
              chatId={chat.chatId}
              isOnline={isOnline}
              chatType={chat.chatType}
              onClick={() => handleChangeChat(chat.chatId, chat.chatName)}
            />
          );
        })}
      </div>
    </div>
  );
}

export default memo(ChatUsers);
