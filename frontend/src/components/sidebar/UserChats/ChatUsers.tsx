import changeChat from "@/lib";
import { MessageType, UserConversation } from "@/types";
import useActiveChatStore from "@/zustand/activeChatStore";
import { useChatStore } from "@/zustand/ChatsStore";
import { useMessagesStore } from "@/zustand/messageStore";
import useWebSocketStore from "@/zustand/socketStore";
import CreateChat from "../CreateNewChat/CreateChat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { memo } from "react";
import Conversation from "./ChatMessage";

function ChatUsers({
  setMessageLoading,
}: {
  setMessageLoading: (loading: boolean) => void;
}) {
  const { chats, resetUnreadCount } = useChatStore();
  const { updateMessages } = useMessagesStore();
  const {
    updateActiveChatId,
    updateActiveChatName,
    activechatId,
    updateActiveChatPicture,
  } = useActiveChatStore();
  const socket = useWebSocketStore((state) => state.socket);
  const sendMessage = useWebSocketStore((state) => state.sendMessage);

  async function handleChangeChat(chat: UserConversation) {
    const { chatId: id, chatName } = chat;
    if (id === activechatId) return;
    setMessageLoading(true);
    updateMessages([]);
    updateActiveChatId(id);
    updateActiveChatName(chatName);
    updateActiveChatPicture(chat.profilePicture);
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

  console.log("Component Rendered");

  return (
    <>
      <div className="flex justify-between items-center px-4 pt-4 pb-2">
        <h2 className="text-lg font-semibold">Chats</h2>
        <CreateChat />
      </div>
      <ScrollArea className="scroll-area-override">
        <div className="space-y-2 p-2 w-full">
          {chats.map((chat) => {
            const isOnline = chat.chatMembers.every(
              (member) => member.isOnline
            );
            const isActive = activechatId === chat.chatId;
            return (
              <Conversation
                key={chat.chatId}
                chatId={chat.chatId}
                chatName={chat.chatName}
                chatType={chat.chatType}
                isOnline={isOnline}
                unreadCount={chat.unreadCount}
                isActive={isActive}
                profilePic={chat.profilePicture}
                latestMessage={chat.latestMessage}
                onClick={() => handleChangeChat(chat)}
              />
            );
          })}
        </div>
      </ScrollArea>
    </>
  );
}

export default memo(ChatUsers);
