// Server-side requests must use the container's runtime configuration.
export function backendUrl(path: string): string {
  const { BACKEND_INTERNAL_URL, NEXT_PUBLIC_API_URL } = process.env;
  const origin = BACKEND_INTERNAL_URL || NEXT_PUBLIC_API_URL || "http://localhost:8080";
  return `${origin.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}
