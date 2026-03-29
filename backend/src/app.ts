import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import cors from "cors";
import express from "express";

import { env } from "./config/env.js";
import { apiRouter } from "./routes/index.js";

export const createApp = () => {
  const app = express();
  const currentFilePath = fileURLToPath(import.meta.url);
  const currentDir = path.dirname(currentFilePath);
  const frontendDistDir = path.resolve(currentDir, "../../frontend/dist");

  app.use(
    cors({
      origin: env.CORS_ORIGIN
    })
  );
  app.use(express.json());

  app.use("/api", apiRouter);

  if (fs.existsSync(frontendDistDir)) {
    app.use(express.static(frontendDistDir));

    app.get(/^(?!\/api).*/, (_req, res) => {
      res.sendFile(path.join(frontendDistDir, "index.html"));
    });
  }

  app.use((_req, res) => {
    res.status(404).json({ message: "Route not found" });
  });

  return app;
};
