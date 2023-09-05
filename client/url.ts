const HOST = "192.168.0.148";
const PORT = "5000";

const PATH = "entry.cgi";

const REMOTE = `http://${HOST}:${PORT}`;

export function buildURL(api: string, version: string, method: string): URL {
  const url = new URL(`${REMOTE}/webapi/${PATH}`);

  url.searchParams.append("api", api);
  url.searchParams.append("version", version);
  url.searchParams.append("method", method);

  return url;
}
