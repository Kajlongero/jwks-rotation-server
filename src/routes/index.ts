import { Router } from "express";

import type { Application } from "express";

import { JWKSRouter } from "./jwks";
import { SectorIdentifierRouter } from "./sector";

const router = Router();

export function ApiRouter(app: Application) {
  app.use("/", router);

  router.use("/", JWKSRouter);
  router.use("/", SectorIdentifierRouter);
}
