import express from "express";
import {
  getuser,
  getUserProfile,
  googleLogin,
  login,
  logout,
  signup,
  verifyUser,
} from "../controllers/authController";
import upload from "../middleware/multer";

const router = express.Router();

router.post("/signup", upload.single("photo"), signup);

router.post("/login", login);

router.get("/logout", logout);

router.get("/status", verifyUser);

router.get("/getUsers/:name", getuser);

router.post("/googleLogin", googleLogin);

router.post("/userProfiles", getUserProfile);

export default router;
