import { config } from "dotenv";

config();

const { PORT, TTL, JOBS_TTL, CACHE_TTL, CIPHER_KEY, DATABASE_URL } =
  process.env;

export const ENV_CONFIG = {
  PORT,

  // Times
  TTL,
  JOBS_TTL,
  CACHE_TTL,

  // Ciphers
  CIPHER_KEY,

  // DB
  DATABASE_URL,
};
