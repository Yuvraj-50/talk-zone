import axios from "axios";

enum Role {
  "MEMBER",
  "ADMIN",
}

type ChatMessage = {
  message: string;
  senderId: number;
  sent_at: "string";
  id: number;
  chatId: number;
  role: Role;
  userId: number;
  userName: string;
};

async function changeChat(chatId: number) {
  const messages = await axios.get<ChatMessage[]>(
    `http://localhost:3000/api/v1/chat/${chatId}`
  );

  return messages.data;
}

export default changeChat;
