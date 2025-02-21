import { ChangeEvent, Dispatch, SetStateAction, useState } from "react";
import { useAuthStore } from "../../../zustand/authStore";
import useWebSocketStore from "../../../zustand/socketStore";
import { ChatMembers, CHATTYPE, MessageType } from "../../../types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface GroupDetailsProps {
  memberList: ChatMembers[];
  setMemberList: Dispatch<SetStateAction<ChatMembers[]>>;
}

function GroupDetails({ memberList, setMemberList }: GroupDetailsProps) {
  const [groupName, setGroupName] = useState<string>("");
  const { user } = useAuthStore();
  const { sendMessage, socket } = useWebSocketStore();

  async function handleCreateGroup(e: ChangeEvent<HTMLFormElement>) {
    e.preventDefault();
    if (user) {
      memberList.push({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
      });
    }

    if (socket) {
      const payload = {
        type: MessageType.CREATE_CHAT,
        data: {
          members: memberList,
          chatType: CHATTYPE.GROUPCHAT,
          groupName: groupName,
          createrId: user?.id,
        },
      };
      sendMessage(payload);
      setMemberList([]);
      setGroupName("");
    }
  }

  return (
    <form onSubmit={handleCreateGroup}>
      <label htmlFor="group-name">Enter Group Name</label>

      <Input
        id="group-name"
        placeholder="eg : class-group"
        value={groupName}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setGroupName(e.target.value)
        }
        className="mb-5 mt-2"
      />
      <Button className="w-full">create</Button>
    </form>
  );
}

export default GroupDetails;
