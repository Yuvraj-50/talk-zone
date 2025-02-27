import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useAuthStore } from "../../../zustand/authStore";
import axios from "axios";
import { ChatMembers, CHATTYPE, User } from "../../../types";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { Plus } from "lucide-react";
import Adduseritem from "@/components/Adduseritem";
import useCreateChat from "@/hooks/use-createchat";
import { addCurrentUser } from "@/lib/utils";

interface UserDate {
  users: User[];
}

interface NewChatProps {
  changeStep: Dispatch<SetStateAction<number>>;
  setIsPopOverOpen: Dispatch<SetStateAction<boolean>>;
}

function NewChat({ changeStep, setIsPopOverOpen }: NewChatProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState<string>("");
  const user = useAuthStore((state) => state.user);
  const { createChat, findExistingChat } = useCreateChat();

  async function handlecreateNewChat(member: ChatMembers) {
    let otherMembers: ChatMembers[] = [member];

    if (user) {
      addCurrentUser(otherMembers, user);
    }

    if (otherMembers.length != 2) {
      console.log("low members");
      return;
    }

    createChat(otherMembers, CHATTYPE.ONETOONE);
    setIsPopOverOpen(false);
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
              userImage={Eachuser.profileUrl}
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
