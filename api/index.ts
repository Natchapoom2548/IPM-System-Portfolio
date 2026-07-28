import { app } from "../server.js";

function routeFromRequest(req: any): string {
  const queryRoute = req.query?.route;
  if (Array.isArray(queryRoute)) return queryRoute[0] ?? "";
  if (typeof queryRoute === "string") return queryRoute;

  const url = new URL(req.url ?? "/", "http://localhost");
  return url.searchParams.get("route") ?? "";
}

export default function handler(req: any, res: any) {
  const route = routeFromRequest(req).replace(/^\/+/, "");
  const incomingUrl = new URL(req.url ?? "/", "http://localhost");
  incomingUrl.searchParams.delete("route");

  const query = incomingUrl.searchParams.toString();
  req.url = `/api/${route}${query ? `?${query}` : ""}`;

  return app(req, res);
}
