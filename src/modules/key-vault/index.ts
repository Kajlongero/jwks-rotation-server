import { sql } from "kysely";
import { randomUUID } from "node:crypto";

import { cipher } from "../../infrastructure/functions/cipher";
import { decipher } from "../../infrastructure/functions/decipher";
import { database } from "../../database/definition";
import { GenerateKeys } from "../../infrastructure/functions/generate-keys.function";

import type { Database } from "../../database";
import type { CipherInput } from "../../infrastructure/interfaces/cipher.interface";
import type { Transaction } from "kysely";
import type { CreateBatchKeysInput } from "./interfaces/create-keys.interface";

export class KeyVault {
  async getActiveKeys(tx?: Transaction<Database>) {
    const executor = database ?? tx;

    return await executor
      .selectFrom("keys")
      .where("deletable_at", ">", sql<Date>`NOW()`)
      .forUpdate()
      .selectAll()
      .execute();
  }

  async batch(data: CreateBatchKeysInput, tx?: Transaction<Database>) {
    const executor = database ?? tx;

    const keys = await GenerateKeys();

    const { ttl, ver, reason } = data;

    const now = new Date();
    const expires = new Date(now.getTime() + 1000 * Number(ttl));
    const deletable = new Date(now.getTime() + 1000 * Number(ttl) * 2);

    const rows = await Promise.all(
      keys.map(async ({ public: pubKey, private: privKey }) => {
        const pubJWK = pubKey as any;

        const input: CipherInput = {
          iv: 12,
          data: privKey,
          algorithm: "aes-128-gcm",
        };

        const encryptedPrivate = await cipher(input);

        return {
          id: randomUUID(),
          jwk: JSON.stringify(pubJWK),
          kid: pubJWK.kid,
          ttl: ttl,
          enc_pk: encryptedPrivate,
          version: ver,
          is_active: true,
          rotation_reason: reason as "AUTOMATIC" | "FORCED",
          created_at: now,
          expires_at: expires,
          deletable_at: deletable,
        };
      }),
    );

    return await executor
      .insertInto("keys")
      .values(rows)
      .returningAll()
      .execute();
  }

  async deleteOldKeys(tx?: Transaction<Database>) {
    const executor = database ?? tx;

    return await executor
      ?.deleteFrom("keys")
      .where("deletable_at", "<=", sql<Date>`NOW()`)
      .returningAll()
      .execute();
  }
}
