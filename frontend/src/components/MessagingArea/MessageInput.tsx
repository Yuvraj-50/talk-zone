import { SetStateAction, useEffect, useRef, useState } from "react";
import Input from "../../ui/Input";
import useWebSocketStore from "../../zustand/socketStore";
import useActiveChatStore from "../../zustand/activeChatStore";
import { MessageType } from "../../types";
import { useAuthStore } from "../../zustand/authStore";

interface MessageInputProps {
  setIsTyping: React.Dispatch<SetStateAction<boolean>>;
}

function MessageInput({ setIsTyping }: MessageInputProps) {
  const [inputValue, setInputValue] = useState<string>("");
  const socket = useWebSocketStore((state) => state.socket);
  const sendMessage = useWebSocketStore((state) => state.sendMessage);
  const activechatId = useActiveChatStore((state) => state.activechatId);
  const userName = useAuthStore((state) => state.Username);
  const isTypingSent = useRef<boolean>(false);

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const messagePayload = {
      type: MessageType.SEND_MESSAGE,
      data: {
        message: inputValue,
        groupId: activechatId,
      },
    };

    const stopTypingPayload = {
      type: MessageType.TYPING,
      data: {
        chatId: activechatId,
        isTyping: false,
        userName,
      },
    };

    if (socket) {
      sendMessage(stopTypingPayload);
      sendMessage(messagePayload);
      setInputValue("");
      isTypingSent.current = false;
    }
  }

  function handleInputTyping(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
  }

  useEffect(() => {
    if (!socket) return;

    if (inputValue.length) {
      if (!isTypingSent.current) {
        const startTypingPayload = {
          type: MessageType.TYPING,
          data: {
            chatId: activechatId,
            userName,
            isTyping: true,
          },
        };
        sendMessage(startTypingPayload);
        isTypingSent.current = true;
      }

      const timer = setTimeout(() => {
        const stopTypingPayload = {
          type: MessageType.TYPING,
          data: {
            chatId: activechatId,
            userName,
            isTyping: false,
          },
        };

        sendMessage(stopTypingPayload);
        isTypingSent.current = false; 
      }, 1000);

      return () => clearTimeout(timer); 
    } else {
      const stopTypingPayload = {
        type: MessageType.TYPING,
        data: {
          chatId: activechatId,
          userName,
          isTyping: false, 
        },
      };

      sendMessage(stopTypingPayload);
      isTypingSent.current = false; 
    }
  }, [inputValue, activechatId, sendMessage, userName]);

  return (
    <>
      <form className="relative" onSubmit={handleFormSubmit}>
        <Input
          value={inputValue}
          onChange={handleInputTyping}
          type="text"
          placeholder="type a message"
        />
        <button className="absolute top-2 right-1 bg-green-500">send</button>
      </form>
    </>
  );
}

export default MessageInput;
