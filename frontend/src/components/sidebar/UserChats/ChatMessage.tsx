// Conversation.js
import { FaRegUserCircle, FaCircle } from "react-icons/fa";
import useActiveChatStore from "../../../zustand/activeChatStore";
import { CHATTYPE } from "../../../types";

interface Conversation {
  chatName: string;
  profilePic?: string;
  latestMessage?: string;
  pendingMessages?: number;
  onClick?: () => void;
  chatId: number;
  isOnline: boolean;
  chatType: CHATTYPE;
}

const Conversation = ({
  chatName,
  profilePic,
  latestMessage,
  pendingMessages = 0,
  chatId,
  isOnline,
  chatType,
  onClick,
}: Conversation) => {
  const { activechatId } = useActiveChatStore();

  return (
    <div
      className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors duration-300 ${
        activechatId === chatId
          ? "bg-gray-800 hover:bg-gray-700"
          : "bg-gray-900 hover:bg-gray-800"
      }`}
      onClick={onClick}
    >
      {/* Profile Picture */}
      <div className="flex items-center">
        {profilePic ? (
          <img
            src={profilePic}
            alt={chatName}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <FaRegUserCircle size={40} className="text-gray-500" />
        )}

        {/* Online Status Indicator */}
        {chatType === CHATTYPE.ONETOONE && (
          <div
            className={`ml-2 w-3 h-3 rounded-full ${
              isOnline ? "bg-green-500" : "bg-gray-500"
            }`}
          />
        )}
      </div>

      {/* Conversation Details */}
      <div className="flex-1 ml-4">
        <div className="flex justify-between items-center">
          <h3 className="text-white font-medium text-lg">{chatName}</h3>
          <span className="text-gray-400 text-sm">2:30 pm</span>
        </div>
        <div className="flex justify-between items-center mt-1">
          <p className="text-gray-400 text-sm">{latestMessage}</p>
          {pendingMessages > 0 && (
            <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
              {pendingMessages}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Conversation;