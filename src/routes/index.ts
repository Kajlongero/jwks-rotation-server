import { Router } from "express";

import type { Application } from "express";

import { JWKSRouter } from "./jwks";

const router = Router();

export function ApiRouter(app: Application) {
  app.use("/", router);

  router.use("/", JWKSRouter);
}
