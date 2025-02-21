import prisma from "./prismaClient";

export async function fetchAllGroupMembers(groupId: number) {
  const groupMembers = await prisma.chatMembers.findMany({
    where: {
      chatId: groupId,
    },
    select: {
      userId: true,
      userEmail: true,
      userName: true,
      role: true,
      joined_at: true,
    },
  });

  return groupMembers;
}

export async function storeMsgInDb(
  message: string,
  groupId: number,
  userId: number
) {
  return await prisma.messages.create({
    data: { message: message, chatId: groupId, senderId: userId },
    select: {
      id: true,
      message: true,
      senderId: true,
      sent_at: true,
      chatId: true,
    },
  });
}

export const parseCookies = (cookieString: string) => {
  return cookieString.split("; ").reduce((acc, cookie) => {
    const [key, value] = cookie.split("=");
    acc[key] = decodeURIComponent(value);
    return acc;
  }, {} as Record<string, string>);
};
