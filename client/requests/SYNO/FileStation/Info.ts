import * as S from "npm:@effect/schema/Schema";
import { Request } from "../../request.ts";

export const query = new Request({
  api: "SYNO.FileStation.Info",
  version: "1",
  method: "query",

  // TODO: model real schema
  responseSchema: S.unknown,
});
