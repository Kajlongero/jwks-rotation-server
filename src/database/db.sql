CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE rotation_reason_enum AS ENUM('AUTOMATIC', 'FORCED');

CREATE TYPE job_status_enum AS ENUM('IDLE', 'RUNNING', 'FAILED');

CREATE TABLE
  keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    kid TEXT NOT NULL UNIQUE,
    jwk JSONB NOT NULL,
    ttl INTEGER NOT NULL,
    enc_pk BYTEA NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    rotation_reason rotation_reason_enum NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    deletable_at TIMESTAMP WITH TIME ZONE NOT NULL
  );

CREATE TABLE
  jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    ttl INTEGER NOT NULL,
    type TEXT NOT NULL UNIQUE,
    status job_status_enum DEFAULT 'IDLE',
    counter INTEGER DEFAULT 0,
    version INTEGER DEFAULT 1,
    last_run_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    next_run_at TIMESTAMP WITH TIME ZONE NOT NULL
  );

CREATE INDEX idx_keys_expires_at ON keys (expires_at);

CREATE INDEX idx_keys_deletable_at ON keys (deletable_at);

CREATE INDEX idx_jobs_next_run_at ON jobs (next_run_at);

CREATE TABLE
  oidc_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    client_id TEXT UNIQUE NOT NULL,
    client_secret BYTEA NOT NULL,
    client_name TEXT,
    sector_identifier_uri TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

CREATE TABLE
  sector_identifiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    client_owner_id UUID NOT NULL REFERENCES oidc_clients (id) ON DELETE CASCADE,
    sector_uri_path TEXT UNIQUE NOT NULL,
    redirect_uris JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

CREATE INDEX idx_oidc_clients_client_id ON oidc_clients (client_id);

CREATE INDEX idx_sector_path ON sector_identifiers (sector_uri_path);