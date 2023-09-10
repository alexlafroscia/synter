import { Effect, Option, pipe } from "npm:effect@latest";

import {
  Authentication,
  parse as parseAuthentication,
} from "./authentication.ts";
import { buildURL } from "./url.ts";
import { parse as parsePayload } from "./payload.ts";

import { fetch, json } from "../fetch.ts";
class NotAuthenticatedError extends Error {
  constructor() {
    super("Not Authenticated'");
  }
}

export class Client {
  private authentication: Option.Option<Authentication> = Option.none();

  private constructor() {}

  static create(
    username: string,
    password: string
  ): Effect.Effect<never, NotAuthenticatedError | unknown, Client> {
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

  private authenticate(
    username: string,
    password: string
  ): Effect.Effect<never, unknown, Client> {
    const url = buildURL("SYNO.API.Auth", "6", "login");

    // User name and password
    url.searchParams.append("account", username);
    url.searchParams.append("passwd", password);

    // Not sure yet...
    url.searchParams.append("enable_syno_token", "yes");

    return pipe(
      this.makeRequest(url),
      Effect.flatMap((payload) => parseAuthentication(payload)),
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

  call(api: string, version: string, method: string) {
    return pipe(
      this.injectAuthentication(buildURL(api, version, method)),
      Effect.flatMap((url) => this.makeRequest(url))
    );
  }

  listShares() {
    return this.call("SYNO.FileStation.List", "1", "list_share");
  }
}
