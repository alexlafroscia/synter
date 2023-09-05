import { Effect, Option, pipe } from "npm:effect@latest";

import {
  Authentication,
  parse as parseAuthentication,
} from "./authentication.ts";
import { buildURL } from "./url.ts";
import { parse as parsePayload } from "./payload.ts";

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
  ): Effect.Effect<never, NotAuthenticatedError, Client> {
    const client = new Client();

    return Effect.promise(() => client.authenticate(username, password));
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

  private async authenticate(
    username: string,
    password: string
  ): Promise<Client> {
    const url = buildURL("SYNO.API.Auth", "6", "login");

    // User name and password
    url.searchParams.append("account", username);
    url.searchParams.append("passwd", password);

    // Not sure yet...
    url.searchParams.append("enable_syno_token", "yes");

    const res = await fetch(url);
    const payload = await res.json();

    const auth = pipe(
      parsePayload(payload),
      Effect.flatMap((payload) => parseAuthentication(payload)),
      Effect.option
    );

    this.authentication = Effect.runSync(auth);

    return this;
  }

  private makeRequest<T>(url: URL): Effect.Effect<never, unknown, T> {
    return pipe(
      // Perform the `fetch` to the URL
      Effect.promise(() => fetch(url)),
      // Extract the JSON from the response
      Effect.flatMap((response) => Effect.promise(() => response.json())),
      // Parse the response payload to determine sucess or failure
      Effect.flatMap((payload) => parsePayload(payload))
    );
  }

  /* === API Actions === */

  call(
    api: string,
    version: string,
    method: string
  ): Effect.Effect<never, NotAuthenticatedError | unknown, unknown> {
    return pipe(
      this.injectAuthentication(buildURL(api, version, method)),
      Effect.flatMap((url) => this.makeRequest(url))
    );
  }

  listShares(): Effect.Effect<never, NotAuthenticatedError | unknown, unknown> {
    return this.call("SYNO.FileStation.List", "1", "list_share");
  }
}
