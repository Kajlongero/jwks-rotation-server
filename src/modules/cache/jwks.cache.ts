import NodeCache from "node-cache";

import {
  JWKS_SET,
  JWKS_ACTIVE_KEY,
  JWKS_PUBLIC_KEY,
  JWKS_PRIVATE_KEY,
} from "./keys/jwks-cache.keys";

import type { Keys } from "../../database";

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

  retrieve(): Keys[] | undefined {
    if (this.cache.has(JWKS_SET)) return this.cache.get(JWKS_SET) as Keys[];
  }

  save(keys: Keys[]) {
    const publicJwk = keys.map((k) => k.jwk);

    keys.forEach((k) => {
      this.cache.set(JWKS_PRIVATE_KEY(k.kid), {
        kid: k.kid,
        enc_pk: k.enc_pk,
        isActive: k.is_active,
      });

      if (k.is_active) this.cache.set(JWKS_ACTIVE_KEY, k);
    });

    this.cache.set(JWKS_SET, keys);
    this.cache.set(JWKS_PUBLIC_KEY, publicJwk);
  }
}
