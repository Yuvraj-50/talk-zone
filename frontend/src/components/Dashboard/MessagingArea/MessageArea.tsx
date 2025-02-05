import { memo, useEffect, useRef } from "react";
import { useMessagesStore } from "../../../zustand/messageStore";
import { useAuthStore } from "../../../zustand/authStore";

function MessageArea({ messageLoading }: { messageLoading: any }) {
  const { messages } = useMessagesStore();
  const { UserId } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current)
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);


  return (
    <div>
      {messageLoading ? (
        <div>Loading...</div>
      ) : (
        <ul className="flex flex-col">
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
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}

export default memo(MessageArea);
