import { useEffect } from "react";
import Navbar from "./Navbar";
import ChatUsers from "./sidebar/UserChats/ChatUsers";
import MessageArea from "./MessagingArea/MessageArea";
import useWebSocketStore from "../zustand/socketStore";
import useActiveChatStore from "../zustand/activeChatStore";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";
import NoChatSelected from "./NoChatSelected";
import useRegisterHandlers from "@/hooks/use-socket-registers";

function ChatDashboard() {
  const { connect, disconnect } = useWebSocketStore();
  const activechatId = useActiveChatStore((state) => state.activechatId);
  const { messageLoading, setMessageLoading } = useRegisterHandlers();

  useEffect(() => {
    connect("ws://localhost:3000");
    return () => {
      disconnect();
    };
  }, []);

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b">
        <Navbar />
      </div>

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel
          defaultSize={30}
          minSize={20}
          maxSize={40}
          className="flex flex-col border-r"
        >
          <ChatUsers setMessageLoading={setMessageLoading} />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={70} className="flex flex-col">
          {activechatId ? (
            <MessageArea messageLoading={messageLoading} />
          ) : (
            <NoChatSelected />
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default ChatDashboard;
