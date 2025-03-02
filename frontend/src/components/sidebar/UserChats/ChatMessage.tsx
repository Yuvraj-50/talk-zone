import { CHATTYPE, LatestMessage } from "../../../types";
import { calculateDate, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ConversationProps {
  chatName: string;
  profilePic?: string;
  latestMessage?: LatestMessage;
  pendingMessages?: number;
  onClick?: () => void;
  chatId: number;
  isOnline: boolean;
  unreadCount: number;
  chatType: CHATTYPE;
  isActive?: boolean;
}

const Conversation = ({
  chatName,
  profilePic,
  latestMessage,
  pendingMessages = 0,
  isOnline,
  chatType,
  unreadCount,
  onClick,
  isActive = false,
}: ConversationProps) => {
  return (
    <>
      <div
        className={cn(
          "px-4 py-6 h-auto w-full hover:bg-secondary/80 cursor-default rounded-xl",
          isActive && "bg-secondary"
        )}
        onClick={onClick}
      >
        <div className="flex items-center gap-4 ">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage
                className="w-10 h-10 rounded-full"
                src={profilePic}
                alt={chatName}
              />
              <AvatarFallback> {chatName[0].toUpperCase()} </AvatarFallback>
            </Avatar>

            {chatType === CHATTYPE.ONETOONE && (
              <span className="absolute bottom-0  right-0 w-3 h-3 rounded-full border-2 border-background">
                <span
                  className={cn(
                    "absolute inline-flex h-full w-full rounded-full",
                    isOnline ? "bg-primary" : "bg-gray-500"
                  )}
                >
                  {isOnline && (
                    <span className="animate-ping w-full absolute inline-flex h-full  rounded-full bg-primary opacity-75" />
                  )}
                </span>
              </span>
            )}
          </div>

          {/* Conversation Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-lg truncate">{chatName}</span>
              <div className="flex items-center gap-2 flex-shrink-0">
                {latestMessage?.sent_at && (
                  <span
                    className={cn(
                      "text-sm",
                      `${unreadCount > 0 && "text-primary"}`
                    )}
                  >
                    {calculateDate(latestMessage?.sent_at)}
                  </span>
                )}
                {unreadCount > 0 && (
                  <Badge
                    variant="default"
                    className="h-5 w-5 flex items-center justify-center p-0"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mt-1">
              <p className="text-sm text-muted-foreground truncate">
                {latestMessage?.message}
              </p>
              {pendingMessages > 0 && (
                <Badge variant="default" className="ml-2">
                  {pendingMessages}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Conversation;
