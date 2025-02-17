import RedisStore from "../redis/redisStore";
import { ChatMembers, GroupMembers, MessageType } from "../types";
import { fetchAllGroupMembers } from "../utils";
import prisma from "../utils/prismaClient";
import { BaseMessageHandler, BaseMessageType } from "./BaseMessagehandler";

interface AddMemberToGroupType extends BaseMessageType {
  data: {
    chatId: number;
    members: ChatMembers[];
  };
}

class AddMemberToGroup extends BaseMessageHandler {
  async handle(payload: AddMemberToGroupType, userId: number): Promise<void> {
    const data = payload.data;
    console.log(data);

    const message = {
      type: MessageType.ADD_MEMBER,
      data: {
        chatId: data.chatId,
        members: await RedisStore.getMemberStatus(data.members),
      },
    };

    const groupMembers = await fetchAllGroupMembers(data.chatId);
    this.broadCastToGroup(JSON.stringify(message), groupMembers);
    this.addMemberToGroup(data.chatId, data.members);
  }

  broadCastToGroup(message: string, groupMembers: GroupMembers[]) {
    groupMembers.forEach(async (member) => {
      await this.sendMessageToUser(message, member.userId);
    });
  }

  // async broadCastToGroup(groupMembers: ChatMembers[]) {

  //   console.log(groupMembers);

  //   const chatmemberWithStatus = await RedisStore.getMemberStatus(groupMembers);

  //   chatmemberWithStatus.forEach(async (member) => {
  //     const message = {
  //       type: MessageType.ADD_MEMBER,
  //       data: {
  //         userId: member.userId,
  //         userName: member.userName,
  //         userEmail: member.userEmail,
  //         isOnline: member.isOnline,
  //       },
  //     };
  //     await this.sendMessageToUser(JSON.stringify(message), member.userId);
  //   });
  // }

  async sendMessageToUser(message: string, id: number) {
    const userSocker = this.userManager.getUserSocket(id);

    if (userSocker) {
      userSocker.send(message);
    } else {
      await this.userManager.publishToRedis(`chat_${id}`, message);
    }
  }

  async addMemberToGroup(groupId: number, ChatMembers: ChatMembers[]) {
    const chatMemberPromise = [];
    try {
      for (const member of ChatMembers) {
        chatMemberPromise.push(
          prisma.chatMembers.create({
            data: {
              userEmail: member.userEmail,
              userName: member.userName,
              chatId: groupId,
              role: "MEMBER",
              userId: member.userId,
            },
          })
        );
      }

      await Promise.all(chatMemberPromise);
    } catch (error) {
      console.log("add memeber group", error);
    }
  }
}

export default AddMemberToGroup;
