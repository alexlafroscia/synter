import { Effect } from "npm:effect@latest";
import type { JsonObject } from "npm:type-fest";

class UnexpectedPayloadError extends Error {
  payload: unknown;

  constructor(payload: unknown) {
    super("Unexpected payload received from DSM");

    this.payload = payload;
  }
}

export class DSMClientError extends Error {
  code: string;
  errors: Array<JsonObject>;

  constructor(error: DSMErrorPayload["error"]) {
    const { code, errors } = error;

    super(`Client error with request: ${code}`);

    this.code = code;
    this.errors = errors;
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

export function parse(
  payload: unknown
): Effect.Effect<never, UnexpectedPayloadError | DSMClientError, unknown> {
  if (isRecognizedDSMResponse(payload)) {
    if (payload.success) {
      return Effect.succeed(payload.data);
    } else {
      return Effect.fail(new DSMClientError(payload.error));
    }
  }

  return Effect.fail(new UnexpectedPayloadError(payload));
}
