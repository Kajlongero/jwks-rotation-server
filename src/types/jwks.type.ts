export interface RSASignJWK {
  use: "sig";
  alg: "RS256" | "RS384" | "RS512";
  kty: "RSA";
  kid: string;
  n: string;
  e: string;
}

export interface ECSignJWK {
  use: "sig";
  alg: "ES256" | "ES384" | "ES512";
  crv: "P-256" | "P-384" | "P-521";
  kty: "EC";
  kid: string;
  x: string;
  y: string;
}

export interface OKPSignJWK {
  use: "sig";
  crv: "Ed25519" | "Ed448";
  alg: "EdDSA";
  kty: "OKP";
  kid: string;
  x: string;
}
