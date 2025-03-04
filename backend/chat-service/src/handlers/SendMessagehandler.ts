import { GroupMembers, MessageType } from "../types";
import prisma from "../utils/prismaClient";
import { BaseMessageHandler, BaseMessageType } from "./BaseMessagehandler";

interface SendMessageType extends BaseMessageType {
  data: {
    message: string;
    groupId: number;
    tempId: number;
  };
}

export class SendMessageHandler extends BaseMessageHandler {
  async handle(payload: SendMessageType, userId: number): Promise<void> {
    const { message, groupId, tempId } = payload.data;
    const messageType = payload.type;

    // as soon as come send the message back to the user indicating that it is sent
    const messageOptimisticPayload = {
      type: MessageType.MESSAGE_OPTIMISTIC,
      data: {
        id: tempId,
      },
    };

    this.sendMessageToUser(JSON.stringify(messageOptimisticPayload), userId);
    const groupMembers: GroupMembers[] = await this.getGroupMembers(groupId);
    const storedMessage = await this.storeMessageInDb(message, groupId, userId);

    const messagePayload = {
      type: messageType,
      data: storedMessage,
    };

    const updateTempIdPayload = {
      type: MessageType.UPDATE_TEMPID,
      data: {
        realId: storedMessage.id,
        tempId,
      },
    };

    this.broadCastToGroup(JSON.stringify(messagePayload), groupMembers, userId);
    this.sendMessageToUser(JSON.stringify(updateTempIdPayload), userId);
    this.updateLatestTimeStamp(groupId);
    await this.increaseMessageCnt(groupId, userId, groupMembers);
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
    };
  }

  async updateLatestTimeStamp(chatId: number) {
    try {
      await prisma.chats.update({
        data: {
          latestTimeStamp: new Date(),
        },
        where: {
          id: chatId,
        },
      });
    } catch (error) {
      console.log("error updating the timestamp");
    }
  }

  broadCastToGroup(message: string, groupMembers: GroupMembers[], userId: number) {
    groupMembers.forEach(async (member) => {
      if (member.userId !== userId) {
        await this.sendMessageToUser(message, member.userId);
      }
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

  async increaseMessageCnt(
    chatId: number,
    loggedInUser: number,
    groupMembers: GroupMembers[]
  ) {
    const unreadCountPromise = [];

    for (const { userId } of groupMembers) {
      if (userId == loggedInUser) continue;
      unreadCountPromise.push(
        prisma.unreadCount.upsert({
          where: {
            chatId_userId: { chatId, userId },
          },
          update: {
            count: { increment: 1 },
          },
          create: {
            userId,
            chatId,
            count: 1,
          },
        })
      );
    }

    await Promise.all(unreadCountPromise);
  }
}
