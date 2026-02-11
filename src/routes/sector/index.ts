import { Router } from "express";
import { OidcPairwise } from "../../modules/oidc/pairwise";

const SectorIdentifierRouter = Router();

SectorIdentifierRouter.get("/sector-identifier/:id", async (req, res) => {
  const href = `${req.protocol}://${req.get("host")}${req.originalUrl}`;

  const data = await OidcPairwise.getInstance().getSectorIdentifierByPath(href);

  const result = data?.redirect_uris ?? [];

  res.setHeader("Content-Type", "application/json");

  return res.status(200).json(result);
});

SectorIdentifierRouter.post("/sector-identifier/:id", async (req, res) => {
  const uris: string[] = req.body.redirect_uris;

  if (!uris || !uris.length)
    return res.status(400).json({ error: "invalid_request" });

  const href = `${req.protocol}://${req.get("host")}${req.originalUrl}`;

  const data = await OidcPairwise.getInstance().createSectorIdentifier(
    href,
    uris,
  );

  return res.status(200).json(data);
});

export { SectorIdentifierRouter };
