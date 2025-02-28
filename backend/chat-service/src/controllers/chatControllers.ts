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

// export async function CreateChat(req: Request, res: Response) {
//   const loggedInUserId = req.user?.id;

//   const { members, chatType, groupName, createrId } = req.body;

//   if (!Array.isArray(members) || members.length === 0) {
//     res
//       .status(400)
//       .json({ error: "Members list is required and should be an array." });
//     return;
//   }

//   if (chatType !== CHATTYPE.ONETOONE && chatType !== CHATTYPE.GROUPCHAT) {
//     res
//       .status(400)
//       .json({ error: "Invalid chat type. Must be 'group' or 'oneToOne'." });
//     return;
//   }

//   if (chatType === CHATTYPE.GROUPCHAT && (!groupName || !createrId)) {
//     res.status(400).json({
//       error: "Group name and creator ID are required for group chats.",
//     });
//     return;
//   }

//   try {
//     const chatData = await prisma.chats.create({
//       data:
//         chatType === "group"
//           ? { name: groupName, createdBy: createrId }
//           : { createdBy: createrId },
//     });

//     const memberPromises = members.map(
//       (member: { userId: number; userEmail: string }) => {
//         return prisma.chatMembers.create({
//           data: {
//             userId: member.userId,
//             chatId: chatData.id,
//             userName: member.userEmail,
//             userEmail: member.userEmail,
//             role:
//               chatType === "group" && member === createrId ? "ADMIN" : "MEMBER",
//           },
//           select: {
//             userName: true,
//             userId: true,
//           },
//         });
//       }
//     );
//     // TODO SEND CHATMEMBERS ALSO
//     const chatMembers = await Promise.all(memberPromises);

//     if (chatType == CHATTYPE.GROUPCHAT) {
//       res.status(201).json({
//         message: "Chat created successfully",
//         chatId: chatData.id,
//         chatName: chatData.name,
//         chatType,
//         chatMembers,
//       });
//       return;
//     }

//     const chatName = chatMembers.filter((member) => {
//       if (member.userId != loggedInUserId) {
//         console.log(member.userId, loggedInUserId);

//         return member;
//       }
//     });

//     console.log(chatMembers, chatName, req.user);

//     res.status(201).json({
//       message: "Chat created successfully",
//       chatId: chatData.id,
//       chatName: chatName[0].userName,
//       chatType,
//       chatMembers,
//     });
//   } catch (error) {
//     console.error("Error creating chat:", error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while creating the chat." });
//   }
// }

export async function GetChat(req: Request, res: Response) {
  const loggedInUserId = req.user?.id;

  try {
    // const chatMemberships = await prisma.chatMembers.findMany({
    //   where: {
    //     userId: loggedInUserId,
    //   },
    //   select: {
    //     chatId: true,
    //     chat: {
    //       select: {
    //         name: true,
    //         createdBy: true,
    //         created_at: true,
    //         chatmembers: {
    //           select: {
    //             userId: true,
    //             userName: true,
    //             role: true,
    //             joined_at: true,
    //             userEmail: true,
    //           },
    //         },
    //       },
    //     },
    //   },
    // });

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

    console.log(chats);

    // TODO: SEND MESSAGES AND TIMESTAMP TO THE FRONTEND

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

    // for (const membership of chatMemberships) {
    //   const { chat } = membership;
    //   const otherMember = chat.chatmembers.find(
    //     (member) => member.userId !== loggedInUserId
    //   );

    //   const chatmemeberswithstatus = await RedisStore.getMemberStatus(
    //     chat.chatmembers
    //   );

    //   formattedChats.push({
    //     chatId: membership.chatId,
    //     chatName: chat.name ?? otherMember?.userName ?? "unknown chat",
    //     chatMembers: chatmemeberswithstatus,
    //     chatType: chat.name ? CHATTYPE.GROUPCHAT : CHATTYPE.ONETOONE,
    //     createdBy: chat.createdBy,
    //     // unreadCount: chat.unreadCount
    //   });
    // }

    // const formattedChats: createChatData[] = chatMemberships.map(
    // async (membership) => {
    // if (chat.name !== null) {
    //   return {
    //     chatId: membership.chatId,
    //     chatName: chat.name,
    //     chatMembers: membership.chat.chatmembers,
    //     chatType: CHATTYPE.GROUPCHAT,
    //   };
    // } else {
    //   const otherMember = chat.chatmembers.find(
    //     (member) => member.userId !== loggedInUserId
    //   );
    //   return {
    //     chatId: membership.chatId,
    //     chatName: otherMember?.userName || "Unknown User",
    //     chatMembers: membership.chat.chatmembers,
    //     chatType: CHATTYPE.ONETOONE,
    //   };
    // }
    // }
    // );
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
