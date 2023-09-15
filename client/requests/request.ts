import * as S from "npm:@effect/schema/Schema";
import type { ParseResult } from "npm:@effect/schema/ParseResult";

import { buildURL } from "../url.ts";

interface RequestArgs<ResponseSchema> {
  readonly api: string;
  readonly version: string;
  readonly method: string;
  readonly responseSchema: S.Schema<ResponseSchema>;
}

/**
 * Extracts the shape of the parsed response to a `Request`
 */
export type ResponsePayload<R> = R extends Request<infer ResponseSchema>
  ? S.To<S.Schema<ResponseSchema>>
  : never;

export class Request<ResponseSchema> {
  private api: string;
  private version: string;
  private method: string;

  private responseSchema: S.Schema<ResponseSchema>;

  parse: (i: unknown) => ParseResult<ResponseSchema>;

  constructor(args: RequestArgs<ResponseSchema>) {
    this.api = args.api;
    this.version = args.version;
    this.method = args.method;

    this.responseSchema = args.responseSchema;
    this.parse = S.parseResult(this.responseSchema);
  }

  get url() {
    return buildURL(this.api, this.version, this.method);
  }
}
