import { getChatMessages } from "@/api/chat";
import { MessageType, UserConversation } from "@/types";
import useActiveChatStore from "@/zustand/activeChatStore";
import { useChatStore } from "@/zustand/ChatsStore";
import { useMessagesStore } from "@/zustand/messageStore";
import useWebSocketStore from "@/zustand/socketStore";

export function selectChat(
  profilePicture: string,
  chatId: number,
  chatName: string
) {
  const { updateActiveChatPicture, updateActiveChatId, updateActiveChatName } =
    useActiveChatStore.getState();

  useMessagesStore.getState().updateMessages([]);
  updateActiveChatPicture(profilePicture);
  updateActiveChatId(chatId);
  updateActiveChatName(chatName);
}

export async function changeChat(chat: UserConversation) {
  const activechatId = useActiveChatStore.getState().activechatId;

  const { chatId, profilePicture, chatName } = chat;

  if (activechatId == chatId) return;

  selectChat(profilePicture, chatId, chatName);

  const messages = await getChatMessages(chatId);

  useMessagesStore.getState().updateMessages(messages);

  const socket = useWebSocketStore.getState().socket;
  const sendMessage = useWebSocketStore.getState().sendMessage;

  const chatToChange = useChatStore
    .getState()
    .chats.find((chat) => chat.chatId == chatId);

  console.log(chatToChange, chatToChange?.unreadCount);

  if (socket && (chatToChange?.unreadCount ?? 0) > 0) {
    const payload = {
      type: MessageType.UNREADMESSAGECOUNT,
      data: {
        chatId: chat.chatId,
      },
    };
    
    sendMessage(payload);
    useChatStore.getState().resetUnreadCount(chatId);
  }
}
