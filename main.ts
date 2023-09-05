import { load as loadDotEnv } from "https://deno.land/std/dotenv/mod.ts";

import { Client } from "./client/client.ts";
import { Effect, pipe } from "npm:effect@latest";

const env = await loadDotEnv();

if (import.meta.main) {
  const result = await Effect.runPromise(
    pipe(
      Client.create(env["DSM_USR"], env["DSM_PWD"]),
      // Effect.flatMap((client) => client.listShares())

      // Effect.flatMap((client) => client.call("SYNO.API.Info", "1", "query")),

      // Effect.flatMap((client) =>
      //   client.call("SYNO.FileStation.BackgroundTask", "3", "query")
      // )

      Effect.flatMap((client) =>
        client.call("SYNO.FileStation.Info", "1", "get")
      )
    )
  );

  console.log(result);
}
