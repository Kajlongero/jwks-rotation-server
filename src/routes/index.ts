import { Router } from "express";

import type { Application } from "express";

const router = Router();

export function ApiRouter(app: Application) {
  app.use("/", router);

  router.use("/");
}
