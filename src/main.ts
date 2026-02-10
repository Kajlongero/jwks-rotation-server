import express from "express";

import { ENV_CONFIG } from "./configs/envs";

const app = express();

(async () => {
  app.listen(ENV_CONFIG.PORT, () => {
    `App running at port: ${ENV_CONFIG.PORT}`;
  });
})();
