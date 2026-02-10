import { sql } from "kysely";
import { randomUUID } from "node:crypto";

import { database } from "../../database/definition";

import type { Database } from "../../database";
import type { Transaction } from "kysely";
import type { CreateJobInput } from "./interfaces/create-job.interface";
import type { UpdateJobRunInput } from "./interfaces/update-job-run.interface";

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

  async updateNextRunAt(
    payload: UpdateJobRunInput,
    tx?: Transaction<Database>,
  ) {
    const executor = database ?? tx;

    const { id, counter, nextRunAt, version } = payload;

    return await executor
      .updateTable("jobs")
      .where("id", "=", id)
      .set("counter", counter)
      .set("version", version)
      .set("last_run_at", sql<Date>`NOW()`)
      .set("next_run_at", nextRunAt)
      .returningAll()
      .executeTakeFirst();
  }

  async deleteJobsByType(type: string, tx?: Transaction<Database>) {
    const executor = database ?? tx;

    return executor
      .deleteFrom("jobs")
      .where("type", "=", type)
      .returningAll()
      .executeTakeFirst();
  }
}
