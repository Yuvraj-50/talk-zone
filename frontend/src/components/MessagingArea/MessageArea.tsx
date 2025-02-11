import { memo, useEffect, useRef, useState } from "react";
import { useMessagesStore } from "../../zustand/messageStore";
import { useAuthStore } from "../../zustand/authStore";
import { useChatStore } from "../../zustand/ChatsStore";
import useActiveChatStore from "../../zustand/activeChatStore";

function MessageArea({
  messageLoading,
}: {
  messageLoading: any;
  isTyping: boolean;
}) {
  const { messages } = useMessagesStore();
  const { UserId, Username } = useAuthStore();
  const { typingUsers } = useChatStore();
  const { activechatId, activeChatName } = useActiveChatStore();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const typingMessage = (typingUsers[activechatId] || []).join("");

  const scrollToBottom = () => {
    if (messagesEndRef.current)
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, typingMessage]);

  if (messageLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white text-lg">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="sticky top-0 z-10 bg-gray-800 border-b border-gray-700 p-4 shadow-md">
        <h2 className="text-white font-medium text-lg">{activeChatName}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <ul className="flex flex-col space-y-4">
          {messages.map((message) => {
            const isOwnMessage = UserId == message.senderId;
            return (
              <li
                key={message.id}
                className={`flex flex-col max-w-[70%] break-words break-all overflow-wrap-break-word  ${
                  isOwnMessage ? "self-end items-end" : "self-start items-start"
                }`}
              >
                {!isOwnMessage && (
                  <span className="text-sm text-gray-400 mb-1">
                    {message.userName}
                  </span>
                )}

                <div
                  className={`px-4 py-2 rounded-2xl ${
                    isOwnMessage
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-100"
                  }`}
                >
                  {message.message}
                </div>
              </li>
            );
          })}
        </ul>

        {typingMessage && (
          <div className="w-32 justify-center pt-4">
            <div className="bg-gray-800 text-gray-300 px-4 py-2 rounded-full text-sm">
              {typingMessage} is typing...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

export default memo(MessageArea);
