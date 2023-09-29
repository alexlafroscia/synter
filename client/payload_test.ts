import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.201.0/assert/mod.ts";

import { Effect } from "npm:effect@latest";
import { parse } from "./payload.ts";

Deno.test("extracting a valid payload", () => {
  const result = parse({ success: true, data: { foo: "bar" } });

  assertEquals(Effect.runSync(result), { foo: "bar" });
});

Deno.test("extracting a recognized error", () => {
  const result = parse({ success: false, error: { code: 101 } });

  assertThrows(
    () => {
      Effect.runSync(result);
    },
    Error,
    // Why does the error get stringified?
    JSON.stringify({
      code: 101,
      message: "No parameter of API, method or version.",
    }),
  );
});

Deno.test("extracting an unrecognized error", () => {
  const result = parse({ success: false, error: { code: 1000000 } });

  // TODO: use a more specific assertion here
  assertThrows(() => {
    Effect.runSync(result);
  });
});
