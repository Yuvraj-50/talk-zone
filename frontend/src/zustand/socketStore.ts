import { create } from "zustand";
import { MessageType } from "../types";
import { WebSocketExt } from "../types/ws";
import { useAuthStore } from "./authStore";
import { WEBSOCKET_SERVER_URL } from "@/lib/constant";

interface WebSocketState {
  socket: WebSocket | null;
  reconnectTimeout: NodeJS.Timeout | null;
}

interface SocketMessageRequest {
  type: MessageType;
  data: any;
}

interface WebSocketAction {
  connect: (url: string) => void;
  disconnect: () => void;
  sendMessage: (message: SocketMessageRequest) => void;
  registerMessageHandler: (type: string, handler: (data: any) => void) => void;
  resetWebSocket: () => void;
}

const HEARTBEAT_TIMEOUT = 1000 * 20 + 2 * 1000;
const RECONNECT_DELAY = 1000 * 5; // 5 seconds

function isBinary(obj: any) {
  return (
    typeof obj === "object" &&
    Object.prototype.toString.call(obj) === "[object Blob]"
  );
}

function heartBeat(ws: WebSocketExt) {
  if (!ws) {
    return;
  }

  if (ws.pingTimeOut) {
    clearInterval(ws.pingTimeOut);
  }

  ws.pingTimeOut = setTimeout(() => {
    ws.close();
  }, HEARTBEAT_TIMEOUT);

  const data = new Uint8Array(1);
  data[0] = 1;

  ws.send(data);
}

const useWebSocketStore = create<WebSocketState & WebSocketAction>(
  (set, get) => {
    const messageHandlers: Map<string, (data: any) => void> = new Map();

    // const reconnect = (url: string) => {
    //   const userAuthenticated = useAuthStore.getState().authenticated;
    //   if (!userAuthenticated) return;

    //   const { reconnectTimeout } = get();
    //   if (reconnectTimeout) {
    //     clearTimeout(reconnectTimeout);
    //   }

    //   const timeout = setTimeout(() => {
    //     get().connect(url);
    //   }, RECONNECT_DELAY);

    //   set({ reconnectTimeout: timeout });
    // };

    return {
      socket: null,
      reconnectTimeout: null,
      connect: (url: string) => {
        const ws: WebSocketExt = new WebSocket(url) as WebSocketExt;

        ws.onopen = () => {
          console.log("connection successful");
          set({ socket: ws });
        };

        ws.onclose = () => {
          console.log("WebSocket disconnected");
          set({ socket: null });

          if (ws.pingTimeOut) {
            clearTimeout(ws.pingTimeOut);
          }

          if (useAuthStore.getState().authenticated) {
            setTimeout(() => get().connect(url), RECONNECT_DELAY);
          }
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          ws.close();
        };

        ws.onmessage = (event) => {
          if (isBinary(event.data)) {
            heartBeat(ws);
          } else {
            const { data, type }: SocketMessageRequest = JSON.parse(
              event.data.toString()
            );
            const handler = messageHandlers.get(type);
            if (handler) {
              handler(data);
            }
          }
        };
      },

      disconnect: () => {
        const { socket, reconnectTimeout } = get();
        socket?.close();
        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout);
        }
        set({ socket: null, reconnectTimeout: null });
      },

      sendMessage: (message: SocketMessageRequest) => {
        const { socket } = get();
        if (socket?.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify(message));
        } else {
          console.error("WebSocket is not open.");
        }
      },

      registerMessageHandler(type, handler) {
        messageHandlers.set(type, handler);
      },

      resetWebSocket() {
        const { disconnect } = get();
        disconnect();
      },
    };
  }
);

if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    console.log("Internet restored. Reconnecting WebSocket...");
    useWebSocketStore.getState().connect(WEBSOCKET_SERVER_URL);
  });
}

export default useWebSocketStore;
