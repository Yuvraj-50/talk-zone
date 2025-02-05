import { memo, useState } from "react";
import GroupChat from "./GroupChat";
import NewChat from "./NewChat";
import GroupDetails from "./GroupDetails";
import { ChatMembers } from "../../../types";

function CreateChat() {
  const [showPopUp, setShowPopUp] = useState<boolean>(false);
  const [step, setStep] = useState(1);
  const [memberList, setMemberList] = useState<ChatMembers[]>([]);

  return (
    <div className="relative">
      <h1
        className="cursor-pointer"
        onClick={() => {
          setShowPopUp((prev) => !prev);
          setStep(1);
        }}
      >
        +
      </h1>
      {showPopUp && (
        <div className="absolute top-5 bg-green-500 right-0 w-44 h-64">
          {step == 1 && (
            <NewChat
              changeStep={setStep}
              memberList={memberList}
              setMemberList={setMemberList}
            />
          )}

          {step == 2 && (
            <GroupChat
              changeStep={setStep}
              memberList={memberList}
              setMemberList={setMemberList}
            />
          )}

          {step == 3 && (
            <GroupDetails
              memberList={memberList}
              setMemberList={setMemberList}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default memo(CreateChat);
