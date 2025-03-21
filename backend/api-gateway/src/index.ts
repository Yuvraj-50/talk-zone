import express, { Request, Response } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:5176",
      "http://localhost:8080",
    ],
    credentials: true,
  })
);

const routes: Record<string, string> = {
  "/api/v1/auth": "http://localhost:9000/api/v1/auth",
  "/api/v1/chat": "http://localhost:3000/api/v1/chat",
};

for (let route in routes) {
  const proxyMiddleware = createProxyMiddleware<Request, Response>({
    target: routes[route],
    changeOrigin: true,
  });

  app.use(route, proxyMiddleware);
}

app.listen(8080, "0.0.0.0", () => {
  console.log("Server is running on port 8080");
});
