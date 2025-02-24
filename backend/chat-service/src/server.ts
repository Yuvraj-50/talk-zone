import dotenv from "dotenv";
import chatRouter from "./routes/ChatRoute";
import cors from "cors";
import cookieParser from "cookie-parser";
import express, { json } from "express";
import { Express } from "express";
import { configureCloudinary } from "./utils/cloudnary";

dotenv.config();

function startServer() {
  const app: Express = express();

  const PORT: Number = Number(process.env.PORT) || 3000;

  app.use(
    cors({
      origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:8080",
      ],
      credentials: true,
    })
  );

  app.use(json());

  app.use(cookieParser());

  app.use("/api/v1/chat", chatRouter);

  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    configureCloudinary();
  });

  return server;
}

export default startServer;