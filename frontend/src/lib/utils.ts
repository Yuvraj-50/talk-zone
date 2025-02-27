import {
  ChatMembers,
  CHATTYPE,
  UpdateProfileAndBio,
  User,
  UserConversation,
} from "@/types";
import axios from "axios";
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
  const response = await axios.post<{ users: UpdateProfileAndBio[] }>(
    "http://localhost:9000/api/v1/auth/userProfiles",
    { users: chatIds },
    { withCredentials: true }
  );

  return response.data;
}

export async function getAllChats() {
  try {
    const response = await axios.get<UserConversation[]>(
      "http://localhost:3000/api/v1/chat",
      {
        withCredentials: true,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Failed to fetch chats", error);
  }
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
