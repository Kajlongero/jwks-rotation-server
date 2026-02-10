export const JWKS_SET = "JWKS_SET";

export const JWKS_PUBLIC_KEY = "JWKS_PUBLIC_KEY";

export const JWKS_PRIVATE_KEY = (kid: string) => `JWKS_PRIVATE_${kid}`;
