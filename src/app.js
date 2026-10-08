import express from "express";
import cors from "cors";
import documentRoutes from "./routes/document.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import { checkDatabaseConnection } from "./db/health.js";
import { requestIdMiddleware } from "./middleware/request-id.middleware.js";
import { config } from "../src/config/index.js";

import { errorMiddleware } from "./middleware/error.middleware.js";
const app = express();

app.use(
  cors({
    origin: config.clientUrl,
  }),
);
app.use(requestIdMiddleware);
app.use(express.json({ limit: "1mb" }));
app.use("/api/documents", documentRoutes);
app.use("/api/chat", chatRoutes);
app.get("/health", async (req, res, next) => {
  try {
    const database = await checkDatabaseConnection();

    return res.status(200).json({
      status: "ok",
      service: "pdf-rag-chatbot",
      database,
    });
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  console.error(error);

  if (res.headersSent) {
    return next(error);
  }

  return res.status(500).json({
    error: {
      message: "Internal server error.",
    },
  });
});

export default app;
