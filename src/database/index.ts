import type { Selectable, Insertable, Updateable } from "kysely";

import type { ColumnType, Generated, JSONColumnType } from "kysely";

import { ECSignJWK, OKPSignJWK, RSASignJWK } from "../types/jwks.type";

export interface Database {
  keys: KeysTable;
  jobs: JobsTable;
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

export interface OidcClientsTable {
  id: Generated<string>;
  client_id: string;
  client_secret_hash: string;
  sector_identifier_uri: string | null;
  created_at: Generated<Date>;

  client_name?: string;
  updated_at?: Generated<Date>;
}

export interface SectorIdentifiersTable {
  id: Generated<string>;
  redirect_uris: string;
  sector_uri_path: string;
  client_owner_id: string;
  created_at: Generated<Date>;
}

export type Keys = Selectable<KeysTable>;
export type NewKeys = Insertable<KeysTable>;
export type UpdateKeys = Updateable<KeysTable>;

export type Jobs = Selectable<JobsTable>;
export type NewJobs = Insertable<JobsTable>;
export type UpdateJobs = Updateable<JobsTable>;

export type Client = Selectable<OidcClientsTable>;
export type NewClient = Insertable<OidcClientsTable>;

export type Sector = Selectable<SectorIdentifiersTable>;
export type NewSector = Insertable<SectorIdentifiersTable>;
