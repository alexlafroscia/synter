import { Authentication } from "./authentication.ts";
import { buildURL } from "./url.ts";

export class Client {
  private authentication: Authentication | null = null;

  private attachAuthentication(url: URL): URL {
    if (!this.authentication) {
      throw new Error("not authenticated");
    }

    url.searchParams.append("SynoToken", this.authentication.synotoken);
    url.searchParams.append("_sid", this.authentication.sid);

    return url;
  }

  async authenticate(username: string, password: string): Promise<void> {
    const url = buildURL("SYNO.API.Auth", "6", "login");

    // User name and password
    url.searchParams.append("account", username);
    url.searchParams.append("passwd", password);

    // Not sure yet...
    url.searchParams.append("enable_syno_token", "yes");

    const res = await fetch(url);
    const payload = await res.json();

    this.authentication = Authentication.parse(payload.data);
  }

  async listShares() {
    const url = this.attachAuthentication(
      buildURL("SYNO.FileStation.List", "1", "list_share")
    );

    const res = await fetch(url);
    const payload = await res.json();

    console.log(payload);
  }
}
