import { CipherGCMTypes } from "node:crypto";

export interface DecipherInput {
  iv: number;
  tag: number;
  encrypted: Buffer;
  algorithm: CipherGCMTypes;
}
