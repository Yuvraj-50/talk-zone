import { Skeleton } from "../ui/skeleton";

const MessageSkeleton = ({ isRight }: { isRight: boolean }) => {
  return (
    <div
      className={`flex flex-col max-w-[70%] break-words break-all overflow-wrap-break-word ${
        isRight ? "self-end items-end" : "self-start items-start"
      }`}
    >
      <Skeleton className="h-4 w-[250px] m-3" />
      <Skeleton className="h-8 w-[200px] px-4 py-2 rounded-2xl" />
    </div>
  );
};

export default MessageSkeleton;
