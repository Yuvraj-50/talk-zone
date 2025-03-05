import {changeChat} from "@/lib";
import { UserConversation } from "@/types";
import useActiveChatStore from "@/zustand/activeChatStore";
import { useChatStore } from "@/zustand/ChatsStore";
import CreateChat from "../CreateNewChat/CreateChat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { memo } from "react";
import Conversation from "./ChatMessage";

function ChatUsers({
  setMessageLoading,
}: {
  setMessageLoading: (loading: boolean) => void;
}) {
  const chats = useChatStore((state) => state.chats);
  const activechatId = useActiveChatStore((state) => state.activechatId);

  async function handleChangeChat(chat: UserConversation) {
    setMessageLoading(true);
    await changeChat(chat);
    setMessageLoading(false);
  }

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
