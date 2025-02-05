import { Request } from "express";
import WebSocket, { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
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
      type: "AUTH_STATUS",
      data: {
        message: "Unauthorized: No token provided",
      },
    };
    console.log("unauthrized user");
    ws.send(JSON.stringify(payload));
    ws.close();
    return;
  }

  await UserManager.getInstance().addUser(userDetail.userId, ws);

  ws.on("message", async (msg) => {
    MessageManager.getInstance().handleMessage(
      msg.toString(),
      +userDetail.userId
    );
  });

  ws.on("close", async () => {
    await UserManager.getInstance().removeUser(userDetail.userId);
  });
});

wss.on("close", () => {
  console.log("socket closed");
});
