import { sql } from "kysely";

import { database } from "../../database/definition";

import type { Sector } from "../../database";

export class OidcPairwise {
  private static instance: OidcPairwise;

  private constructor() {
    if (OidcPairwise.instance) return OidcPairwise.instance;
    return this;
  }

  static getInstance() {
    if (!OidcPairwise.instance) OidcPairwise.instance = new OidcPairwise();
    return OidcPairwise.instance;
  }

  async getSectorIdentifierByPath(path: string) {
    const data = await database
      .selectFrom("sector_identifiers")
      .where("sector_uri_path", "=", path)
      .forUpdate()
      .selectAll()
      .executeTakeFirst();

    return data;
  }

  async addUrisToSectorIdentifier(
    path: string,
    uris: string[],
  ): Promise<Sector> {
    const sector = await this.getSectorIdentifierByPath(path);
    if (!sector) return await this.createSectorIdentifier(path, uris);

    const urls = sector.redirect_uris;
    const fixed = new Set([...urls, ...uris]);

    const updated = await database
      .updateTable("sector_identifiers")
      .set("redirect_uris", Array.from(fixed))
      .where("id", "=", sector.id)
      .returningAll()
      .executeTakeFirst();

    return updated as Sector;
  }

  async createSectorIdentifier(path: string, uris: string[]): Promise<Sector> {
    const sector = await database
      .insertInto("sector_identifiers")
      .values({
        created_at: sql<Date>`NOW()`,
        redirect_uris: uris,
        sector_uri_path: path,
      })
      .returningAll()
      .executeTakeFirst();

    return sector as Sector;
  }
}
