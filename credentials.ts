import { Data, Effect, pipe } from "npm:effect@latest";

export function env(variable: string): Effect.Effect<never, string, string> {
  return pipe(
    // `Effect.sync` is used to capture the permissions exception if it occurs
    Effect.sync(() => Deno.env.get(variable)),
    Effect.flatMap((value) =>
      value
        ? // If we got a value that isn't empty, we succeeded
          Effect.succeed(value)
        : // If we got a empty value, then the environment variable needs to be set
          Effect.fail(`$${variable} is not set`)
    )
  );
}

export const username = env("DSM_USR");

export const password = env("DSM_PWD");

export const credentials = Effect.zipWith(
  username,
  password,
  (username, password) => Data.tuple(username, password)
);
