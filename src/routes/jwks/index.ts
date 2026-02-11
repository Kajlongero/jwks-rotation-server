import { Router } from "express";
import { JwksCache } from "../../modules/cache/jwks.cache";

const JWKSRouter = Router();

const jwksCache = JwksCache.getInstance();

JWKSRouter.get("/.well-known/jwks.json", async (req, res, next) => {
  const data = jwksCache.getPublicJwks();

  return res.status(200).json({ keys: data });
});

export { JWKSRouter };
