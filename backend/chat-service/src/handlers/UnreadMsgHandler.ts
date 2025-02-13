import prisma from "../utils/prismaClient";
import { BaseMessageHandler, BaseMessageType } from "./BaseMessagehandler";

interface UnreadMsgHandlerType extends BaseMessageType {
  data: {
    chatId: number;
  };
}

class UnreadMsgHandler extends BaseMessageHandler {
  async handle(payload: UnreadMsgHandlerType, userId: number): Promise<void> {
    const { type, data } = payload;
    await this.resetCount(data.chatId, userId);
  }

  async resetCount(chatId: number, userId: number) {
    await prisma.unreadCount.update({
      data: {
        count: 0,
      },
      where: {
        chatId_userId: {
          chatId: chatId,
          userId: userId,
        },
      },
    });
  }
}

export default UnreadMsgHandler;
