import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface AdduseritemProps {
  userName: string;
  userEmail?: string;
  userImage?: string;
  existinguser?: boolean;
  className?: string;
  avatarFallBack?: JSX.Element;
  onClick?: () => void;
}

function Adduseritem({
  className,
  userEmail,
  userImage,
  userName,
  onClick,
  existinguser,
  avatarFallBack,
}: AdduseritemProps) {
  return (
    <div
      className={cn("flex items-center mt-3 rounded-r-lg gap-3 p-2", className)}
      onClick={onClick}
    >
      <Avatar className="h-8 w-8 flex justify-center items-center">
        <AvatarImage className="w-10 h-10 rounded-full" src={userImage} />
        <AvatarFallback>
          {avatarFallBack
            ? avatarFallBack
            : (userName && userName[0].toUpperCase()) ?? "-"}
        </AvatarFallback>
      </Avatar>

      <div>
        <p>{userName}</p>
        <p>{userEmail}</p>

        <p className="text-primary">
          {existinguser && "Continue conservation"}
        </p>
      </div>
    </div>
  );
}

export default Adduseritem;
