import cors from "cors";
import express from "express";

import { ENV_CONFIG } from "./configs/envs";

import { JobsVault } from "./modules/jobs-vault";
import { ApiRouter } from "./routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

ApiRouter(app);

(async () => {
  const vault = JobsVault.getInstance();

  await vault.init();

  app.listen(ENV_CONFIG.PORT, () => {
    console.log(`App running at port: ${ENV_CONFIG.PORT}`);
  });
})();
