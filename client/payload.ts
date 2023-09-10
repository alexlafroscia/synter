import { Effect } from "npm:effect@latest";
import type { JsonObject } from "npm:type-fest";

class UnexpectedPayloadError extends Error {
  payload: JsonObject;

  constructor(payload: JsonObject) {
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

interface DSMSuccessPayload<T extends JsonObject> {
  success: true;
  data: T;
}

type DSMResponse<T extends JsonObject = JsonObject> =
  | DSMErrorPayload
  | DSMSuccessPayload<T>;

function isRecognizedDSMResponse<T extends JsonObject = JsonObject>(
  payload: unknown
): payload is DSMResponse<T> {
  return !!payload && typeof payload === "object" && "success" in payload;
}

export function parse<T extends JsonObject>(
  payload: JsonObject
): Effect.Effect<never, UnexpectedPayloadError | DSMClientError, T> {
  if (isRecognizedDSMResponse<T>(payload)) {
    if (payload.success) {
      return Effect.succeed(payload.data);
    } else {
      return Effect.fail(new DSMClientError(payload.error));
    }
  }

  return Effect.fail(new UnexpectedPayloadError(payload));
}
