import { useMessagesStore } from "../../../zustand/messageStore";
import { useChatStore } from "../../../zustand/ChatsStore";
import { memo, useEffect } from "react";
import useActiveChatStore from "../../../zustand/activeChatStore";
import ChatMessage from "./ChatMessage";
import changeChat from "../../../lib";
import { CHATTYPE, MessageType, UserConversation } from "../../../types";
import useWebSocketStore from "../../../zustand/socketStore";
import { ScrollArea } from "../../ui/scroll-area";
import {
  fetchUserProfile,
  getAllChats,
  getUserIds,
  processUserProfileAndBio,
} from "@/lib/utils";
import { useAuthStore } from "@/zustand/authStore";
import CreateChat from "../CreateNewChat/CreateChat";
function ChatUsers({
  setMessageLoading,
}: {
  setMessageLoading: (loading: boolean) => void;
}) {
  const { chats, updateChat, resetUnreadCount } = useChatStore();
  const { updateMessages } = useMessagesStore();
  const {
    updateActiveChatId,
    updateActiveChatName,
    activechatId,
    updateActiveChatPicture,
  } = useActiveChatStore();
  const socket = useWebSocketStore((state) => state.socket);
  const sendMessage = useWebSocketStore((state) => state.sendMessage);
  const loggedInUser = useAuthStore((state) => state.user?.id);

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

  useEffect(() => {
    async function getUserAllChats() {
      try {
        const userChatData = await getAllChats();
        if (!userChatData) return;
        const userId: number[] = getUserIds(userChatData);
        const userProfileBio = await fetchUserProfile(userId);
        if (loggedInUser) {
          processUserProfileAndBio(
            userChatData,
            loggedInUser,
            userProfileBio.users
          );
          updateChat(userChatData);
        }
      } catch (error) {
        console.error("Failed to fetch chats", error);
      }
    }
    getUserAllChats();
  }, []);

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
              <ChatMessage
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
