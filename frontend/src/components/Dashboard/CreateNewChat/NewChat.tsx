import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Input from "../../../ui/Input";
import { useAuthStore } from "../../../zustand/authStore";
import { useChatStore } from "../../../zustand/ChatsStore";
import axios from "axios";
import useWebSocketStore, { MessageType } from "../../../zustand/socketStore";

type User = {
  name: string;
  id: number;
  email: string;
};

type memberList = {
  userId: number;
  userName: string;
};

enum CHATTYPE {
  ONETOONE = "oneToOne",
  GROUP = "groupChat",
}

type UserDate = {
  users: {
    name: string;
    id: number;
    email: string;
  }[];
};

// type MemberList = {
//   userId: number;
//   userName: string;
// };

interface NewChatProps {
  changeStep: Dispatch<SetStateAction<number>>;
  memberList: memberList[];
  setMemberList: Dispatch<SetStateAction<memberList[]>>;
}

function NewChat({ changeStep, memberList, setMemberList }: NewChatProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState<string>("");
  const { userId: myUserId, email: userName } = useAuthStore();
  const { chats } = useChatStore();
  const [chatType, setChatType] = useState<CHATTYPE>(CHATTYPE.ONETOONE);
  const sendMessage = useWebSocketStore((state) => state.sendMessage);

  const { socket } = useWebSocketStore();

  function handleAddMember(userId: number, userName: string) {
    setMemberList((prev: memberList[]) => [...prev, { userId, userName }]);
  }

  async function handlecreateNewChat() {
    if (myUserId) {
      memberList.push({ userId: myUserId, userName });
    }

    console.log({
      members: memberList,
      chatType: "oneToOne",
      groupName: null,
      createrId: myUserId,
    });

    if (memberList.length != 2) {
      console.log("Not a valid chat");
      setMemberList([]);
      return;
    }

    console.log(chats, memberList);

    const sorted = memberList.sort((a, b) =>
      a.userName.toLowerCase().localeCompare(b.userName.toLowerCase())
    );

    for (let i = 0; i < chats.length; i++) {
      console.log(chats[i]);

      const sorteChat = chats[i].chatMembers.sort((a, b) =>
        a.userName.toLowerCase().localeCompare(b.userName.toLowerCase())
      );

      if (sorted.length != sorteChat.length) continue;

      if (
        sorted[0].userId == sorteChat[0].userId &&
        sorted[1].userId == sorteChat[1].userId
      ) {
        console.log("A chat already exits");
        console.log(sorted, sorteChat, chats);
        return;
      }
    }

    // const response = await axios.post<createChatData>(
    //   "http://localhost:3000/api/v1/chat/create",
    //   {
    //     members: memberList,
    //     chatType: "oneToOne",
    //     groupName: null,
    //     createrId: myUserId,
    //   },
    //   {
    //     withCredentials: true,
    //   }
    // );

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
          chatType: "oneToOne",
          groupName: null,
          createrId: myUserId,
        },
      };
      sendMessage(payload);
      setMemberList([]);
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
        setUsers(() => [...res.data.users]);
      });
  }, [search]);

  return (
    <div>
      <h1>New Chat</h1>

      <div
        className="bg-purple-400 cursor-pointer"
        onClick={() => {
          changeStep(2);
          setMemberList([]);
        }}
      >
        Group Chat
      </div>

      <Input
        placeholder="search for user email"
        onChange={(e) => setSearch(e.target.value)}
        value={search}
      />

      {users.map((user) => (
        <div>
          <h1
            className="cursor-pointer"
            onClick={() => handleAddMember(user.id, user.email)}
          >
            {user.email}
          </h1>
        </div>
      ))}

      {memberList.map((member) => (
        <div className="bg-red-700"> {member.userName} </div>
      ))}

      <button onClick={handlecreateNewChat} className="bg-yellow-400">
        start Chatting
      </button>
    </div>
  );
}

export default NewChat;
