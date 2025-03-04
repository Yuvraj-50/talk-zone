import { memo, useEffect, useRef } from "react";
import { useMessagesStore } from "../../zustand/messageStore";
import { useAuthStore } from "../../zustand/authStore";
import { useChatStore } from "../../zustand/ChatsStore";
import useActiveChatStore from "../../zustand/activeChatStore";
import { ScrollArea } from "../ui/scroll-area";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./MessageSkeleton";
import MessageAreaHeader from "./header";

function MessageArea({ messageLoading }: { messageLoading: boolean }) {
  const { messages } = useMessagesStore();
  const UserId = useAuthStore((state) => state.user?.id);
  const { typingUsers } = useChatStore();
  const activechatId = useActiveChatStore((state) => state.activechatId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingMessage = (typingUsers[activechatId] || []).join("");

  useEffect(() => {
    const scrollTimeout = setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: "instant" });
      }
    }, 100);

    return () => clearTimeout(scrollTimeout);
  }, [messages, typingMessage, activechatId]);

  if (messageLoading) {
    return (
      <div className="flex flex-col h-full">
        {Array.from({ length: 10 }).map((_, i) => (
          <MessageSkeleton isRight={i % 2 == 0} key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <MessageAreaHeader />
      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col space-y-4">
          {messages.map((message) => {
            const isOwnMessage = UserId == message.senderId;
            return (
              <div
                key={message.id}
                className={`flex flex-col max-w-[70%] break-words break-all overflow-wrap-break-word ${
                  isOwnMessage ? "self-end items-end" : "self-start items-start"
                }`}
              >
                {!isOwnMessage && (
                  <span className="text-sm mb-1">{message.userName}</span>
                )}

                <div
                  className={`px-4 py-2 rounded-2xl ${
                    isOwnMessage
                      ? "bg-primary text-primary-foreground "
                      : "bg-secondary "
                  }`}
                >
                  {message.message}
                </div>
              </div>
            );
          })}

          {typingMessage && (
            <div className="w-32 pt-4">
              <div className="px-4 py-2 rounded-full text-sm">
                {typingMessage} is typing...
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>
      <MessageInput />
    </div>
  );
}

export default memo(MessageArea);
