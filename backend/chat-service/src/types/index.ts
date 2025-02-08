import { string, z } from "zod";

export enum MessageType {
  SEND_MESSAGE = "SEND_MESSAGE",
  CREATE_CHAT = "CREATE_CHAT",
  TYPING = "TYPING",
  ONLINE_STATUS = "ONLINE_STATUS",
  AUTH_STATUS = "AUTH_STATUS",
  ERROR = "ERROR",
}

export interface JWTPAYLOAD {
  id: number;
  email: string;
  name: string;
}

export enum CHATTYPE {
  "ONETOONE" = "ONETOONE",
  "GROUPCHAT" = "GROUPCHAT",
}

const sendMessageDataSchema = z.object({
  message: z.string(),
  groupId: z.number(),
});

const createChatDataSchema = z
  .object({
    members: z.array(
      z.object({
        userId: z.number(),
        userName: z.string(),
      })
    ),
    chatType: z.nativeEnum(CHATTYPE),
    groupName: z.string().nullable(),
    createrId: z.number(),
  })
  .refine((data) => {
    if (data.chatType === CHATTYPE.ONETOONE) {
      return data.groupName === null;
    } else {
      return typeof data.groupName === "string";
    }
  });

export const UserSocketMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(MessageType.SEND_MESSAGE),
    data: sendMessageDataSchema,
  }),

  z.object({
    type: z.literal(MessageType.CREATE_CHAT),
    data: createChatDataSchema,
  }),
]);

export type UserSocketMessage = z.infer<typeof UserSocketMessageSchema>;
