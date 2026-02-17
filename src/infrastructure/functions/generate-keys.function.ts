import { generateKeyPair, exportJWK, calculateJwkThumbprint } from "jose";

import { SIGNING_ALGS } from "../utils/signing-algs.util";
import { ENCRYPTION_ALGS } from "../utils/encryption-algs.util";

import type { JWK } from "jose";

export interface KeysPair {
  public: JWK;
  private: JWK;
}

export async function GenerateKeys() {
  const keys: KeysPair[] = [];

  const signingKeys = await GenerateSigningKeys();
  const encryptionKeys = await GenerateEncryptionKeys();

  keys.push(...signingKeys, ...encryptionKeys);

  return keys;
}

async function GenerateSigningKeys() {
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

const RSA_ENC_KEYS = new Set([
  "RSA-OAEP",
  "RSA-OAEP-256",
  "RSA-OAEP-384",
  "RSA-OAEP-512",
]);

export async function GenerateEncryptionKeys(): Promise<KeysPair[]> {
  const keys: KeysPair[] = [];

  for (const alg of ENCRYPTION_ALGS) {
    if (RSA_ENC_KEYS.has(alg)) {
      const pair = await createPair(alg);

      keys.push(pair as KeysPair);

      continue;
    }

    const curves = ["P-256", "P-384", "P-521", "X25519"];

    for (const crv of curves) {
      const pair = await createPair(alg, crv);

      keys.push(pair as KeysPair);
    }
  }

  return keys;
}

async function createPair(
  alg: string,
  curve?: string,
): Promise<KeysPair | null> {
  try {
    const options: any = { extractable: true };

    if (curve) options.crv = curve;

    const { publicKey, privateKey } = await generateKeyPair(alg, options);

    const publicJWK = await exportJWK(publicKey);
    const privateJWK = await exportJWK(privateKey);

    const kid = await calculateJwkThumbprint(publicJWK);

    return {
      public: { ...publicJWK, alg, kid, use: "enc", key_ops: ["encrypt"] },
      private: { ...privateJWK, alg, kid, use: "enc", key_ops: ["decrypt"] },
    };
  } catch (error: any) {
    return null;
  }
}
