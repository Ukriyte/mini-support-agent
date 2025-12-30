import express from "express";
import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import chatRoutes from "./chat.routes";
import "./db";


const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use("/chat", chatRoutes);

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});


app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
  });
});


app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
