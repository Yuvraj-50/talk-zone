import axios from "axios";
import { ChatMessage } from "../types";

async function changeChat(chatId: number) {
  const messages = await axios.get<ChatMessage[]>(
    `http://localhost:3000/api/v1/chat/${chatId}`,
    {
      withCredentials: true,
    }
  );

  return messages.data;
}

export default changeChat;
