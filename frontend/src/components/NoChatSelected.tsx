import { MessageSquare } from "lucide-react";

function NoChatSelected() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="flex flex-col items-center max-w-md text-center p-8">
        <MessageSquare className="w-12 h-12  mb-4" />
        <h2 className="text-2xl font-semibold mb-2">
          No conversation selected
        </h2>
        <p>
          Choose a conversation from the sidebar or start a new one to begin
          messaging.
        </p>
      </div>
    </div>
  );
}

export default NoChatSelected;
