import type { Env } from "./env";

const BASE_URL = "https://api.pluggy.ai";
const API_KEY_TTL_MS = 110 * 60 * 1000;

let cachedKey: { value: string; expiresAt: number } | null = null;

export class UpstreamError extends Error {
  constructor(readonly status: number) {
    super("upstream_error");
  }
}

type RequestOptions = {
  method?: "GET" | "PATCH";
  query?: Record<string, string | undefined>;
  body?: unknown;
};

async function authenticate(env: Env): Promise<string> {
  const response = await fetch(`${BASE_URL}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clientId: env.PLUGGY_CLIENT_ID,
      clientSecret: env.PLUGGY_CLIENT_SECRET,
    }),
  });

  if (!response.ok) {
    throw new UpstreamError(response.status);
  }

  const { apiKey } = (await response.json()) as { apiKey: string };
  cachedKey = { value: apiKey, expiresAt: Date.now() + API_KEY_TTL_MS };

  return apiKey;
}

async function getApiKey(env: Env): Promise<string> {
  if (cachedKey && cachedKey.expiresAt > Date.now()) {
    return cachedKey.value;
  }

  return authenticate(env);
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = new URL(path, BASE_URL);

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) {
      url.searchParams.set(key, value);
    }
  }

  return url.toString();
}

export async function pluggy<T>(
  env: Env,
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const url = buildUrl(path, options.query);

  const send = (apiKey: string) =>
    fetch(url, {
      method: options.method ?? "GET",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });

  let response = await send(await getApiKey(env));

  if (response.status === 401 || response.status === 403) {
    cachedKey = null;
    response = await send(await authenticate(env));
  }

  if (!response.ok) {
    throw new UpstreamError(response.status);
  }

  return (await response.json()) as T;
}
