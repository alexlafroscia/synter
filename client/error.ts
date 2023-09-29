import * as S from "npm:@effect/schema/Schema";
import { ParseError } from "npm:@effect/schema/ParseResult";

function makeError(code: number, message: string) {
  const Error = S.struct({
    // All errors have a code
    code: S.literal(code),
    // They might also contain an `errors` array with more stuff in it,
    // but what exactly that is is not well-described
    errors: S.optional(S.array(S.unknown)),
  });

  // Automatically add/remove the `message` property
  return S.transform(
    // Original schema
    Error,
    // Extended schema (with "message" that we inject)
    Error.pipe(S.extend(S.struct({ message: S.literal(message) }))),
    // Transform from "original" to "extended"
    (error) => ({ ...error, message }),
    // Transform from "extended" to "original"
    ({ message: _message, ...rest }) => rest,
  );
}

export type DSMClientError = S.To<ReturnType<typeof makeError>>;

export type DSMErrorParseError = ParseError;

/* === Known Error Definitions === */

const KNOWN_ERRORS: Record<number, string> = {
  100: "Unknown error.",
  101: "No parameter of API, method or version.",
  102: "The requested API does not exist.",
  103: "The requested method does not exist.",
  104: "The requested version does not support the functionality.",
  105: "The logged in session does not have permission.",
  106: "Session timeout.",
  107: "Session interrupted by duplicated login.",
  108: "Failed to upload the file.",
  109: "The network connection is unstable or the system is busy.",
  110: "The network connection is unstable or the system is busy.",
  111: "The network connection is unstable or the system is busy.",
  114: "Lost parameters for this API.",
  115: "Not allowed to upload a file.",
  116: "Not allowed to perform for a demo site.",
  117: "The network connection is unstable or the system is busy.",
  118: "The network connection is unstable or the system is busy.",
  119: "Invalid session.",
};

/* === Generic Error Parsing === */

const AnyDSMClientError = S.union(
  ...Object.entries(KNOWN_ERRORS).map(([code, message]) =>
    makeError(parseInt(code), message)
  ),
);

export const parse = S.parseResult(AnyDSMClientError);
