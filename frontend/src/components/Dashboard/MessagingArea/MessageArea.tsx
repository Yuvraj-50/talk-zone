import { memo, useEffect, useRef, useState } from "react";
import { useMessagesStore } from "../../../zustand/messageStore";
import { useAuthStore } from "../../../zustand/authStore";
import { useChatStore } from "../../../zustand/ChatsStore";
import useActiveChatStore from "../../../zustand/activeChatStore";

function MessageArea({
  messageLoading,
}: {
  messageLoading: any;
  isTyping: boolean;
}) {
  const { messages } = useMessagesStore();
  const { UserId, Username } = useAuthStore();
  const { typingUsers } = useChatStore();
  const { activechatId } = useActiveChatStore();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [showMessage, setShowMessage] = useState<boolean>(false);

  const typingMessage = (typingUsers[activechatId] || []).join("");

  const scrollToBottom = () => {
    if (messagesEndRef.current)
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, typingMessage]);

  if (messageLoading) {
    return <>Loading...</>;
  }

  return (
    <div>
      <ul className="flex flex-col relative">
        {messages.map((message) => {
          return (
            <li
              key={message.id}
              className={`mb-3 rounded-full px-2 py-1 ${
                UserId == message.senderId
                  ? "bg-green-500 self-end"
                  : "bg-gray-400 self-start"
              }`}
            >
              {UserId !== message.senderId && <p>{message.userName}</p>}
              {message.message}
              {message.senderId}
            </li>
          );
        })}
      </ul>
      {typingMessage != "" && (
        <div className="rounded-full px-2 py-1 bg-orange-400 self-start absolute bottom-16">
          {UserId}
          {Username}
          Typing hello
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default memo(MessageArea);
