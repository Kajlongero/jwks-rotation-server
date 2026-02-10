import { createCipheriv, randomBytes } from "node:crypto";
import { CipherInput } from "../interfaces/cipher.interface";

import { ENV_CONFIG } from "../../configs/envs";

const KEY = Buffer.from(ENV_CONFIG.CIPHER_KEY as string, "base64");

export async function cipher(payload: CipherInput) {
  const { iv, data, algorithm } = payload;

  const IV = randomBytes(iv);
  const cipher = createCipheriv(algorithm, KEY, IV);

  const plain = JSON.stringify(data);

  const encrypted = Buffer.concat([
    cipher.update(plain, "utf-8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return Buffer.concat([IV, tag, encrypted]);
}
