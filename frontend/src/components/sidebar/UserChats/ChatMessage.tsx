import { FaRegUserCircle } from "react-icons/fa";
import { CHATTYPE } from "../../../types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ConversationProps {
  chatName: string;
  profilePic?: string;
  latestMessage?: string;
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
  chatId,
  isOnline,
  chatType,
  unreadCount,
  onClick,
  isActive = false,
}: ConversationProps) => {
  return (
    <Button
      variant={isActive ? "secondary" : "ghost"}
      className={cn(
        "w-full px-4 py-6 h-auto flex items-center justify-between hover:bg-secondary/80",
        isActive && "bg-secondary"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-4 w-full">
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
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background">
              <span
                className={cn(
                  "absolute inline-flex h-full w-full rounded-full",
                  isOnline ? "bg-primary" : "bg-gray-500"
                )}
              >
                {isOnline && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
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
              <span className="text-sm text-muted-foreground">2:30 pm</span>
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
              {latestMessage}
            </p>
            {pendingMessages > 0 && (
              <Badge variant="default" className="ml-2">
                {pendingMessages}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Button>
  );
};

export default Conversation;
