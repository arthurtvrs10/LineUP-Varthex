import { getSession } from "next-auth/react";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

// Chama o backend através do proxy do Next.js (ver next.config.ts) — os
// caminhos são relativos ("/customers", não "http://..."), então
// funcionam tanto local quanto em Docker sem mudar nada aqui.
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const session = await getSession();
  const token = session?.user?.accessToken;

  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    let message = `Erro ${res.status}`;
    try {
      const body = await res.json();
      message = body.message ?? message;
    } catch {
      // resposta sem corpo JSON — mantém a mensagem genérica
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}
