import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useAuthStore } from "../../../zustand/authStore";
import { useChatStore } from "../../../zustand/ChatsStore";
import axios from "axios";
import useWebSocketStore from "../../../zustand/socketStore";
import {
  ChatMembers,
  CHATTYPE,
  MessageType,
  User,
  UserConversation,
} from "../../../types";
import { Input } from "@/components/ui/input";
import changeChat from "@/lib";
import { useMessagesStore } from "@/zustand/messageStore";
import useActiveChatStore from "@/zustand/activeChatStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { Plus } from "lucide-react";
import Adduseritem from "@/components/Adduseritem";

interface UserDate {
  users: User[];
}

interface NewChatProps {
  changeStep: Dispatch<SetStateAction<number>>;
}

function NewChat({ changeStep }: NewChatProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState<string>("");

  const { user } = useAuthStore();
  const { chats, resetUnreadCount } = useChatStore();
  const { updateMessages } = useMessagesStore();
  const { updateActiveChatId, updateActiveChatName } = useActiveChatStore();
  const { socket, sendMessage } = useWebSocketStore();

  function findExistingChat(chatMembers: ChatMembers[]) {
    const sortedMemberList = [...chatMembers].sort((a, b) =>
      a.userEmail.toLowerCase().localeCompare(b.userEmail.toLowerCase())
    );

    for (const chat of chats) {
      const sortedMember = [...chat.chatMembers].sort((a, b) =>
        a.userEmail.toLowerCase().localeCompare(b.userEmail.toLowerCase())
      );

      if (
        sortedMember[0].userEmail == sortedMemberList[0].userEmail &&
        sortedMember[1].userEmail == sortedMemberList[1].userEmail
      ) {
        return chat;
      }
    }

    return null;
  }

  async function handleExistingChat(chat: UserConversation) {
    updateMessages([]);
    updateActiveChatId(chat.chatId);
    updateActiveChatName(chat.chatName);
    const messages = await changeChat(chat.chatId);
    resetUnreadCount(chat.chatId);
    updateMessages(messages);
    const chatToChange = chats.find((chat) => chat.chatId == chat.chatId);
    if (socket && (chatToChange?.unreadCount ?? 0) > 0) {
      const payload = {
        type: MessageType.UNREADMESSAGECOUNT,
        data: {
          chatId: chat.chatId,
        },
      };

      sendMessage(payload);
    }
  }

  async function createNewChat(members: ChatMembers[]) {
    if (socket) {
      const payload = {
        type: MessageType.CREATE_CHAT,
        data: {
          members,
          chatType: CHATTYPE.ONETOONE,
          groupName: null,
          createrId: user?.id,
        },
      };
      sendMessage(payload);
    }
  }

  async function handlecreateNewChat(member: ChatMembers) {
    let otherMembers: ChatMembers[] = [member];

    if (user) {
      otherMembers.push({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
      });
    }

    if (otherMembers.length != 2) {
      console.log("low members");
      return;
    }

    const existingChat = findExistingChat(otherMembers);

    if (existingChat) {
      handleExistingChat(existingChat);
      console.log("chat already exists");
    } else {
      createNewChat(otherMembers);
      console.log("new chate created");
    }
  }

  useEffect(() => {
    if (search === "") {
      setUsers([]);
      return;
    }

    axios
      .get<UserDate>(`http://localhost:9000/api/v1/auth/getUsers/${search}`, {
        withCredentials: true,
      })
      .then((res) => {
        console.log(res.data.users);
        setUsers(() => [...res.data.users]);
      });
  }, [search]);

  return (
    <>
      <h1 className="mb-2">One to One chat</h1>

      <Input
        placeholder="Find user to chat"
        onChange={(e) => setSearch(e.target.value)}
        value={search}
      />

      <p className="text-center my-2">or</p>

      <div
        className="flex items-center cursor-pointer gap-2 hover:bg-secondary transition-colors"
        onClick={() => {
          changeStep(2);
        }}
      >
        <Avatar className="flex items-center justify-center  bg-muted rounded-full">
          <AvatarFallback>
            <Plus />
          </AvatarFallback>
        </Avatar>

        <button className="mb-2">Start Group Chat</button>
      </div>

      <ScrollArea className="h-52">
        {users.map((Eachuser) => {
          const existinguser = findExistingChat([
            {
              userId: Eachuser.id,
              userEmail: Eachuser.email,
              userName: Eachuser.name,
            },
            {
              userId: user?.id!,
              userEmail: user?.email!,
              userName: user?.name!,
            },
          ]);

          return (
            <Adduseritem
              className="hover:bg-secondary cursor-pointer"
              userName={Eachuser.name}
              userEmail={Eachuser.email}
              existinguser={existinguser ? true : false}
              key={Eachuser.id}
              onClick={() =>
                handlecreateNewChat({
                  userId: Eachuser.id,
                  userName: Eachuser.name,
                  userEmail: Eachuser.email,
                })
              }
            />
          );
        })}
      </ScrollArea>
    </>
  );
}

export default NewChat;
