import { Request } from "express";
import { WebSocket, WebSocketServer } from "ws";
import UserManager from "./managers/userManager";
import MessageManager from "./managers/messageManager";
import startServer from "./server";
import { validateAuth } from "./utils/validateAuth";
import cookieParser from "cookie-parser";
import { parseCookies } from "./utils";

const HEARTBEAT_INTERVAL = 1000 * 20; // EVERY 20 SECONDS
const HEARTBEAT_VALUE = 1;

const wss = new WebSocketServer({ server: startServer() });

function ping(ws: WebSocket) {
  const data = new Uint8Array();
  data[0] = 1;
  ws.send(data, { binary: true });
}

wss.on("connection", async (ws: WebSocket, req: Request) => {
  ws.on("error", console.error);

  const cookies = parseCookies(req.headers.cookie || "");

  const [validateToken, userDetail] = validateAuth(cookies.jwt);

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

  ws.isAlive = true;

  await UserManager.getInstance().addUser(userDetail.id, ws);

  // this is what has been agreed upon that my client will send me
  // a binary data of single size with value beign HEARTBEAT_VALUE

  ws.on("message", async (msg, isBinary) => {
    console.log("pong from client");
    if (isBinary && (msg as any)[0] == HEARTBEAT_VALUE) {
      ws.isAlive = true;
    } else {
      MessageManager.getInstance().handleMessage(msg.toString(), userDetail.id);
    }
  });

  ws.on("close", async () => {
    await UserManager.getInstance().removeUser(userDetail.id);
  });
});

// TODO: FIX THE PUBLISHING MESSAGE WHEN THE USER JOINS RIGHT NOW DUPLICATE MESSAGE
// ARE BEIGN SENT FIX THOSE A SAP

// TODO: WHEN USER JUST CLOSE THE WINDOW WITHOUT DISCONNECT THEN STATUS OFFLIEN
// IS NOT HAPPENDING FIX THAT BUG ALSO

console.log(wss.clients.size, "THIS THE SIZE OF THE WSS ");

const interval = setInterval(() => {
  console.log("ping from interval");
  wss.clients.forEach((client) => {
    if ((client as WebSocket).isAlive == false) {
      return client.terminate();
    }

    (client as WebSocket).isAlive = false;
    ping(client as WebSocket);
  });
}, HEARTBEAT_INTERVAL);

wss.on("close", () => {
  clearInterval(interval);
});
