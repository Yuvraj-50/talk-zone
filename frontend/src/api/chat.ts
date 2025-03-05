import { ChatMessage, UserConversation } from "@/types";
import axiosChat from "./axiosChat";

export const getChatMessages = async (
  chatId: number
): Promise<ChatMessage[]> => {
  try {
    const messages = await axiosChat.get<ChatMessage[]>(`/${chatId}`);
    return messages.data;
  } catch (error: any) {
    throw error.response?.data?.message || "failed to get chat message";
  }
};

export const getUserChats = async (): Promise<UserConversation[]> => {
  try {
    const response = await axiosChat.get<UserConversation[]>("/");
    console.log(response);
    return response.data;
  } catch (error: any) {
    console.log(error);
    throw error.response?.data?.message || "failed to get chats";
  }
};
