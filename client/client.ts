import { Effect, Option, pipe } from "npm:effect@latest";

import { parse as parsePayload } from "./payload.ts";
import { type Request, type ResponsePayload, SYNO } from "./requests/mod.ts";

import { fetch, json } from "../fetch.ts";
class NotAuthenticatedError extends Error {
  constructor() {
    super("Not Authenticated'");
  }
}

export class Client {
  private authentication: Option.Option<
    ResponsePayload<typeof SYNO.API.Auth.login>
  > = Option.none();

  private constructor() {}

  static create(username: string, password: string) {
    const client = new Client();

    return client.authenticate(username, password);
  }

  private injectAuthentication(
    url: URL
  ): Effect.Effect<never, NotAuthenticatedError, URL> {
    return Option.match(this.authentication, {
      onNone: () => Effect.fail(new NotAuthenticatedError()),
      onSome: (authentication) => {
        url.searchParams.append("SynoToken", authentication.synotoken);
        url.searchParams.append("_sid", authentication.sid);

        return Effect.succeed(url);
      },
    });
  }

  private authenticate(username: string, password: string) {
    const { url } = SYNO.API.Auth.login;

    // User name and password
    url.searchParams.append("account", username);
    url.searchParams.append("passwd", password);

    // Not sure yet...
    url.searchParams.append("enable_syno_token", "yes");

    return pipe(
      this.makeRequest(url),
      Effect.flatMap((payload) => SYNO.API.Auth.login.parse(payload)),
      Effect.map((authentication) => {
        // Run side-effect; is there a better way to do this?
        this.authentication = Option.some(authentication);

        return this;
      })
    );
  }

  private makeRequest<T>(url: URL) {
    return pipe(
      // Perform the `fetch` to the URL
      fetch(url),
      // Extract the JSON from the response
      Effect.flatMap((response) => json(response)),
      // Parse the response payload to determine sucess or failure
      Effect.flatMap((payload) => parsePayload(payload))
    );
  }

  /* === API Actions === */

  call<T>(request: Request<T>) {
    return pipe(
      this.injectAuthentication(request.url),
      Effect.flatMap((url) => this.makeRequest(url)),
      Effect.flatMap((json) => request.parse(json))
    );
  }
}
