export interface User {
  name: string;
  id: number;
  email: string;
  profileUrl: string;
}

export interface AuthResponse {
  user: User;
}

export enum Role {
  "MEMBER",
  "ADMIN",
}

export interface ChatMessage {
  id: number;
  message: string;
  senderId: number;
  sent_at: string;
  chatId: number;
  role: Role;
  userId: number;
  userName: string;
}

export interface ChatMembers {
  userId: number;
  userName: string;
  userEmail: string;
}

export enum CHATTYPE {
  "ONETOONE" = "ONETOONE",
  "GROUPCHAT" = "GROUPCHAT",
}

export interface UserConversationChatMembers extends ChatMembers {
  isOnline: boolean;
  profilePicture: string;
  bio: string;
}

export interface UserConversation {
  chatId: number;
  chatName: string;
  chatType: CHATTYPE;
  chatMembers: UserConversationChatMembers[];
  unreadCount: number;
  profilePicture: string;
  createdBy: number;
}

export enum MessageType {
  SEND_MESSAGE = "SEND_MESSAGE",
  CREATE_CHAT = "CREATE_CHAT",
  TYPING = "TYPING",
  ONLINE_STATUS = "ONLINE_STATUS",
  AUTH_STATUS = "AUTH_STATUS",
  ERROR = "ERROR",
  UNREADMESSAGECOUNT = "UNREADMESSAGECOUNT",
  ADD_MEMBER = "ADD_MEMBER",
}

export interface UpdateOnlineStatus {
  userId: number;
  isOnline: boolean;
}

export interface TypingIndicator {
  userName: string;
  chatId: number;
  isTyping: boolean;
}

export interface AddMemberToChat {
  chatId: number;
  members: UserConversationChatMembers[];
}

export interface UpdateProfileAndBio {
  id: number;
  profileUrl: string;
  bio: string;
}
