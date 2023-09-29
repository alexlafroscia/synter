import {
  assertStrictEquals,
  assertThrows,
} from "https://deno.land/std@0.201.0/assert/mod.ts";
import {
  returnsArg,
  returnsNext,
  stub,
} from "https://deno.land/std@0.201.0/testing/mock.ts";

import { Effect } from "npm:effect@latest";

import { env } from "./credentials.ts";

Deno.test(
  "env: when a value is present",
  { permissions: { env: true } },
  () => {
    // Using `returnsArg` allows us to validate that `Deno.env.get` was called with the given
    // environment variable name
    const envGetMock = stub(Deno.env, "get", returnsArg(0));

    assertStrictEquals(Effect.runSync(env("WHATEVER")), "WHATEVER");

    envGetMock.restore();
  },
);

Deno.test(
  "env: when a value is not present",
  { permissions: { env: true } },
  () => {
    const envGetMock = stub(Deno.env, "get", returnsNext([undefined]));

    assertThrows(
      () => {
        Effect.runSync(env("WHATEVER"));
      },
      Error,
      "$WHATEVER is not set",
    );

    envGetMock.restore();
  },
);

Deno.test(
  "env: when permissions are denied",
  { permissions: { env: false } },
  () => {
    assertThrows(
      () => {
        Effect.runSync(env("WHATEVER"));
      },
      Error,
      'Requires env access to "WHATEVER"',
    );
  },
);
