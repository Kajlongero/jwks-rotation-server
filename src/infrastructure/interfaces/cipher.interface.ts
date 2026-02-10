import { CipherGCMTypes } from "node:crypto";

export interface CipherInput {
  iv: number;
  data: object;
  algorithm: CipherGCMTypes;
}
