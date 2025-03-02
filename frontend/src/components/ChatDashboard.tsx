import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import ChatUsers from "./sidebar/UserChats/ChatUsers";
import MessageArea from "./MessagingArea/MessageArea";
import useActiveChatStore from "../zustand/activeChatStore";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";
import NoChatSelected from "./NoChatSelected";
import useRegisterHandlers from "@/hooks/use-socket-registers";
import useLoadersStore from "@/zustand/loaderStore";
import Loader from "./ui/loader";
import { AlertTitle } from "./ui/alert";
import AlertLoading from "./ui/alert-loading";
import {
  fetchUserProfile,
  getAllChats,
  getUserIds,
  processUserProfileAndBio,
} from "@/lib/utils";
import { useAuthStore } from "@/zustand/authStore";
import { useChatStore } from "@/zustand/ChatsStore";

function ChatDashboard() {
  const [isChatLoading, setIsChatLoading] = useState(false);

  const activechatId = useActiveChatStore((state) => state.activechatId);
  const loaders = useLoadersStore((state) => state.loaders);
  const loggedInUser = useAuthStore((state) => state.user?.id);
  const updateChat = useChatStore((state) => state.updateChat);

  const { messageLoading, setMessageLoading } = useRegisterHandlers();

  useEffect(() => {
    setIsChatLoading(true);
    async function getUserAllChats() {
      try {
        const userChatData = await getAllChats();
        if (!userChatData) return;
        const userId: number[] = getUserIds(userChatData);
        const userProfileBio = await fetchUserProfile(userId);
        if (loggedInUser) {
          processUserProfileAndBio(
            userChatData,
            loggedInUser,
            userProfileBio.users
          );
          updateChat(userChatData);
        }
      } catch (error) {
        console.error("Failed to fetch chats", error);
      } finally {
        setIsChatLoading(false);
      }
    }

    getUserAllChats();
  }, []);

  return (
    <div className="h-screen flex flex-col relative">
      <div className="border-b">
        <Navbar />
      </div>

      {isChatLoading ? (
        <Loader
          size="lg"
          text="Hang tight chat is loading it may take upto 10 seconds"
          fullScreen
        />
      ) : (
        <>
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

          {loaders.CREATE_CHAT && (
            <AlertLoading>
              <Loader size="sm" />
              <AlertTitle>Creating Chat</AlertTitle>
            </AlertLoading>
          )}
        </>
      )}
    </div>
  );
}

export default ChatDashboard;
