export const dynamic = "force-dynamic";

export function GET() {
  // Read at runtime: Docker injects .env.local when the container starts.
  // Destructuring avoids Next.js inlining NEXT_PUBLIC_* during the build.
  const { NEXT_PUBLIC_DEMO_SWITCHER } = process.env;
  return Response.json(
    { enabled: NEXT_PUBLIC_DEMO_SWITCHER === "true" },
    { headers: { "Cache-Control": "no-store" } },
  );
}
