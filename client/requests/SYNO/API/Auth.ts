import * as S from "npm:@effect/schema/Schema";
import { Request } from "../../request.ts";

export const login = new Request({
  api: "SYNO.API.Auth",
  version: "6",
  method: "login",

  responseSchema: S.struct({
    did: S.string,
    is_portal_port: S.boolean,
    sid: S.string,
    synotoken: S.string,
  }),
});
