import { Role } from "@prisma/client";
import { string, z } from "zod";

export enum MessageType {
  SEND_MESSAGE = "SEND_MESSAGE",
  CREATE_CHAT = "CREATE_CHAT",
  TYPING = "TYPING",
  ONLINE_STATUS = "ONLINE_STATUS",
  AUTH_STATUS = "AUTH_STATUS",
  ERROR = "ERROR",
  UNREADMESSAGECOUNT = "UNREADMESSAGECOUNT",
  ADD_MEMBER = "ADD_MEMBER",
  UPDATE_TEMPID = "UPDATE_TEMPID",
  MESSAGE_OPTIMISTIC = "MESSAGE_OPTIMISTIC",
}

export interface JWTPAYLOAD {
  id: number;
  email: string;
  name: string;
  profileUrl: string;
}

export enum CHATTYPE {
  "ONETOONE" = "ONETOONE",
  "GROUPCHAT" = "GROUPCHAT",
}

export interface ChatMembers {
  userId: number;
  userName: string;
  userEmail: string;
}

export type GroupMembers = {
  userId: number;
};

const sendMessageDataSchema = z.object({
  message: z.string(),
  groupId: z.number(),
  tempId: z.number(),
});

const memberSchema = z.array(
  z.object({
    userId: z.number(),
    userName: z.string(),
    userEmail: z.string(),
  })
);

export const createChatDataSchema = z
  .object({
    members: memberSchema,
    chatType: z.nativeEnum(CHATTYPE),
    groupName: z.string().nullable(),
    createrId: z.number(),
    profilePicture: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.chatType === CHATTYPE.ONETOONE) {
        return data.groupName === null;
      } else {
        return data.groupName !== null;
      }
    },
    { message: "groupName is compulsory for group chat" }
  );

const typingIndicatorSchema = z.object({
  userName: z.string(),
  chatId: z.number(),
  isTyping: z.boolean(),
});

const unReadMsgCountSchema = z.object({
  chatId: z.number(),
});

const addMemberToGroupSchema = z.object({
  chatId: z.number(),
  members: memberSchema,
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

  z.object({
    type: z.literal(MessageType.TYPING),
    data: typingIndicatorSchema,
  }),

  z.object({
    type: z.literal(MessageType.UNREADMESSAGECOUNT),
    data: unReadMsgCountSchema,
  }),

  z.object({
    type: z.literal(MessageType.ADD_MEMBER),
    data: addMemberToGroupSchema,
  }),
]);

export type UserSocketMessage = z.infer<typeof UserSocketMessageSchema>;
