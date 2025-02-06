import RedisService from "../redis/pubsub";

import WebSocket from "ws";
import RedisStore from "../redis/redisStore";
import prisma from "../utils/prismaClient";
import { MessageType } from "../types";

class UserManager {
  private static instance: UserManager | null = null;

  private constructor() {}

  private users: Map<number, WebSocket> = new Map();

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new UserManager();
    return this.instance;
  }

  async addUser(userId: number, ws: WebSocket): Promise<void> {
    this.users.set(userId, ws);
    await RedisStore.hset(`user_${userId}`, "status", "online");
    await this.subscribeToRedis(`chat_${userId}`, ws);
    await this.notifyChatMembers(userId, true);
  }

  async removeUser(userId: number) {
    this.users.delete(userId);
    await RedisStore.hset(`user_${userId}`, "status", "offline");
    await this.unsubscribeToRedis(`chat_${userId}`);
    await this.notifyChatMembers(userId, false);
  }

  getUserSocket(userId: number) {
    return this.users.get(userId);
  }

  async notifyChatMembers(userId: number, isOnline: boolean) {
    const userChats = await this.getChatMembers(userId);

    const memeberset = new Set<number>();

    for (const { chat } of userChats) {
      for (const member of chat.chatmembers) {
        memeberset.add(member.userId);
      }
    }

    for (const memberId of memeberset) {
      if (memberId != userId) {
        const payload = {
          type: MessageType.ONLINE_STATUS,
          data: {
            userId,
            isOnline,
          },
        };

        const memberSocket = this.users.get(memberId);
        
        if (memberSocket) {
          memberSocket.send(JSON.stringify(payload));
        } else {
          await RedisService.publish(
            `chat_${memberId}`,
            JSON.stringify(payload)
          );
        }
      }
    }
  }

  async getChatMembers(userId: number) {
    const chatMembers = await prisma.chatMembers.findMany({
      where: { userId: userId },
      include: {
        chat: { include: { chatmembers: true } },
      },
    });
    return chatMembers;
  }

  async subscribeToRedis(channelName: string, ws: WebSocket): Promise<void> {
    try {
      await RedisService.subscribe(channelName, (msg: string) => {
        ws.send(msg);
      });
    } catch {
      console.log("Error subscribing To Redis");
      const payload = {
        type: "ERROR",
        data: {
          error: "Error subscibing to Redis",
          msg: "Try again after some time",
        },
      };

      ws.send(JSON.stringify(payload));
    }
  }

  async unsubscribeToRedis(channelName: string) {
    try {
      await RedisService.unSubscribe(channelName);
    } catch (error) {
      console.log("Error unsubscribing from redisi");
    }
  }

  async publishToRedis(channelName: string, message: string) {
    try {
      await RedisService.publish(channelName, message);
    } catch (error) {
      console.log("Failed To publish to Client");
    }
  }
}

export default UserManager;
