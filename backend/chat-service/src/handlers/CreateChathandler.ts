import { Prisma } from "@prisma/client";
import { CHATTYPE, MessageType, UserSocketMessage } from "../types";
import prisma from "../utils/prismaClient";
import { BaseMessageHandler, BaseMessageType } from "./BaseMessagehandler";
import { Role } from "@prisma/client";

interface ChatMembers {
  userId: number;
  userName: string;
  role: Role;
  joined_at: Date;
}

interface CreateChatTye extends BaseMessageType {
  data: {
    members: ChatMembers[];
    chatType: CHATTYPE;
    groupName: string | null;
    createrId: number;
  };
}

interface ClientResPayload {
  type: string;
  data: {
    message: string;
    chatId: number;
    members: ChatMembers[];
    chatName: string | null;
    createdBy: number | null;
  };
}

class CreateChatHandler extends BaseMessageHandler {
  async handle(payload: CreateChatTye, userId: number): Promise<void> {
    const type = payload.type;
    const chatdata = payload.data;
    const createdChat = await this.createChat(
      chatdata.createrId,
      chatdata.groupName,
      chatdata.members,
      chatdata.chatType
    );

    if (!createdChat) return;

    const respayload = {
      type,
      data: {
        ...createdChat,
        message: "Chat created successfully",
      },
    };

    this.sendChatToChatMembers(respayload);
  }

  async sendChatToChatMembers(resPayload: ClientResPayload) {
    const { data } = resPayload;

    data.members.forEach((member) => {
      const chatName = data.chatName
        ? data.chatName
        : this.createOneToOneChatName(data.members, member.userId);

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
