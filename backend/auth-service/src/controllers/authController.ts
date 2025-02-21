import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prismaClient from "../utils/db";
import { generateToken } from "../utils/generateJwt";
import jwt, { JwtPayload, VerifyCallback, VerifyErrors } from "jsonwebtoken";
import { JWTPAYLOAD } from "../types";
import {
  generateRandomPassword,
  verifyGoogleToken,
} from "../utils/verifyGoogleToken";
import { TokenPayload } from "google-auth-library";
import { uploadToCloudinary } from "../utils/cloudnary";
import path from "node:path";

export const signup = async (req: Request, res: Response): Promise<void> => {
  const { email, name, password, bio } = req.body;

  try {
    const existingUser = await prismaClient.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const profilePhoto = req.file?.filename;

    if (!profilePhoto) return;

    const actualpath = path.resolve(__dirname, "../../uploads", profilePhoto);

    const profilePhotoUrl = await uploadToCloudinary(actualpath);

    if (!profilePhotoUrl) return;

    const newUser = await prismaClient.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        bio: bio,
        profileUrl: profilePhotoUrl,
      },
    });

    const jwtPayload: JWTPAYLOAD = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      profileUrl: newUser.profileUrl,
    };

    const token = generateToken(jwtPayload);

    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
      path: "/",
      secure: false,
      sameSite: "lax",
    });

    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await prismaClient.user.findUnique({ where: { email } });
    if (!user) {
      res.status(400).json({ message: "Invalid email or password" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(400).json({ message: "Invalid email or password" });
      return;
    }

    const jwtPayload: JWTPAYLOAD = {
      id: user.id,
      email: user.email,
      name: user.name,
      profileUrl: user.profileUrl,
    };

    const token = generateToken(jwtPayload);

    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
      secure: false,
      sameSite: "lax",
    });

    res.status(200).json({ msg: "login success", user: jwtPayload });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const googleLogin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({ msg: "token is required" });
      return;
    }

    const payload: TokenPayload | undefined = await verifyGoogleToken(token);

    if (!payload || !payload.email || !payload.name) {
      res.status(400).json({ msg: "Invalid token" });
      return;
    }

    let existingUser = await prismaClient.user.findUnique({
      where: { email: payload.email },
    });

    if (!existingUser) {
      existingUser = await prismaClient.user.create({
        data: {
          email: payload.email,
          name: payload.name,
          password: generateRandomPassword(),
          bio: "hello world",
          profileUrl: payload.picture ?? "no picture",
        },
      });
    }

    const user: JWTPAYLOAD = {
      id: existingUser.id,
      email: existingUser.email,
      name: existingUser.name,
      profileUrl: existingUser.profileUrl,
    };

    const jwtToken = generateToken(user);

    res.cookie("jwt", jwtToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
      secure: false,
      sameSite: "lax",
    });

    res.status(200).json({ msg: "Google login successful", user });
  } catch (error) {
    console.log("GOOGLE LOGIN ERROR", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  res.clearCookie("jwt");
  res.status(200).json({ message: "Logged out successfully" });
};

export const verifyUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const token = req.cookies.jwt;

  if (!token) {
    res.status(401).json({ user: null });
    return;
  }

  try {
    jwt.verify(
      token,
      process.env.JWT_SECRET!,
      (err: VerifyErrors | null, user: unknown) => {
        if (err) {
          res.status(401).json({ user: null });
          return;
        }
        const payload = user as JWTPAYLOAD;

        res.json({ user: payload });
      }
    );
  } catch (err) {
    res.status(401).json({ user: null });
  }
};

export const getuser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userName = req.params.name;

    if (!userName) {
      return;
    }

    const users = await prismaClient.user.findMany({
      where: {
        name: {
          contains: userName as string,
          mode: "insensitive",
        },
      },
      select: {
        name: true,
        id: true,
        email: true,
        profileUrl: true,
      },
    });

    console.log(users);

    res.status(200).json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
