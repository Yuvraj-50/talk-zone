import UserManager from "../managers/userManager";
import RedisService from "../redis/pubsub";
import { MessageType } from "../types";
import prisma from "../utils/prismaClient";
import { BaseMessageHandler, BaseMessageType } from "./BaseMessagehandler";

interface SendMessageType extends BaseMessageType {
  data: {
    message: string;
    groupId: number;
  };
}

type GroupMembers = {
  userId: number;
};

export class SendMessageHandler extends BaseMessageHandler {
  async handle(payload: SendMessageType, userId: number): Promise<void> {
    const message = payload.data.message;
    const groupId = payload.data.groupId;
    const messageType = payload.type;

    const groupMembers: GroupMembers[] = await this.getGroupMembers(groupId);
    const storedMessage = await this.storeMessageInDb(message, groupId, userId);

    const messagePayload = {
      type: messageType,
      data: storedMessage,
    };

    this.broadCastToGroup(JSON.stringify(messagePayload), groupMembers);
  }

  async getGroupMembers(groupId: number) {
    const groupMembers = await prisma.chatMembers.findMany({
      where: {
        chatId: groupId,
      },
      select: {
        userId: true,
      },
    });

    return groupMembers;
  }

  async storeMessageInDb(message: string, groupId: number, userId: number) {
    const sender = await prisma.chatMembers.findFirst({
      where: {
        userId: userId,
        chatId: groupId,
      },
    });

    if (!sender) {
      const errPayload = {
        type: MessageType.ERROR,
        data: {
          msg: "user is not part of the chat",
        },
      };
      this.sendErrorMessage(JSON.stringify(errPayload), userId);
    }

    const savedMessage = await prisma.messages.create({
      data: { message: message, chatId: groupId, senderId: userId },
      select: {
        id: true,
        message: true,
        senderId: true,
        sent_at: true,
        chatId: true,
      },
    });

    const {
      id,
      chatId,
      message: saveMessage,
      sent_at,
      senderId,
    } = savedMessage;

    return {
      id,
      chatId,
      senderId: senderId,
      message: saveMessage,
      sent_at,
      userName: sender?.userName,
      role: sender?.role,
    };
  }

  broadCastToGroup(message: string, groupMembers: GroupMembers[]) {
    groupMembers.forEach(async (member) => {
      await this.sendMessageToUser(message, member.userId);
    });
  }

  sendErrorMessage(payload: string, userId: number) {
    const userSocket = this.userManager.getUserSocket(userId);
    if (userSocket) {
      userSocket.send(payload);
    }
  }

  async sendMessageToUser(message: string, id: number) {
    const userSocker = this.userManager.getUserSocket(id);

    if (userSocker) {
      userSocker.send(message);
    } else {
      await this.userManager.publishToRedis(`chat_${id}`, message);
    }
  }
}
