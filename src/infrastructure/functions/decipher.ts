import { createDecipheriv } from "node:crypto";

import { ENV_CONFIG } from "../../configs/envs";

import type { DecipherInput } from "../interfaces/decipher.interface";

const KEY = Buffer.from(ENV_CONFIG.CIPHER_KEY as string, "utf-8");

export async function decipher(payload: DecipherInput) {
  const { iv: IV_LENGTH, tag: TAG_LENGTH, algorithm, encrypted } = payload;

  const iv = encrypted.subarray(0, IV_LENGTH);
  const tag = encrypted.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const data = encrypted.subarray(IV_LENGTH + TAG_LENGTH);

  const decipher = createDecipheriv(algorithm, KEY, iv);

  decipher.setAuthTag(tag);

  const desencrypt = Buffer.concat([decipher.update(data), decipher.final()]);

  return JSON.parse(desencrypt.toString("utf-8"));
}
