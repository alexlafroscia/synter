import { Effect, pipe } from "npm:effect@latest";
import type { JsonObject } from "npm:type-fest";

import {
  type DSMClientError,
  type DSMErrorParseError,
  parse as parseError,
} from "./error.ts";

class UnexpectedPayloadError extends Error {
  payload: unknown;

  constructor(payload: unknown) {
    super("Unexpected payload received from DSM");

    this.payload = payload;
  }
}
interface DSMErrorPayload {
  success: false;
  error: {
    code: string;
    errors: Array<JsonObject>;
  };
}

interface DSMSuccessPayload {
  success: true;
  data: unknown;
}

type DSMResponse = DSMErrorPayload | DSMSuccessPayload;

function isRecognizedDSMResponse(payload: unknown): payload is DSMResponse {
  return !!payload && typeof payload === "object" && "success" in payload;
}

export type ParseError =
  // DSM payloads that don't match their documentation at all
  | UnexpectedPayloadError
  // Recognized DSM error payloads
  | DSMClientError
  // DSM error payloads that don't match their documentation
  | DSMErrorParseError;

export function parse(
  payload: unknown,
): Effect.Effect<never, ParseError, unknown> {
  if (isRecognizedDSMResponse(payload)) {
    if (payload.success) {
      return Effect.succeed(payload.data);
    } else {
      return pipe(
        parseError(payload.error),
        // A successful parsing of the error should still be converted
        // into a failure for parsing the error payload as a whole
        // This is because we want to use a Failure to represent known
        // types of errors from the DSM API
        Effect.flatMap((clientError) => Effect.fail(clientError)),
      );
    }
  }

  return Effect.fail(new UnexpectedPayloadError(payload));
}
