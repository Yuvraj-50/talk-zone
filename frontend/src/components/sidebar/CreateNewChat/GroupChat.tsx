import { useEffect, useState } from "react";
import { Dispatch, SetStateAction } from "react";
import { ChatMembers, User } from "../../../types";
import { CircleArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import Adduseritem from "@/components/Adduseritem";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { getUsers } from "@/api/auth";

interface GroupChatProps {
  memberList: ChatMembers[];
  alreadyMember?: ChatMembers[];
  changeStep: Dispatch<SetStateAction<number>>;
  setMemberList: Dispatch<SetStateAction<ChatMembers[]>>;
}

function GroupChat({
  changeStep,
  memberList,
  setMemberList,
  alreadyMember,
}: GroupChatProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState<string>("");

  function handleAddMember(
    userId: number,
    userName: string,
    userEmail: string
  ) {
    setMemberList((prev: ChatMembers[]) => [
      ...prev,
      { userId, userName, userEmail },
    ]);
  }

  function handleRemoveMember(userId: number) {
    const filteredList = memberList.filter((member) => member.userId != userId);
    setMemberList(filteredList);
  }

  function handleCreateGroupNextStep() {
    changeStep(3);
  }

  function isUserAlreadyMember(id: number): boolean {
    if (!alreadyMember) return false;
    return alreadyMember.find((member) => member.userId == id) ? true : false;
  }

  function isMemberPresent(id: number): boolean {
    if (!memberList) return false;
    return memberList.find((member) => member.userId == id) ? true : false;
  }

  useEffect(() => {
    if (search === "") {
      setUsers([]);
      return;
    }

    async function fetchUsers() {
      try {
        const data = await getUsers(search);
        setUsers([...data.users]);
      } catch (error) {
        console.log("something went wrong");
      }
    }

    fetchUsers();
  }, [search]);

  return (
    <div className="flex flex-col  justify-between">
      <div className="flex gap-2 items-center mb-4">
        <CircleArrowLeft
          className="cursor-pointer text-primary"
          onClick={() => {
            changeStep(1);
            setMemberList([]);
          }}
        />
        <p>Create new group</p>
      </div>

      <Input
        placeholder="search for user email"
        onChange={(e) => setSearch(e.target.value)}
        value={search}
      />

      <ScrollArea className="h-52">
        {users.map((user) => (
          <div key={user.id} className="flex items-center">
            <label htmlFor={user.email}>
              <Adduseritem
                userImage={user.profileUrl}
                className="cursor-pointer"
                userName={user.name}
                userEmail={user.email}
              />
            </label>
            <Checkbox
              disabled={isUserAlreadyMember(user.id)}
              defaultChecked={
                isUserAlreadyMember(user.id) || isMemberPresent(user.id)
              }
              id={user.email}
              onCheckedChange={(checked) => {
                if (checked) {
                  handleAddMember(user.id, user.name, user.email);
                } else {
                  handleRemoveMember(user.id);
                }
              }}
            />
          </div>
        ))}
      </ScrollArea>

      <div className="sticky bottom-0">
        <ScrollArea className="my-3">
          <div className="flex">
            {memberList.map((member) => (
              <Avatar key={member.userId}>
                <AvatarImage src=""></AvatarImage>
                <AvatarFallback>
                  {member.userName[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {memberList.length > 0 && (
          <Button onClick={handleCreateGroupNextStep}>Next</Button>
        )}
      </div>
    </div>
  );
}

export default GroupChat;
