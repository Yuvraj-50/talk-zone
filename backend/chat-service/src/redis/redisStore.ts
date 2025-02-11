import { Role } from "@prisma/client";
import { createClient, RedisClientType } from "redis";

interface ChatMembers {
  userId: number;
  userName: string;
  role: Role;
  joined_at: Date;
  userEmail: string;
}

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

  public static async getMemberStatus(
    chatMembers: ChatMembers[]
  ): Promise<ClientPayloadChatMembers[]> {
    let res: ClientPayloadChatMembers[] = [];

    for (const chatMember of chatMembers) {
      const status = await RedisStore.hget(
        `user_${chatMember.userId}`,
        "status"
      );
      if (status == "online") {
        res.push({ ...chatMember, isOnline: true });
      } else {
        res.push({ ...chatMember, isOnline: false });
      }
    }
    return res;
  }
}

export default RedisStore;
