import { handleDemoApiRequest } from "./demoApi";

export async function apiFetch(input: string | Request, init?: RequestInit): Promise<Response> {
  const url = typeof input === "string" ? input : (input instanceof Request ? input.url : "");

  if (url.includes("/api/")) {
    return handleDemoApiRequest(input, init);
  }

  return fetch(input, init);
}
