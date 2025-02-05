type chatMessageProps = {
  chatName: string;
  chatId: number;
};

function ChatMessage({ chatName, chatId }: chatMessageProps) {
  return (
    <div className="p-2 hover:bg-slate-500">
      {chatName} {chatId}
    </div>
  );
}

export default ChatMessage;
