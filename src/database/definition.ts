import { config } from "dotenv";

import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";

import type { Database } from ".";

config();

const DATABASE_URL = process.env.DATABASE_URL;

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: DATABASE_URL,
    max: 10,
  }),
});

export const database = new Kysely<Database>({
  dialect,
});
