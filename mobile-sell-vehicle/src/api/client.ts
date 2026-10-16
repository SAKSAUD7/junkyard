const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.trim().replace(/\/+$/, "") ?? "";

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function getConfiguredBaseUrl(): string {
  if (!API_BASE_URL) {
    throw new ApiError("The JYNM API URL is not configured. Set EXPO_PUBLIC_API_BASE_URL and restart the app.");
  }

  let parsed: URL;
  try {
    parsed = new URL(API_BASE_URL);
  } catch {
    throw new ApiError("The configured JYNM API URL is invalid.");
  }

  if (!__DEV__ && parsed.protocol !== "https:") {
    throw new ApiError("The JYNM API must use HTTPS outside development.");
  }
  if (!parsed.pathname.replace(/\/+$/, "").endsWith("/api")) {
    throw new ApiError("Set EXPO_PUBLIC_API_BASE_URL to the existing JYNM API root ending in /api.");
  }

  return API_BASE_URL;
}

async function request(path: string, options: RequestInit = {}, timeoutMs = 15000): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(`${getConfiguredBaseUrl()}${path}`, {
      ...options,
      headers: { Accept: "application/json", ...options.headers },
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError("The JYNM server did not respond in time. Check the connection and try again.");
    }
    throw new ApiError("Could not reach the JYNM server. Check the API address and your network connection.");
  } finally {
    clearTimeout(timeout);
  }
}

async function readError(response: Response): Promise<string> {
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (data && typeof data === "object") {
    const value = data as Record<string, unknown>;
    const detail = value.detail ?? value.error ?? value.message;
    if (typeof detail === "string") return detail;
    const fieldErrors = Object.entries(value)
      .filter(([key]) => !["detail", "error", "message"].includes(key))
      .flatMap(([field, messages]) => {
        const list = Array.isArray(messages) ? messages : [messages];
        return list.filter((message): message is string => typeof message === "string").map((message) => `${field}: ${message}`);
      });
    if (fieldErrors.length) return fieldErrors.join("\n");
  }

  if (response.status === 429) return "Too many requests. Please wait a while before submitting again.";
  if (response.status >= 500) return "The JYNM server is temporarily unavailable. Please try again later.";
  return `The request could not be completed (HTTP ${response.status}).`;
}

export async function postJson<T>(path: string, payload: unknown): Promise<T> {
  const response = await request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new ApiError(await readError(response), response.status);
  return response.json() as Promise<T>;
}

export async function checkBackend(): Promise<void> {
  const response = await request("/health/", { method: "GET" }, 8000);
  if (!response.ok) throw new ApiError(await readError(response), response.status);
  const result = await response.json() as { status?: string; database?: string; cache?: string };
  if (result.status !== "ok") {
    throw new ApiError(`JYNM API responded, but a service is unhealthy (database: ${result.database ?? "unknown"}, cache: ${result.cache ?? "unknown"}).`);
  }
}
