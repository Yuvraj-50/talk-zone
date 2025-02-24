import { Role } from "@prisma/client";
import { createClient, RedisClientType } from "redis";
import { ChatMembers } from "../types";

interface ClientPayloadChatMembers extends ChatMembers {
  isOnline: boolean;
}

class RedisStore {
  private static redisClient: RedisClientType | null;

  private constructor() {}

  private static async initialize() {
    if (!this.redisClient) {
      this.redisClient = createClient({ url: process.env.REDIS_URL });
      await this.redisClient.connect();
    }
  }

  public static async hset(
    key: string,
    field: string,
    value: string
  ): Promise<void> {
    if (!this.redisClient) await this.initialize();
    await this.redisClient?.hSet(key, field, value);
  }

  public static async hget(
    key: string,
    field: string
  ): Promise<string | undefined> {
    if (!this.redisClient) await this.initialize();
    return await this.redisClient?.hGet(key, field);
  }

  public static async set(key: string, value: string): Promise<void> {
    if (!this.redisClient) await this.initialize();
    await this.redisClient?.set(key, value);
  }

  public static async get(key: string): Promise<string | undefined> {
    if (!this.redisClient) await this.initialize();
    return await this.get(key);
  }

  public static async getMemberStatus<T>(
    chatMembers: T[]
  ): Promise<(T & { isOnline: boolean })[]> {
    return await Promise.all(
      chatMembers.map(async (chatMember) => {
        const status = await RedisStore.hget(
          `user_${(chatMember as any).userId}`,
          "status"
        );
        return { ...chatMember, isOnline: status === "online" };
      })
    );
  }
}

export default RedisStore;
