import express from "express";

import { ENV_CONFIG } from "./configs/envs";

import { JobsVault } from "./modules/jobs-vault";

const app = express();

(async () => {
  await JobsVault.getInstance().schedule();

  app.listen(ENV_CONFIG.PORT, () => {
    `App running at port: ${ENV_CONFIG.PORT}`;
  });
})();
