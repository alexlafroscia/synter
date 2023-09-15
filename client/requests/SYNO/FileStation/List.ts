import * as S from "npm:@effect/schema/Schema";
import { Request } from "../../request.ts";

export const list_share = new Request({
  api: "SYNO.FileStation.List",
  version: "1",
  method: "list_share",

  responseSchema: S.struct({
    offset: S.number,
    shares: S.array(
      S.struct({
        isdir: S.boolean,
        name: S.string,
        path: S.string,
      })
    ),
    total: S.number,
  }),
});
