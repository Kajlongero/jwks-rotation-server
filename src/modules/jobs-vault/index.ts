import { ENV_CONFIG } from "../../configs/envs";

import { KeyVault } from "../key-vault";
import { JobsWorkers } from "../jobs";

import { JobsCache } from "../cache/jobs.cache";
import { JwksCache } from "../cache/jwks.cache";

import { database } from "../../database/definition";

import type { Jobs, Keys } from "../../database";

const jobsCache = JobsCache.getInstance();
const jwksCache = JwksCache.getInstance();

const kVault = KeyVault.getInstance();
const jWorkers = JobsWorkers.getInstance();

export class JobsVault {
  private static instance: JobsVault;

  private constructor() {
    if (JobsVault.instance) return JobsVault.instance;

    return this;
  }

  static getInstance() {
    if (!JobsVault.instance) JobsVault.instance = new JobsVault();

    return JobsVault.instance;
  }

  async bootstrap() {
    return await database.transaction().execute(async (tx) => {
      let job = await jWorkers.getJobsByType("KEY_ROTATION", tx);
      let keys = await kVault.getActiveKeys(tx);

      if (!keys.length) {
        await kVault.deleteOldKeys(tx);
        await jWorkers.deleteJobsByType("KEY_ROTATION", tx);

        const payload = {
          ver: 1,
          ttl: ENV_CONFIG.TTL,
          reason: "AUTOMATIC",
        };

        keys = await kVault.batch(payload, tx);
      }

      const latestKey = keys.reduce((p, c) => (c.version > p.version ? c : p));

      const nowMs = Date.now();
      const expiryMs = latestKey.expires_at.getTime();
      const marginMs = ENV_CONFIG.JOBS_TTL * 1000;

      let nextRunMs =
        expiryMs - marginMs <= nowMs
          ? nowMs + 1000
          : nowMs + ENV_CONFIG.JOBS_TTL * 1000;

      const nextRunAt = new Date(nextRunMs);

      if (!job) {
        await jWorkers.deleteJobsByType("KEY_ROTATION", tx);

        const payload = {
          ttl: ENV_CONFIG.JOBS_TTL,
          type: "KEY_ROTATION",
          version: 1,
          nextRunAt,
        };

        job = await jWorkers.createJob(payload, tx);

        return { keys, job };
      }

      job = await jWorkers.updateNextRunAt({
        id: job.id,
        counter: job.counter + 1,
        version: latestKey.version,
        nextRunAt,
      });

      return { job: job as Jobs, keys };
    });
  }

  async init() {
    try {
      const { job, keys } = await this.bootstrap();

      jobsCache.save(job as Jobs, ENV_CONFIG.JOBS_TTL);
      jwksCache.saveAndSync(keys);

      this.start();
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve, 5000));

      await this.init();
    }
  }

  async start() {
    while (true) {
      try {
        const job = jobsCache.retrieve() as Jobs;
        const keys = jwksCache.retrieve() as Keys[];

        if (!job || !keys) {
          const sync = await this.bootstrap();

          jobsCache.save(sync.job as Jobs, ENV_CONFIG.JOBS_TTL);
          jwksCache.saveAndSync(sync.keys);

          continue;
        }

        await this.schedule(keys, job);
      } catch (error) {
        await new Promise((res) => setTimeout(res, 5000));
      }
    }
  }

  async schedule(keys: Keys[], job: Jobs) {
    const { msRemaining, shouldRotate } = this.evaluateStatus(keys);

    if (shouldRotate) {
      const latestKey = keys.reduce((p, c) => (c.version > p.version ? c : p));

      const now = Date.now();
      const expiry = latestKey.expires_at.getTime();

      const exactRemaining = Math.max(0, expiry - now) + 100;

      if (exactRemaining > 0)
        await new Promise((resolve) => setTimeout(resolve, exactRemaining));

      await this.rotate(job, keys);
    } else {
      const sleep = Math.min(msRemaining, ENV_CONFIG.JOBS_TTL * 1000);

      const result = await database.transaction().execute(async (tx) => {
        await kVault.deleteOldKeys(tx);

        const updatedJob = await jWorkers.updateNextRunAt(
          {
            id: job.id,
            counter: job.counter + 1,
            version: job.version,
            nextRunAt: new Date(Date.now() + sleep),
          },
          tx,
        );

        return { job: updatedJob };
      });

      jobsCache.save(result.job as Jobs);

      await new Promise((resolve) => setTimeout(resolve, sleep));
    }
  }

  async rotate(job: Jobs, keys: Keys[]) {
    const latestKey = keys.reduce((p, c) => (c.version > p.version ? c : p));

    const result = await database.transaction().execute(async (tx) => {
      await kVault.setGraceTime(latestKey, latestKey.version, tx);
      await kVault.setInactiveKeysByVersion(latestKey.version);

      const payload = {
        ver: latestKey.version + 1,
        ttl: ENV_CONFIG.TTL,
        reason: "AUTOMATIC",
      };

      const keys = await kVault.batch(payload, tx);

      const updatedJob = await jWorkers.updateNextRunAt({
        id: job.id,
        counter: job.counter + 1,
        version: latestKey.version + 1,
        nextRunAt: new Date(Date.now() + 1000 * ENV_CONFIG.JOBS_TTL),
      });

      await kVault.deleteOldKeys(tx);

      const actualKeys = await kVault.getActiveKeys(tx);

      return { keys: actualKeys, job: updatedJob };
    });

    jobsCache.save(result.job as Jobs);
    jwksCache.saveAndSync(result.keys);

    return;
  }

  evaluateStatus(keys: Keys[]) {
    const latestKey = keys.reduce((p, c) => (c.version > p.version ? c : p));

    const now = Date.now();
    const expiry = latestKey.expires_at.getTime();
    const margin = ENV_CONFIG.JOBS_TTL * 1000;

    const timeToRotate = expiry - margin - now;

    return {
      msRemaining: Math.max(0, timeToRotate),
      shouldRotate: timeToRotate <= 0,
    };
  }
}
