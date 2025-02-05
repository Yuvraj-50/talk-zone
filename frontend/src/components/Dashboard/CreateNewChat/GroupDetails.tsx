import { ChangeEvent, Dispatch, SetStateAction, useState } from "react";
import Input from "../../../ui/Input";
import { useAuthStore } from "../../../zustand/authStore";
import useWebSocketStore, { MessageType } from "../../../zustand/socketStore";

type MemberList = {
  userId: number;
  userName: string;
};

type createChatData = {
  chatId: number;
  chatName: string;
  chatType: "oneToOne" | "groupchat";
  chatMembers: {
    userId: number;
    userName: string;
  }[];
};

interface GroupDetailsProps {
  memberList: MemberList[];
  setMemberList: Dispatch<SetStateAction<MemberList[]>>;
}

function GroupDetails({ memberList, setMemberList }: GroupDetailsProps) {
  const [groupName, setGroupName] = useState<string>("");
  const { userId: myUserId, email: userName } = useAuthStore();
  const { sendMessage, socket } = useWebSocketStore();

  async function handleCreateGroup() {
    if (myUserId) {
      memberList.push({ userName, userId: myUserId });
    }

    // const response = await axios.post<createChatData>(
    //   "http://localhost:3000/api/v1/chat/create",
    //   {
    //     members: memberList,
    //     chatType: "group",
    //     groupName: groupName,
    //     createrId: myUserId,
    //   },
    //   {
    //     withCredentials: true,
    //   }
    // );

    // console.log(response, "data sent = ", {
    //   members: memberList,
    //   chatType: "group",
    //   groupName: groupName,
    //   createrId: myUserId,
    // });

    // updateChat([...useChatStore.getState().chats, response.data]);
    // setMemberList([]);
    // updateActiveChatId(response.data.chatId);
    // updateActiveChatName(response.data.chatName);
    // const messages = await changeChat(response.data.chatId);
    // updateMessages(messages);

    if (socket) {
      const payload = {
        type: MessageType.CREATE_CHAT,
        data: {
          members: memberList,
          chatType: "group",
          groupName: groupName,
          createrId: myUserId,
        },
      };
      sendMessage(payload);
      setMemberList([]);
      setGroupName("");
      
    }
  }

  return (
    <>
      <Input
        label="groupName"
        placeholder="eg : class-group"
        value={groupName}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setGroupName(e.target.value)
        }
      />
      <button onClick={handleCreateGroup} className="bg-green-50">
        create
      </button>
    </>
  );
}

export default GroupDetails;
