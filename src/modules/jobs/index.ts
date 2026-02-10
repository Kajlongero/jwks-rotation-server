import { sql } from "kysely";
import { randomUUID } from "node:crypto";

import { database } from "../../database/definition";
import { GenerateKeys } from "../../infrastructure/functions/generate-keys.function";

import type { Database } from "../../database";
import type { Transaction } from "kysely";
import { CreateJobInput } from "./interfaces/create-job.interface";

export class JobsWorkers {
  async getJobsByType(type: string, tx?: Transaction<Database>) {
    const executor = database ?? tx;

    return executor
      .selectFrom("jobs")
      .where("type", "=", type)
      .forUpdate()
      .skipLocked()
      .execute();
  }

  async createJob(payload: CreateJobInput) {
    const { ttl, type, version, nextRunAt } = payload;

    const job = await database
      .insertInto("jobs")
      .values({
        id: randomUUID(),
        ttl,
        type,
        status: "IDLE",
        counter: 0,
        version,
        last_run_at: sql<Date>`NOW()`,
        next_run_at: nextRunAt,
      })
      .returningAll()
      .executeTakeFirst();

    return job;
  }
}
