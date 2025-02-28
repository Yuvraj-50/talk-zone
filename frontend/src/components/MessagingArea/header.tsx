import { addCurrentUser, cn } from "@/lib/utils";
import Adduseritem from "../Adduseritem";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useRef, useState } from "react";
import { MessageCircleWarning } from "lucide-react";
import { User } from "lucide-react";
import { useChatStore } from "@/zustand/ChatsStore";
import {
  ChatMembers,
  CHATTYPE,
  MessageType,
  UserConversationChatMembers,
} from "@/types";
import GroupChat from "../sidebar/CreateNewChat/GroupChat";
import { Button } from "../ui/button";
import { Sheet } from "../ui/sheet";
import useWebSocketStore from "@/zustand/socketStore";
import { useToast } from "@/hooks/use-toast";
import useActiveChatStore from "@/zustand/activeChatStore";
import useCreateChat from "@/hooks/use-createchat";
import { useAuthStore } from "@/zustand/authStore";

interface MessageAreaHeaderProps {
  className?: string;
  onClick?: () => void;
}

const sideBarItems = [
  { icon: <MessageCircleWarning size="20px" />, title: "Overview" },
  { icon: <User />, title: "ChatMembers" },
];

function MessageAreaHeader({ className, onClick }: MessageAreaHeaderProps) {
  const [itemSelected, setItemSelected] = useState<string>("Overview");
  const [memberList, setMemberList] = useState<ChatMembers[]>([]);
  const [currStep, setCurrStep] = useState(1);
  const [isPopOver, setIsPopOver] = useState(false);

  const { activeChatName, activechatId, activeChatPicture } =
    useActiveChatStore();
  const chats = useChatStore((state) => state.chats);
  const activeChatMembers = chats.find((chat) => chat.chatId === activechatId);
  const alreadyMembers = useRef(activeChatMembers?.chatMembers).current;
  const { socket, sendMessage } = useWebSocketStore();
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);
  const { createChat } = useCreateChat();

  function handleAddMemberToGroup() {
    const payload = {
      type: MessageType.ADD_MEMBER,
      data: {
        chatId: activechatId,
        members: memberList,
      },
    };

    if (socket) {
      sendMessage(payload);
      setMemberList([]);
      setIsPopOver(false);
      toast({ description: "Member added successfully" });
    }
  }

  function handleListItem(title: string) {
    setItemSelected(title);
    setMemberList([]);
  }

  function handleChatMemberClick(member: ChatMembers) {
    if (user) {
      if (member.userId == user.id) return;

      const otherMembers = [member];
      addCurrentUser(otherMembers, user);
      createChat(otherMembers, CHATTYPE.ONETOONE);
      setIsPopOver(false);
    }
  }

  return (
    <Popover
      open={isPopOver}
      onOpenChange={() => {
        setMemberList([]);
        setCurrStep(1);
        setItemSelected("Overview");
        setIsPopOver((prev) => !prev);
      }}
    >
      <div className="w-full sticky top-0 z-10 shadow-md bg-background">
        <PopoverTrigger>
          <div className={className}>
            <Adduseritem
              userName={activeChatName}
              onClick={onClick}
              className="w-full"
              userImage={activeChatPicture}
            />
          </div>
        </PopoverTrigger>
      </div>

      <PopoverContent className="w-[26rem] min-h-80 h-[27-rem]">
        <div className="flex gap-1 h-96">
          <div className="mr-3">
            {sideBarItems.map((item) => (
              <ListItem
                key={item.title}
                className={itemSelected === item.title ? "bg-secondary" : ""}
                text={item.title}
                icon={item.icon}
                onClick={() => {
                  handleListItem(item.title);
                  setCurrStep(1);
                }}
              />
            ))}
          </div>
          <div className="w-[2px] bg-muted"></div>
          <ScrollArea className="flex-2 w-72">
            {currStep == 1 && (
              <>
                {itemSelected === "Overview" && (
                  <div className="flex justify-center flex-col items-center w-full">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={activeChatPicture}></AvatarImage>
                      <AvatarFallback>
                        {activeChatName[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <p>{activeChatName}</p>
                    <p> hey i am using chat app </p>
                  </div>
                )}

                {itemSelected == "ChatMembers" && activeChatMembers && (
                  <>
                    {activeChatMembers.chatType == CHATTYPE.GROUPCHAT && (
                      <Adduseritem
                        avatarFallBack={<User />}
                        userName="Add Member"
                        onClick={() => setCurrStep(2)}
                        className="cursor-pointer"
                      />
                    )}
                    {activeChatMembers.chatMembers.map((member) => (
                      <Adduseritem
                        onClick={() => handleChatMemberClick(member)}
                        key={member.userId}
                        userName={member.userName}
                        userEmail={member.userEmail}
                        userImage={member.profilePicture}
                        className="cursor-pointer"
                      />
                    ))}
                  </>
                )}
              </>
            )}

            {currStep == 2 && (
              <GroupChat
                memberList={memberList}
                setMemberList={setMemberList}
                changeStep={setCurrStep}
                alreadyMember={alreadyMembers}
              />
            )}

            {currStep == 3 && (
              <Sheet>
                <h1>Do you want you add these members ? </h1>
                {memberList.map((member) => (
                  <p key={member.userId}> {member.userEmail} </p>
                ))}
                <Button onClick={handleAddMemberToGroup}> Add Members </Button>
              </Sheet>
            )}
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface ListItemProps {
  text: string;
  className?: string;
  icon: JSX.Element;
}

type extendedListItemProps = ListItemProps & React.ComponentProps<"div">;

const ListItem = ({
  text,
  className,
  icon,
  ...props
}: extendedListItemProps) => {
  return (
    <div
      className={cn(
        "rounded-lg gap-1 cursor-pointer flex p-2 items-center",
        className
      )}
      {...props}
    >
      {icon}
      <p className="text-sm">{text}</p>
    </div>
  );
};

export default MessageAreaHeader;
