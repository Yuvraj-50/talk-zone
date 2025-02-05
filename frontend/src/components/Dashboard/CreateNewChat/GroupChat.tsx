import { useEffect, useState } from "react";
import { Dispatch, SetStateAction } from "react";

import Input from "../../../ui/Input";
import axios from "axios";
import { ChatMembers, User } from "../../../types";

type UserDate = {
  users: {
    name: string;
    id: number;
    email: string;
  }[];
};

interface GroupChatProps {
  changeStep: Dispatch<SetStateAction<number>>;
  memberList: ChatMembers[];
  setMemberList: Dispatch<SetStateAction<ChatMembers[]>>;
}

function GroupChat({ changeStep, memberList, setMemberList }: GroupChatProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState<string>("");

  function handleAddMember(userId: number, userName: string) {
    setMemberList((prev: ChatMembers[]) => [...prev, { userId, userName }]);
  }

  function handleRemoveFromGroup(userId: number) {
    const filteredList = memberList.filter((member) => member.userId != userId);
    setMemberList(filteredList);
  }

  function handleCreateGroupNextStep() {
    changeStep(3);
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
      <button onClick={() => changeStep(1)}>back</button>
      Create new group
      <Input
        placeholder="search for user email"
        onChange={(e) => setSearch(e.target.value)}
        value={search}
      />
      {users.map((user) => (
        <div key={user.id}>
          <h1>
            {user.email}
            <button
              onClick={() => handleAddMember(user.id, user.email)}
              className="bg-yellow-300"
            >
              Add
            </button>
          </h1>
        </div>
      ))}
      {memberList.map((member) => (
        <div key={member.userId} className="bg-red-700">
          {member.userName}
          <button onClick={() => handleRemoveFromGroup(member.userId)}>
            Remove
          </button>
        </div>
      ))}
      {memberList.length > 0 && (
        <button onClick={handleCreateGroupNextStep} className="bg-white">
          Next
        </button>
      )}
    </div>
  );
}

export default GroupChat;
