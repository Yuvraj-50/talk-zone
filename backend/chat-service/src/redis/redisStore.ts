import { createClient, RedisClientType } from "redis";

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
}

export default RedisStore;
