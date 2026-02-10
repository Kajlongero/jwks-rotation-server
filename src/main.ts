import cors from "cors";
import express from "express";

import { ENV_CONFIG } from "./configs/envs";

import { JobsVault } from "./modules/jobs-vault";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

(async () => {
  await JobsVault.getInstance().init();

  app.listen(ENV_CONFIG.PORT, () => {
    `App running at port: ${ENV_CONFIG.PORT}`;
  });
})();
