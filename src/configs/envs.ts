import { config } from "dotenv";

config();

const { PORT, TTL, JOBS_TTL, CACHE_TTL, CIPHER_KEY, DATABASE_URL } =
  process.env;

export const ENV_CONFIG = {
  PORT: Number(PORT) ?? 3000,

  // Times
  TTL: Number(TTL) ?? 300,
  JOBS_TTL: Number(JOBS_TTL) ?? 60,
  CACHE_TTL: Number(CACHE_TTL) ?? 150,

  // Ciphers
  CIPHER_KEY,

  // DB
  DATABASE_URL,
};
