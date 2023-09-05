import { loadDotEnv } from "https://deno.land/std/dotenv/mod.ts";

import { Client } from "./client/client.ts";

const env = await loadDotEnv();
const client = new Client();

if (import.meta.main) {
  await client.authenticate(env["DSM_USR"], env["DSM_PWD"]);

  await client.listShares();
}
