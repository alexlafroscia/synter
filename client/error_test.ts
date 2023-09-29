import { assertEquals } from "https://deno.land/std@0.201.0/assert/mod.ts";
import * as ParseResult from "npm:@effect/schema/ParseResult";

import { parse } from "./error.ts";

Deno.test("parse", async (t) => {
  await t.step("UnknownError", () => {
    assertEquals(
      parse({ code: 100 }),
      ParseResult.success({ code: 100, message: "Unknown error." }),
    );
  });

  await t.step("NoParameterError", () => {
    assertEquals(
      parse({ code: 101 }),
      ParseResult.success({
        code: 101,
        message: "No parameter of API, method or version.",
      }),
    );
  });

  await t.step({
    name: "unknown code results in an error",
    ignore: true,
    fn() {},
  });
});
