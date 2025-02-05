import express from "express";
import {
  getuser,
  login,
  logout,
  signup,
  verifyUser,
} from "../controllers/authController";

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.get("/logout", logout);

router.get("/status", verifyUser);

router.get("/getUsers/:name", getuser);

export default router;
