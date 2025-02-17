import { Prisma } from "@prisma/client";
import {
  ChatMembers,
  CHATTYPE,
  MessageType,
  UserSocketMessage,
} from "../types";
import prisma from "../utils/prismaClient";
import { BaseMessageHandler, BaseMessageType } from "./BaseMessagehandler";
import { Role } from "@prisma/client";
import RedisStore from "../redis/redisStore";

interface CreateChatTye extends BaseMessageType {
  data: {
    members: ChatMembers[];
    chatType: CHATTYPE;
    groupName: string | null;
    createrId: number;
  };
}

interface ClientPayloadChatMembers extends ChatMembers {
  isOnline: boolean;
}

interface ClientResPayload {
  type: MessageType;
  data: {
    message: string;
    chatId: number;
    chatMembers: ClientPayloadChatMembers[];
    chatName: string | null;
    createdBy: number | null;
    chatType: CHATTYPE;
    unreadCount: number;
  };
}

class CreateChatHandler extends BaseMessageHandler {
  async handle(payload: CreateChatTye, userId: number): Promise<void> {
    const type = payload.type as MessageType;
    const chatdata = payload.data;

    const createdChat = await this.createChat(
      chatdata.createrId,
      chatdata.groupName,
      chatdata.members,
      chatdata.chatType
    );

    if (!createdChat) return;

    const memberWithStatus = await RedisStore.getMemberStatus(chatdata.members);

    const respayload = {
      type,
      data: {
        chatId: createdChat.chatId,
        chatMembers: memberWithStatus,
        chatName: createdChat.chatName,
        createdBy: createdChat.createdBy,
        message: "Chat created successfully",
        chatType: chatdata.chatType,
        unreadCount: 0,
      },
    };

    this.sendChatToChatMembers(respayload);
  }

  async sendChatToChatMembers(resPayload: ClientResPayload) {
    const { data } = resPayload;

    data.chatMembers.forEach((member) => {
      const chatName = data.chatName
        ? data.chatName
        : this.createOneToOneChatName(data.chatMembers, member.userId);

      const personalizedPayload = {
        ...resPayload,
        data: {
          ...resPayload.data,
          chatName,
        },
      };

      const memberSocket = this.userManager.getUserSocket(member.userId);
      if (memberSocket) {
        memberSocket.send(JSON.stringify(personalizedPayload));
      } else {
        this.userManager.publishToRedis(
          `chat_${member.userId}`,
          JSON.stringify(personalizedPayload)
        );
      }
    });
  }

  async createChat(
    createrId: number,
    name: null | string,
    chatMembers: ChatMembers[],
    chatType: CHATTYPE
  ) {
    try {
      if (chatType == CHATTYPE.ONETOONE) {
        const existingChat = await prisma.chats.findFirst({
          where: {
            chatmembers: {
              every: {
                OR: chatMembers,
              },
            },
          },
        });

        if (existingChat) {
          throw new Error(
            "A one-to-one chat between these users already exists."
          );
        }
      }

      const createChat = await prisma.chats.create({
        data: {
          createdBy: createrId,
          name: name,
        },
      });

      const chatMembersPromise = chatMembers.map((member) =>
        prisma.chatMembers.create({
          data: {
            userId: member.userId,
            chatId: createChat.id,
            userName: member.userName,
            userEmail: member.userEmail,
            role:
              chatType === CHATTYPE.GROUPCHAT && member.userId == createrId
                ? "ADMIN"
                : "MEMBER",
          },
          select: {
            userId: true,
            joined_at: true,
            role: true,
            userName: true,
            userEmail: true,
          },
        })
      );
      const res = await Promise.all(chatMembersPromise);

      const chatName = createChat.name;

      return {
        chatId: createChat.id,
        members: res,
        chatName,
        createdBy: createChat.createdBy,
      };
    } catch (error) {
      console.log("Error while creating chat", error);
    }
  }

  createOneToOneChatName(chatMembers: ChatMembers[], currUser: number) {
    const otherUser = chatMembers.find(
      (chatMember) => chatMember.userId !== currUser
    );
    return otherUser ? otherUser.userName : "Unknown User";
  }
}

export default CreateChatHandler;
