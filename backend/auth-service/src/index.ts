import express from "express";
import dotenv from "dotenv";
import userRouter from "./routes/userRouter";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ensureUploadDirExist } from "./middleware/multer";
import { hello } from "./utils/cloudnary";
import prisma from "./utils/db";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://chat.yuvaraj.tech",
    credentials: true,
  })
);

app.use("/api/v1/auth/health", (req, res) => {
  res.send("helth");
  return;
});

app.use("/api/v1/auth", userRouter);

const port = process.env.PORT || 9000;

app.listen(Number(port), "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
  ensureUploadDirExist().then(() => {
    console.log("multer folder is ready");
  });
  hello();
});

setInterval(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("🔥 Keeping Neon DB active");
  } catch (error) {
    console.error("❌ Failed to ping DB:", error);
  }
}, 300000);
