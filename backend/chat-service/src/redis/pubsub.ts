import { createClient, RedisClientType } from "redis";

class RedisService {
  private static RedisInstance: RedisClientType | null = null;
  private static publisher: RedisClientType;
  private static subscriber: RedisClientType;

  private constructor() {}

  private static async initialize() {
    if (!this.RedisInstance) {
      this.publisher = createClient({ url: "redis://localhost:6379" });
      this.subscriber = createClient({ url: "redis://localhost:6379" });

      await this.publisher.connect();
      await this.subscriber.connect();
      this.RedisInstance = this.publisher;
    }
  }

  public static async getInstance() {
    if (!this.RedisInstance) {
      await this.initialize();
    }
    return this.RedisInstance;
  }

  public static async subscribe(
    channelName: string,
    callBack: (msg: string) => void
  ) {
    if (!this.subscriber) {
      await this.initialize();
    }

    await this.subscriber.subscribe(channelName, (message: string) => {
      callBack(message);
      console.log("sending the pending messages to rahul");
    });

    console.log(`Subscribed to channel: ${channelName}`);
  }

  public static async publish(channelName: string, message: string) {
    if (!this.publisher) {
      await this.initialize();
    }

    await this.publisher.publish(channelName, message);
    console.log(`Message published to channel: ${channelName}`);
  }

  public static async unSubscribe(channelName: string) {
    if (!this.subscriber) {
      await this.initialize();
    }

    await this.subscriber.unsubscribe(channelName);
    console.log(`Unsubscribed from channel: ${channelName}`);
  }
}

export default RedisService;
