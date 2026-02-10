import NodeCache from "node-cache";
import { JOBS_CACHE_KEY } from "./keys/jobs-cache.keys";
import { Jobs } from "../../database";

export class JobsCache {
  private static instance: JobsCache;

  private cache: NodeCache = new NodeCache();

  private constructor() {
    if (JobsCache.instance) return JobsCache.instance;

    return this;
  }

  static getInstance() {
    if (!JobsCache.instance) JobsCache.instance = new JobsCache();

    return JobsCache.instance;
  }

  retrieve(): Jobs | undefined {
    if (this.cache.has(JOBS_CACHE_KEY))
      return this.cache.get(JOBS_CACHE_KEY) as Jobs;
  }

  save(job: Jobs, ttl: number = 0) {
    this.cache.set(JOBS_CACHE_KEY, job, ttl);
  }

  clear() {
    this.cache.del(JOBS_CACHE_KEY);
  }
}
