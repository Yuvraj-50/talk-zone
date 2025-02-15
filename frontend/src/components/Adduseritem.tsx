import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface AdduseritemProps {
  userName: string;
  userEmail?: string;
  userImage?: string;
  existinguser?: boolean;
  onClick?: () => void;
}

function Adduseritem({
  userEmail,
  userImage,
  userName,
  onClick,
  existinguser,
}: AdduseritemProps) {
  return (
    <div
      className="flex hover:bg-secondary items-center border-b mt-3 rounded-r-lg gap-3 p-2 cursor-pointer"
      onClick={onClick}
    >
      <Avatar className="h-8 w-8 border border-primary flex justify-center items-center">
        <AvatarImage src={userImage} />
        <AvatarFallback>{userName[0].toUpperCase()}</AvatarFallback>
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
