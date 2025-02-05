import RedisService from "../redis/pubsub";

import WebSocket from "ws";

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
    await this.subscribeToRedis(`chat_${userId}`, ws);
  }

  async removeUser(userId: number) {
    this.users.delete(userId);
    await this.unsubscribeToRedis(`chat_${userId}`);
  }

  getUserSocket(userId: number) {
    return this.users.get(userId);
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
