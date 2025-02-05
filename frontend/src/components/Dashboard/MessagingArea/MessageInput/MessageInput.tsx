import { useState } from "react";
import Input from "../../../../ui/Input";
import useWebSocketStore, {
  MessageType,
} from "../../../../zustand/socketStore";
import useActiveChatStore from "../../../../zustand/activeChatStore";

function MessageInput() {
  const [inputValue, setInputValue] = useState<string>("");
  const socket = useWebSocketStore((state) => state.socket);
  const sendMessage = useWebSocketStore((state) => state.sendMessage);

  const activechatId = useActiveChatStore((state) => state.activechatId);

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const payload = {
      type: MessageType.SEND_MESSAGE,
      data: {
        message: inputValue,
        groupId: activechatId,
      },
    };

    if (socket) {
      sendMessage(payload);
      setInputValue("");
    }
  }
  return (
    <>
      <form className="w-full relative" onSubmit={handleFormSubmit}>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          type="text"
          placeholder="type a message"
        />
        <button className="absolute top-2 right-1 bg-green-500">send</button>
      </form>
    </>
  );
}

export default MessageInput;
