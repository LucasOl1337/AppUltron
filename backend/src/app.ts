import cors from "cors";
import express from "express";

import { env } from "./config/env.js";
import { apiRouter } from "./routes/index.js";

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: env.CORS_ORIGIN
    })
  );
  app.use(express.json());

  app.use("/api", apiRouter);

  app.use((_req, res) => {
    res.status(404).json({ message: "Route not found" });
  });

  return app;
};
