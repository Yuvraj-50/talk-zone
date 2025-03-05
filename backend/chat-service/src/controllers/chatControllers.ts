import { Request, Response } from "express";
import prisma from "../utils/prismaClient";
import { Role } from "@prisma/client";
import { CHATTYPE } from "../types";
import RedisStore from "../redis/redisStore";

interface Message {
  id: number;
  chatId: number;
  senderId: number;
  message: string;
  sent_at: number;
  role: Role;
  userId: number;
  userName: string;
}

type createChatData = {
  chatId: number;
  chatName: string;
  chatType: CHATTYPE;
  createdBy: number;
  unreadCount: number;
  chatMembers: {
    userId: number;
    userName: string;
    role: Role;
    joined_at: Date;
    isOnline: boolean;
  }[];
  profilePicture: string | null;
  latestMessage: {
    senderId: number;
    message: string;
    sent_at: Date;
  };
};

export async function GetChat(req: Request, res: Response) {
  const loggedInUserId = req.user?.id;

  try {
    const chats = await prisma.chats.findMany({
      where: {
        chatmembers: {
          some: { userId: loggedInUserId },
        },
      },
      include: {
        chatmembers: {
          select: {
            userId: true,
            userName: true,
            userEmail: true,
            role: true,
            joined_at: true,
          },
        },
        unreadCount: {
          where: { userId: loggedInUserId },
          select: {
            count: true,
          },
        },
        messages: {
          select: {
            message: true,
            sent_at: true,
            senderId: true,
          },
          take: 1,
          orderBy: {
            sent_at: "desc",
          },
        },
      },
      orderBy: {
        latestTimeStamp: "desc",
      },
    });


    const formattedChats: createChatData[] = [];

    for (const chat of chats) {
      const otherUser = chat.chatmembers.find(
        (member) => member.userId != loggedInUserId
      );

      const chatmemeberswithstatus = await RedisStore.getMemberStatus(
        chat.chatmembers
      );

      formattedChats.push({
        chatId: chat.id,
        chatName: chat.name ?? otherUser?.userName ?? "unkonwnChat",
        chatType: chat.name ? CHATTYPE.GROUPCHAT : CHATTYPE.ONETOONE,
        profilePicture: chat.profilePic,
        createdBy: chat.createdBy,
        chatMembers: chatmemeberswithstatus,
        unreadCount:
          chat.unreadCount.length > 0 ? chat.unreadCount[0].count : 0,
        latestMessage: chat.messages[0] ?? {},
      });
    }

    res.json(formattedChats);
  } catch (error) {
    res.status(404).json({ msg: "Internal server errror", error });
  }
}

export async function GetChatMessages(req: Request, res: Response) {
  try {
    const chatId: number = Number(req.params.id);

    const messages = await prisma.$queryRaw<Message[]>`
        SELECT "Messages".*, "ChatMembers"."userId", "ChatMembers"."userName", "ChatMembers"."role"
        FROM "Messages"
        JOIN "ChatMembers" ON "Messages"."senderId" = "ChatMembers"."userId"
        WHERE "Messages"."chatId" = ${chatId} and "ChatMembers"."chatId" = ${chatId}
        ORDER BY "Messages"."sent_at" ASC; 
      `;
    res.json(messages);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "internal server error", error });
  }
}
