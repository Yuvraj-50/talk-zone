import { memo, useState } from "react";
import GroupChat from "./GroupChat";
import NewChat from "./NewChat";
import GroupDetails from "./GroupDetails";
import { ChatMembers, CHATTYPE } from "../../../types";
import { SquarePlus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function CreateChat() {
  const [step, setStep] = useState(1);
  const [memberList, setMemberList] = useState<ChatMembers[]>([]);
  const [isPopOverOpen, setIsPopOverOpen] = useState<boolean>(false);

  return (
    <div>
      <Popover
        open={isPopOverOpen}
        onOpenChange={() => {
          setIsPopOverOpen((prev) => !prev);
          setMemberList([]);
        }}
      >
        <PopoverTrigger asChild>
          <SquarePlus
            className="cursor-pointer text-primary"
            onClick={() => {
              setStep(1);
            }}
          />
        </PopoverTrigger>
        <PopoverContent className="min-h-80">
          {step == 1 && (
            <NewChat changeStep={setStep} setIsPopOverOpen={setIsPopOverOpen} />
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
              setIsPopOverOpen={setIsPopOverOpen}
            />
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default memo(CreateChat);
