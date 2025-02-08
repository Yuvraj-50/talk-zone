import { useMessagesStore } from "../../../zustand/messageStore";
import { useChatStore } from "../../../zustand/ChatsStore";
import { memo } from "react";
import useActiveChatStore from "../../../zustand/activeChatStore";
import ChatMessage from "./ChatMessage";
import changeChat from "../../../utils";
import { CHATTYPE } from "../../../types";

function ChatUsers({
  setMessageLoading,
}: {
  setMessageLoading: (loading: boolean) => void;
}) {
  const { chats } = useChatStore();
  const { updateMessages } = useMessagesStore();

  const { activechatId } = useActiveChatStore();

  const updateActiveChatId = useActiveChatStore(
    (state) => state.updateActiveChatId
  );

  const updateActiveChatName = useActiveChatStore(
    (state) => state.updateActiveChatName
  );

  async function handleChangeChat(id: number, chatName: string) {
    setMessageLoading(true);
    updateMessages([]);
    updateActiveChatId(id);
    updateActiveChatName(chatName);
    const messages = await changeChat(id);
    updateMessages(messages);
    setMessageLoading(false);
  }

  console.log(chats);
  

  return (
    <div className="mb-2 bg-slate-400">
      {chats.map((chat) => (
        <div
          key={chat.chatId}
          className={`border cursor-pointer ${
            chat.chatId == activechatId ? "bg-slate-500" : "bg-teal-300"
          }`}
          onClick={() => handleChangeChat(chat.chatId, chat.chatName)}
        >
          {chat.chatType == CHATTYPE.ONETOONE && (
            <div>
              online{" "}
              {chat.chatMembers.every((member) => member.isOnline == true)
                ? "true"
                : "false"}
            </div>
          )}
          <ChatMessage
            key={chat.chatId}
            chatName={chat.chatName}
            chatId={chat.chatId}
          />
        </div>
      ))}
    </div>
  );
}

export default memo(ChatUsers);
