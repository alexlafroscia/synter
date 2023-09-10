import { Effect, pipe } from "npm:effect@latest";
import type { JsonObject } from "npm:type-fest";

export class FetchException {
  constructor(public exception: unknown) {}

  readonly _tag = "FetchError";
}

export class FetchClientError {
  constructor(public response: Response) {}

  readonly _tag = "FetchClientError";
}

export function fetch(
  url: URL
): Effect.Effect<never, FetchException | FetchClientError, Response> {
  return pipe(
    Effect.tryPromise({
      try: () => globalThis.fetch(url),
      catch: (error) => new FetchException(error),
    }),
    Effect.flatMap((res) =>
      res.ok ? Effect.succeed(res) : Effect.fail(new FetchClientError(res))
    )
  );
}

export class JSONError {
  readonly _tag = "JSONError";
}

export function json(
  response: Response
): Effect.Effect<never, JSONError, JsonObject> {
  return Effect.tryPromise({
    try: () => response.json() as Promise<JsonObject>,
    catch: () => new JSONError(),
  });
}
