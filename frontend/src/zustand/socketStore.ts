import { create } from "zustand";

interface WebSocketState {
  socket: WebSocket | null;
}

export enum MessageType {
  SEND_MESSAGE = "SEND_MESSAGE",
  CREATE_CHAT = "CREATE_CHAT",
  TYPING = "TYPING",
  ONLINE_STATUS = "ONLINE_STATUS",
  AUTH_STATUS = "AUTH_STATUS",
  ERROR = "ERROR",
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
}

const useWebSocketStore = create<WebSocketState & WebSocketAction>(
  (set, get) => {
    const messageHandlers: Map<string, (data: any) => void> = new Map();

    return {
      socket: null,

      connect: (url: string) => {
        const ws = new WebSocket(url);

        ws.onopen = () => {
          console.log("WebSocket connected");
          set({ socket: ws });
        };

        ws.onclose = () => {
          console.log("WebSocket disconnected");
          set({ socket: null });
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
        };

        ws.onmessage = (event) => {
          const { data, type }: SocketMessageRequest = JSON.parse(event.data);
          const handler = messageHandlers.get(type);
          if (handler) {
            handler(data);
          }
        };
      },

      disconnect: () => {
        const { socket } = get();
        socket?.close();
        set({ socket: null });
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
    };
  }
);

export default useWebSocketStore;
