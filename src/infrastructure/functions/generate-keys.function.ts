import { generateKeyPair, exportJWK, calculateJwkThumbprint } from "jose";

import { SIGNING_ALGS } from "../utils/signing-algs.util";

import type { JWK } from "jose";

export interface KeysPair {
  public: JWK;
  private: JWK;
}

export async function GenerateKeys() {
  const keys: KeysPair[] = [];

  for (const alg of SIGNING_ALGS) {
    const { publicKey, privateKey } = await generateKeyPair(alg, {
      extractable: true,
    });

    const publicJWK = await exportJWK(publicKey);
    const privateJWK = await exportJWK(privateKey);

    const kid = await calculateJwkThumbprint(publicJWK);

    keys.push({
      public: {
        ...publicJWK,
        alg,
        kid,
        use: "sig",
        key_ops: ["verify"],
      },
      private: {
        ...privateJWK,
        alg,
        kid,
        use: "sig",
        key_ops: ["sign"],
      },
    });
  }

  return keys;
}
