import dotenv from "dotenv";

dotenv.config();

const parsePort = (value: string | undefined): number => {
  const port = Number(value ?? "4000");
  return Number.isNaN(port) ? 4000 : port;
};

export const env = {
  PORT: parsePort(process.env.PORT),
  JWT_SECRET: process.env.JWT_SECRET ?? "change-me-in-production",
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? "http://localhost:5173"
};
