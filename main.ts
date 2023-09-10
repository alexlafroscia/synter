import { Effect, pipe } from "npm:effect@latest";

import { Client } from "./client/client.ts";
import { credentials } from "./credentials.ts";

if (import.meta.main) {
  const results = await Effect.runPromise(
    pipe(
      credentials,
      Effect.flatMap(([username, password]) =>
        Client.create(username, password)
      ),
      // Effect.flatMap((client) => client.listShares())

      Effect.flatMap((client) => client.call("SYNO.API.Info", "1", "query")),

      // Effect.flatMap((client) =>
      //   client.call("SYNO.FileStation.BackgroundTask", "3", "query")
      // )

      // Effect.flatMap((client) =>
      //   client.call("SYNO.FileStation.Info", "1", "get")
      // )

      Effect.map((json) => Object.keys(json))

      // Effect.map((json) => {
      //   json;
      // })
    )
  );

  for (const result of results) {
    console.log(result);
  }
}
