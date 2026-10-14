/**
 * API client for the QuantEV FastAPI backend.
 * Base URL: http://localhost:8000
 */

import type { OptimizeRequest, OptimizeResponse, LiveDataResponse } from "@/types/api";

export const DEPLOYED_BACKEND_URL = "https://evverse-backend.onrender.com";
export const LOCAL_BACKEND_URL = "http://localhost:8000";

/**
 * Resolves the backend API base URL with the following precedence:
 * 1. Explicit NEXT_PUBLIC_API_BASE_URL or NEXT_PUBLIC_API_URL if set and not a placeholder.
 * 2. In browser environments:
 *    - Defaults to LOCAL_BACKEND_URL when accessed from localhost / 127.0.0.1.
 *    - Defaults to DEPLOYED_BACKEND_URL when deployed to a remote domain (e.g. Vercel).
 * 3. In server / build environments:
 *    - Defaults to DEPLOYED_BACKEND_URL in production (e.g. VERCEL build).
 *    - Otherwise defaults to LOCAL_BACKEND_URL.
 */
export function getApiBaseUrl(): string {
  const envUrl = (
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    ""
  ).trim();

  // If a valid custom URL is provided that is not a placeholder:
  if (
    envUrl &&
    !envUrl.includes("YOUR-BACKEND-URL") &&
    !envUrl.includes("your-backend-url")
  ) {
    // If running in browser on a production/remote domain (not localhost),
    // prevent localhost URLs from being used (which get blocked by Mixed Content or fail):
    if (typeof window !== "undefined") {
      const isLocalHost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname.endsWith(".local");

      if (!isLocalHost && (envUrl.includes("localhost") || envUrl.includes("127.0.0.1"))) {
        return DEPLOYED_BACKEND_URL;
      }
    }
    return envUrl.replace(/\/+$/, "");
  }

  // Client-side host detection fallback
  if (typeof window !== "undefined") {
    const isLocalHost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.endsWith(".local");

    if (!isLocalHost) {
      return DEPLOYED_BACKEND_URL;
    }
    return LOCAL_BACKEND_URL;
  }

  // Server-side / build-time detection
  if (process.env.NODE_ENV === "production") {
    return DEPLOYED_BACKEND_URL;
  }

  return LOCAL_BACKEND_URL;
}

export const BASE_URL = getApiBaseUrl();

// ── Sanitise error messages ───────────────────────────────────────────────────
// Backend 500 detail strings can contain raw binary data from Qiskit/C
// extensions. Strip any non-printable / non-ASCII characters before
// surfacing them to the UI.
function sanitiseDetail(raw: unknown): string {
  if (typeof raw !== "string") return "The optimization pipeline returned an error.";

  // Remove null bytes, control characters and garbled binary sequences.
  const cleaned = raw
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]/g, "")
    .replace(/[^\x20-\x7e\n\r\t]/g, "")
    .trim();

  // If nothing legible remains, return a generic message.
  if (!cleaned || cleaned.length < 4) {
    return "The optimization pipeline encountered an internal error. Check the server logs for details.";
  }

  // Strip the "Optimization pipeline failed: " prefix FastAPI adds so the
  // UI message is friendlier.
  return cleaned
    .replace(/^Optimization pipeline failed:\s*/i, "")
    .replace(/^Unknown error:\s*/i, "");
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly rawDetail?: string,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${path}`;
  let response: Response;

  try {
    response = await fetch(url, {
      headers: { "Content-Type": "application/json", ...options?.headers },
      ...options,
    });
  } catch (err) {
    // Network error — server not reachable
    console.error("[QuantEV] Network error calling", url, err);
    const isLocal = baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1");
    const message = isLocal
      ? "Cannot reach the QuantEV backend. Make sure the server is running on port 8000."
      : "Cannot reach the EVverse backend. The server may be waking up or temporarily unreachable. Please try again in a few moments.";
    throw new ApiClientError(message);
  }

  if (!response.ok) {
    // Attempt to read the error body as text first (handles binary/garbled bodies)
    let rawText = "";
    try {
      rawText = await response.text();
    } catch {
      rawText = "";
    }

    // Log the full raw error for debugging
    console.error(
      `[QuantEV] API error ${response.status} from ${url}:`,
      rawText,
    );

    // Try to parse as JSON to get the FastAPI "detail" field
    let detail = "";
    try {
      const body = JSON.parse(rawText);
      detail = sanitiseDetail(body?.detail ?? "");
    } catch {
      detail = sanitiseDetail(rawText);
    }

    // Fallback to a human-readable status-code message
    if (!detail) {
      const statusMessages: Record<number, string> = {
        422: "The request was rejected by the server — invalid parameters.",
        500: "The optimization pipeline encountered an internal error. Check the server logs for details.",
        503: "The server is unavailable. Please try again shortly.",
      };
      detail = statusMessages[response.status] ?? `Server error (HTTP ${response.status}).`;
    }

    throw new ApiClientError(detail, response.status, rawText);
  }

  // Parse successful response
  try {
    return (await response.json()) as T;
  } catch (err) {
    console.error("[QuantEV] Failed to parse successful response from", url, err);
    throw new ApiClientError(
      "The server returned an unreadable response. Check the console for details.",
    );
  }
}

// ── Endpoints ─────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/optimize
 * Run the full AI → QUBO → QAOA pipeline.
 */
export async function runOptimize(
  params: OptimizeRequest = {},
): Promise<OptimizeResponse> {
  return request<OptimizeResponse>("/api/v1/optimize", {
    method: "POST",
    body: JSON.stringify({
      city: params.city ?? "Mumbai",
      station_count: params.station_count ?? 3,
      scenario: params.scenario ?? "all_hours",
      reps:  params.reps  ?? 1,
      shots: params.shots ?? 2048,
      seed:  params.seed  ?? 42,
    }),
  });
}

/**
 * GET /api/v1/health
 */
export async function getHealth(): Promise<{ status: string; service: string }> {
  return request("/api/v1/health");
}

/**
 * GET /api/v1/live-stations
 * Fetch live or fallback stations for a city.
 */
export async function fetchLiveStations(
  city: string = "Mumbai",
  maxResults: number = 50,
): Promise<LiveDataResponse> {
  const query = new URLSearchParams({
    city,
    max_results: String(maxResults),
  });
  return request<LiveDataResponse>(`/api/v1/live-stations?${query.toString()}`);
}

