import NodeCache from "node-cache";

export class JwksCache {
  private static instance: JwksCache;

  private cache: NodeCache = new NodeCache();

  private constructor() {
    if (JwksCache.instance) return JwksCache.instance;

    return this;
  }

  static getInstance() {
    if (!JwksCache.instance) JwksCache.instance = new JwksCache();

    return JwksCache.instance;
  }
}
