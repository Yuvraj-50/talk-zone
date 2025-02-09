import { ChatMembers } from "@prisma/client";
import { fetchAllGroupMembers } from "../utils";
import { BaseMessageHandler, BaseMessageType } from "./BaseMessagehandler";
import RedisService from "../redis/pubsub";

interface TypingIndicatorPayload extends BaseMessageType {
  data: {
    userName: string;
    chatId: number;
  };
}

class TypingIndicatorHandler extends BaseMessageHandler {
  async handle(payload: TypingIndicatorPayload, userId: number): Promise<void> {
    const { chatId } = payload.data;
    // now what i need to do is i will find all the member of this chatid
    // and notify all the member that in this chat userName is typing
    const groupMembers = await fetchAllGroupMembers(chatId);

    // notify all the memeber in the chat
    await this.notifyMembers(groupMembers, payload, userId);
  }

  async notifyMembers(
    groupMembers: {
      userId: number;
    }[],
    message: TypingIndicatorPayload,
    loggedInUser: number
  ) {
    for (const { userId } of groupMembers) {
      if (userId == loggedInUser) continue;
      const userSocket = this.userManager.getUserSocket(userId);
      if (userSocket) {
        userSocket.send(JSON.stringify(message));
      } else {
        await RedisService.publish(`chat_${userId}`, JSON.stringify(message));
      }
    }
  }
}

export default TypingIndicatorHandler;
