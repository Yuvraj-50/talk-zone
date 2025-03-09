import dotenv from "dotenv";
import chatRouter from "./routes/ChatRoute";
import cors from "cors";
import cookieParser from "cookie-parser";
import express, { json } from "express";
import { Express } from "express";
import { configureCloudinary } from "./utils/cloudnary";
import prisma from "./utils/prismaClient";

dotenv.config();

function startServer() {
  const app: Express = express();

  const PORT: number = Number(process.env.PORT) || 3000;

  app.use(
    cors({
      origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://api-gateway:8080",
        "http://chat.yuvaraj.tech",
      ],
      credentials: true,
    })
  );

  app.get("/health", (req, res) => {
    res.send("chat is healthy ..");
  });

  app.use(json());

  app.use(cookieParser());

  app.use("/api/v1/chat", chatRouter);

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
    configureCloudinary();
  });

  setInterval(async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log("🔥 Keeping Neon DB active");
    } catch (error) {
      console.error("❌ Failed to ping DB:", error);
    }
  }, 300000);

  return server;
}

export default startServer;
