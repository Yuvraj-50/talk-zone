import { Request } from "express";
import WebSocket, { WebSocketServer } from "ws";
import UserManager from "./managers/userManager";
import MessageManager from "./managers/messageManager";
import startServer from "./server";
import { validateAuth } from "./utils/validateAuth";

const wss = new WebSocketServer({ server: startServer() });

wss.on("connection", async (ws: WebSocket, req: Request) => {
  const token = req.headers.cookie?.split("=")[1];

  const [validateToken, userDetail] = validateAuth(token);

  if (!validateToken || !userDetail) {
    const payload = {
      type: "ERROR",
      data: {
        message: "Unauthorized: No token provided",
      },
    };

    ws.send(JSON.stringify(payload));
    ws.close();
    return;
  }

  await UserManager.getInstance().addUser(userDetail.id, ws);

  ws.on("message", async (msg) => {
    MessageManager.getInstance().handleMessage(msg.toString(), userDetail.id);
  });

  ws.on("close", async () => {
    await UserManager.getInstance().removeUser(userDetail.id);
  });
});

wss.on("close", () => {
  console.log("socket closed");
});
