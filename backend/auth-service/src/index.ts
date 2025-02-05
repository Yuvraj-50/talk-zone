import express from "express";
import dotenv from "dotenv";
import userRouter from "./routes/userRouter";
import cors from "cors";

const cookieParser = require("cookie-parser");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    credentials: true,
  })
);

app.use("/health", (req, res) => {
  res.send("ok");
  return;
});

app.use("/api/v1/auth", userRouter);

const port = process.env.PORT || 9000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});