import React, { useEffect, useRef, useState } from "react";
import useWebSocketStore from "../../zustand/socketStore";
import useActiveChatStore from "../../zustand/activeChatStore";
import { ChatMessage, CHATMESSAGETYPES, MessageType } from "../../types";
import { useAuthStore } from "../../zustand/authStore";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useMessagesStore } from "@/zustand/messageStore";
import { useChatStore } from "@/zustand/ChatsStore";

function MessageInput() {
  const [inputValue, setInputValue] = useState<string>("");
  const socket = useWebSocketStore((state) => state.socket);
  const sendMessage = useWebSocketStore((state) => state.sendMessage);
  const activechatId = useActiveChatStore((state) => state.activechatId);
  const userName = useAuthStore((state) => state.user?.name);
  const userId = useAuthStore((state) => state.user?.id);
  const updateLatestMessage = useChatStore(
    (state) => state.updateLatestMessage
  );

  const isTypingSent = useRef<boolean>(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  const createTypingPayload = (isTyping: boolean) => ({
    type: MessageType.TYPING,
    data: {
      chatId: activechatId,
      userName,
      isTyping,
    },
  });

  const handleFormSubmit = (
    e:
      | React.FormEvent<HTMLFormElement>
      | React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    e.preventDefault();

    if (inputValue.trim() === "") return;
    if (!userId || !userName) return;

    if (socket) {
      sendMessage(createTypingPayload(false));
      const tempId = new Date();

      const messagePayload = {
        type: MessageType.SEND_MESSAGE,
        data: {
          message: inputValue,
          groupId: activechatId,
          tempId: tempId.getTime(),
        },
      };

      const tempessage: ChatMessage = {
        id: tempId.getTime(),
        message: inputValue,
        senderId: userId,
        sent_at: tempId,
        chatId: activechatId,
        userName: userName,
        status: CHATMESSAGETYPES.PENDING,
      };

      useMessagesStore.getState().appendMessage(tempessage);
      updateLatestMessage(
        { message: inputValue, senderId: userId, sent_at: tempId },
        activechatId
      );
      
      sendMessage(messagePayload);
      setInputValue("");
      isTypingSent.current = false;
    }
  };

  const handleInputTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  useEffect(() => {
    if (!socket) return;

    const handleTypingStatus = () => {
      if (inputValue.length) {
        if (!isTypingSent.current) {
          sendMessage(createTypingPayload(true));
          isTypingSent.current = true;
        }

        const timer = setTimeout(() => {
          sendMessage(createTypingPayload(false));
          isTypingSent.current = false;
        }, 1000);

        return () => clearTimeout(timer);
      } else {
        sendMessage(createTypingPayload(false));
        isTypingSent.current = false;
      }
    };

    return handleTypingStatus();
  }, [inputValue, activechatId, sendMessage, userName, socket]);

  function handleKeyDownEvent(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleFormSubmit(e);
    }
  }

  return (
    <form
      className="flex items-center gap-2 p-2"
      onSubmit={handleFormSubmit}
      ref={formRef}
    >
      <Textarea
        value={inputValue}
        onChange={handleInputTyping}
        onKeyDown={handleKeyDownEvent}
        placeholder="Type a message"
        className="min-h-10 max-h-40 resize-none"
        rows={1}
      />
      <Button type="submit" size="icon" className="h-10 w-10 shrink-0">
        <Send className="h-5 w-5" />
      </Button>
    </form>
  );
}

export default MessageInput;
