import express, { Request, Response } from "express";
import prisma from "../utils/prismaClient";
import {
  CreateChat,
  GetChat,
  GetChatMessages,
} from "../controllers/chatControllers";
import { authMiddleWare } from "../middleware/auth";

const router = express.Router();

router.get("/", authMiddleWare, GetChat);

router.post("/create", authMiddleWare, CreateChat);

router.get("/:id", GetChatMessages);

export default router;
