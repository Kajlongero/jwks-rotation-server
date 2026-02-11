import type { Selectable, Insertable, Updateable } from "kysely";

import type { ColumnType, Generated, JSONColumnType } from "kysely";

import { ECSignJWK, OKPSignJWK, RSASignJWK } from "../types/jwks.type";

export interface Database {
  keys: KeysTable;
  jobs: JobsTable;
  sector_identifiers: SectorIdentifiersTable;
}

export interface KeysTable {
  id: Generated<string>;
  kid: string;
  jwk: JSONColumnType<RSASignJWK | ECSignJWK | OKPSignJWK>;
  ttl: number;
  enc_pk: Buffer;
  version: number;
  is_active: boolean;
  rotation_reason: "AUTOMATIC" | "FORCED";
  created_at: ColumnType<Date, Date | string, Date | string>;
  expires_at: ColumnType<Date, Date | string, Date | string>;
  deletable_at: ColumnType<Date, Date | string, Date | string>;
}

export interface JobsTable {
  id: Generated<string>;
  ttl: number;
  type: string;
  status: "IDLE" | "RUNNING" | "FAILED";
  counter: number;
  version: number;
  last_run_at: ColumnType<Date, Date | string, Date | string>;
  next_run_at: ColumnType<Date, Date | string, Date | string>;
}

export interface SectorIdentifiersTable {
  id: Generated<string>;
  sector_uri_path: string;

  redirect_uris: string[];

  created_at: ColumnType<Date, Date | string, Date | string>;
}

export type Keys = Selectable<KeysTable>;
export type NewKeys = Insertable<KeysTable>;
export type UpdateKeys = Updateable<KeysTable>;

export type Jobs = Selectable<JobsTable>;
export type NewJobs = Insertable<JobsTable>;
export type UpdateJobs = Updateable<JobsTable>;

export type Sector = Selectable<SectorIdentifiersTable>;
export type NewSector = Insertable<SectorIdentifiersTable>;
