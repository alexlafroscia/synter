import { Effect } from "npm:effect@latest";

type JSONObject = any;

class UnexpectedPayloadError extends Error {
  payload: any;

  constructor(payload: any) {
    super("Unexpected payload received from DSM");

    this.payload = payload;
  }
}

class DSMClientError extends Error {
  code: string;
  errors: Array<JSONObject>;

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
    errors: Array<JSONObject>;
  };
}

interface DSMSuccessPayload<T extends JSONObject> {
  success: true;
  data: T;
}

type DSMResponse<T> = DSMErrorPayload | DSMSuccessPayload<T>;

function isRecognizedDSMResponse<T>(
  payload: unknown
): payload is DSMResponse<T> {
  return !!payload && typeof payload === "object" && "success" in payload;
}

export function parse<T extends JSONObject>(
  payload: DSMResponse<T> | unknown
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
