import { z } from "zod";
import { BaseMessageHandler } from "../handlers/BaseMessagehandler";
import { SendMessageHandler } from "../handlers/SendMessagehandler";
import { MessageType, UserSocketMessageSchema } from "../types";
import CreateChatHandler from "../handlers/CreateChathandler";

class MessageManager {
  private static instance: MessageManager | null = null;
  private handlers: Map<string, BaseMessageHandler>;

  private constructor() {
    this.handlers = new Map();
    this.handlers.set(MessageType.SEND_MESSAGE, new SendMessageHandler());
    this.handlers.set(MessageType.CREATE_CHAT, new CreateChatHandler());
  }

  static getInstance(): MessageManager {
    if (!this.instance) {
      this.instance = new MessageManager();
    }

    return this.instance;
  }

  async handleMessage(message: string, userId: number) {
    try {
      const payload = JSON.parse(message);
      const { success, data } = UserSocketMessageSchema.safeParse(payload);

      if (!success) {
        console.log("incorrect Inputs");
        console.log(data);
        return;
      }

      const handler = this.handlers.get(data.type);

      if (handler) {
        await handler.handle(data, userId);
      } else {
        console.log(`No handler found for message type: ${payload.type}`);
      }
    } catch (error) {
      console.log("error in validation", error);
    }
  }
}

export default MessageManager;
