import { getUserProfiles } from "@/api/auth";
import {
  ChatMembers,
  CHATTYPE,
  UpdateProfileAndBio,
  User,
  UserConversation,
} from "@/types";
import useActiveChatStore from "@/zustand/activeChatStore";
import { useAuthStore } from "@/zustand/authStore";
import { useChatStore } from "@/zustand/ChatsStore";
import { useMessagesStore } from "@/zustand/messageStore";
import useWebSocketStore from "@/zustand/socketStore";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function evalActiveChatProfile(
  chat: UserConversation,
  currUser: number,
  userProfiles: UpdateProfileAndBio[]
): string {
  let profilePicture = "";
  if (chat.chatType == CHATTYPE.GROUPCHAT) {
    profilePicture = chat.profilePicture;
  } else {
    const oppositePerson = chat.chatMembers.find(
      (member) => member.userId != currUser
    );

    const x = userProfiles.find((user) => user.id == oppositePerson?.userId);

    if (x) {
      profilePicture = x.profileUrl;
    }
  }

  return profilePicture;
}

export async function fetchUserProfile(chatIds: number[]) {
  const data = await getUserProfiles(chatIds);
  return data;
}

export function processUserProfileAndBio(
  chats: UserConversation[],
  currUser: number,
  userProfiles: UpdateProfileAndBio[]
): void {
  chats.forEach((chat) => {
    if (chat.profilePicture == null) {
      const user = currUser;
      const profilePicture = evalActiveChatProfile(chat, user, userProfiles);
      chat.profilePicture = profilePicture;
    }
    chat.chatMembers.forEach((member) => {
      const userUpdate = userProfiles.find((user) => user.id === member.userId);
      if (userUpdate) {
        member.profilePicture = userUpdate.profileUrl;
        member.bio = userUpdate.bio;
      }
    });
  });
}

export function getUserIds(chats: UserConversation[]): number[] {
  const userId: Set<number> = new Set<number>();
  chats.forEach((chat) =>
    chat.chatMembers.forEach((member) => userId.add(member.userId))
  );

  return Array.from(userId);
}

export function addCurrentUser(chatMembers: ChatMembers[], user: User): void {
  chatMembers.push({
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
  });
}

export const calculateDate = (time: string | number | Date): string => {
  const messageTime = new Date(time);
  const now = new Date();

  const messageDateOnly = new Date(messageTime);
  messageDateOnly.setHours(0, 0, 0, 0);

  const nowDateOnly = new Date(now);
  nowDateOnly.setHours(0, 0, 0, 0);

  const isToday = messageDateOnly.getTime() === nowDateOnly.getTime();

  const yesterday = new Date(nowDateOnly);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = messageDateOnly.getTime() === yesterday.getTime();

  if (isToday) {
    return messageTime.toLocaleTimeString("en-US", {
      minute: "2-digit",
      hour: "2-digit",
    });
  } else if (isYesterday) {
    return "Yesterday";
  } else {
    const currentYear = new Date().getFullYear();
    const messageYear = messageTime.getFullYear();

    if (messageYear === currentYear) {
      return messageTime.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } else {
      return messageTime.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  }
};

export function resetAllStores() {
  useChatStore.getState().reset();
  useActiveChatStore.getState().reset();
  useAuthStore.getState().resetState();
  useMessagesStore.getState().reset();
  useWebSocketStore.getState().resetWebSocket();
}
