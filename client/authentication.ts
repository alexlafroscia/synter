import * as S from "npm:@effect/schema/Schema";

export const Authentication = S.struct({
  did: S.string,
  is_portal_port: S.boolean,
  sid: S.string,
  synotoken: S.string,
});

export type Authentication = S.To<typeof Authentication>;

export const parse = S.parseResult(Authentication);
