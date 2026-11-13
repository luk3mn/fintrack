import { auth } from "@/config/firebase";
import { env } from "@/config/env";

export class ApiError extends Error {
  constructor(readonly status: number) {
    super(`api_error_${status}`);
  }
}

type Query = Record<string, string | number | undefined>;

type Options = {
  method?: "GET" | "POST";
  query?: Query;
};

function buildQuery(query?: Query) {
  const parts = Object.entries(query ?? {})
    .filter((entry): entry is [string, string | number] => entry[1] !== undefined)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);

  return parts.length ? `?${parts.join("&")}` : "";
}

export async function api<T>(path: string, options: Options = {}): Promise<T> {
  const user = auth.currentUser;

  if (!user) {
    throw new ApiError(401);
  }

  const token = await user.getIdToken();

  const response = await fetch(`${env.apiUrl}${path}${buildQuery(options.query)}`, {
    method: options.method ?? "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new ApiError(response.status);
  }

  return (await response.json()) as T;
}
