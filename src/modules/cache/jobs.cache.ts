import NodeCache from "node-cache";

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
}
