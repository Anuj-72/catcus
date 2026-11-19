/**
 * Server-only client for the FastAPI auth API. The browser never calls the
 * backend directly: Server Actions are the only callers, so no CORS setup or
 * public backend URL is needed.
 */

const DEFAULT_BACKEND_URL = "http://127.0.0.1:8000";
const REQUEST_TIMEOUT_MS = 5_000;

export type BackendUser = {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
};

export type AuthResult = {
  token: string;
  expiresIn: number;
  user: BackendUser;
};

export type BackendErrorKind =
  | "email_taken"
  | "invalid_credentials"
  | "invalid_token"
  | "unreachable"
  | "invalid_response"
  | "rejected";

export class BackendError extends Error {
  constructor(
    readonly kind: BackendErrorKind,
    readonly status: number | null = null,
  ) {
    super(kind);
    this.name = "BackendError";
  }
}

function backendUrl(path: string): string {
  const base = (process.env.BACKEND_URL ?? DEFAULT_BACKEND_URL).replace(
    /\/+$/,
    "",
  );
  return `${base}${path}`;
}

type RequestOptions = {
  method?: "GET" | "POST";
  body?: unknown;
  token?: string;
  /** Backend error kind for a 401; login and protected calls differ. */
  unauthorized?: BackendErrorKind;
};

async function request(
  path: string,
  options: RequestOptions = {},
): Promise<unknown> {
  const headers: Record<string, string> = { accept: "application/json" };
  if (options.body !== undefined) {
    headers["content-type"] = "application/json";
  }
  if (options.token) {
    headers.authorization = `Bearer ${options.token}`;
  }

  let response: Response;
  try {
    response = await fetch(backendUrl(path), {
      method: options.method ?? "GET",
      headers,
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    // Connection refused, DNS failure, timeout: treat as an unavailable API.
    throw new BackendError("unreachable");
  }

  if (response.status === 409) throw new BackendError("email_taken", 409);
  if (response.status === 401) {
    throw new BackendError(options.unauthorized ?? "rejected", 401);
  }
  if (!response.ok) throw new BackendError("rejected", response.status);
  if (response.status === 204) return undefined;

  try {
    return await response.json();
  } catch {
    throw new BackendError("invalid_response", response.status);
  }
}

function parseUser(value: unknown): BackendUser {
  if (value === null || typeof value !== "object") {
    throw new BackendError("invalid_response");
  }
  const record = value as Record<string, unknown>;
  if (
    typeof record.id !== "string" ||
    typeof record.email !== "string" ||
    typeof record.full_name !== "string" ||
    typeof record.created_at !== "string"
  ) {
    throw new BackendError("invalid_response");
  }
  return {
    id: record.id,
    email: record.email,
    full_name: record.full_name,
    created_at: record.created_at,
  };
}

function parseAuthResponse(value: unknown): AuthResult {
  if (value === null || typeof value !== "object") {
    throw new BackendError("invalid_response");
  }
  const record = value as Record<string, unknown>;
  if (
    typeof record.access_token !== "string" ||
    !record.access_token ||
    record.token_type !== "bearer" ||
    typeof record.expires_in !== "number" ||
    !Number.isFinite(record.expires_in) ||
    record.expires_in <= 0
  ) {
    throw new BackendError("invalid_response");
  }
  return {
    token: record.access_token,
    expiresIn: record.expires_in,
    user: parseUser(record.user),
  };
}

export async function registerUser(input: {
  full_name: string;
  email: string;
  password: string;
}): Promise<AuthResult> {
  return parseAuthResponse(
    await request("/auth/register", { method: "POST", body: input }),
  );
}

export async function authenticateUser(input: {
  email: string;
  password: string;
  remember: boolean;
}): Promise<AuthResult> {
  return parseAuthResponse(
    await request("/auth/login", {
      method: "POST",
      body: input,
      unauthorized: "invalid_credentials",
    }),
  );
}

export async function getCurrentUser(token: string): Promise<BackendUser> {
  return parseUser(
    await request("/auth/me", { token, unauthorized: "invalid_token" }),
  );
}

export async function logout(token: string): Promise<void> {
  await request("/auth/logout", {
    method: "POST",
    token,
    unauthorized: "invalid_token",
  });
}