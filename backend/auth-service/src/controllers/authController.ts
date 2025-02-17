import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prismaClient from "../utils/db";
import { generateToken } from "../utils/generateJwt";
import jwt, {
  JwtPayload,
  VerifyCallback,
  VerifyErrors,
  VerifyOptions,
} from "jsonwebtoken";
import { JWTPAYLOAD } from "../types";

export const signup = async (req: Request, res: Response): Promise<void> => {
  const { email, name, password } = req.body;

  try {
    const existingUser = await prismaClient.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prismaClient.user.create({
      data: { email, name, password: hashedPassword },
    });

    // TODO MAKE NAME COMPULSARY FIELD IN DB
    const jwtPayload: JWTPAYLOAD = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
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
    res.status(401).json({ authenticated: false, user: null });
    return;
  }

  try {
    jwt.verify(
      token,
      process.env.JWT_SECRET!,
      (err: VerifyErrors | null, user: unknown) => {
        if (err) {
          res.status(401).json({ authenticated: false, user: null });
          return;
        }
        const payload = user as JWTPAYLOAD;
        res.json({ authenticated: true, user: payload });
      }
    );
  } catch (err) {
    res.status(401).json({ authenticated: false, user: null });
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
      },
    });

    console.log(users);

    res.status(200).json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
