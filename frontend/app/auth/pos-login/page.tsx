"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

import { clientDestination } from "@/lib/client-barbershop";

const roleRedirect: Record<string, string> = {
  SUPER_ADMIN: "/superadmin/dashboard",
  ADMIN: "/admin/dashboard",
  BARBER: "/barbeiro/dashboard",
  CLIENT: "/clientes/dashboard",
};

// Destino do callbackUrl do login com Google. Diferente do login por
// senha, o fluxo OAuth sai da página antes de sabermos o papel do
// usuário — essa página só existe pra esperar a sessão carregar e então
// mandar cada um para o portal certo.
export default function PosLoginPage() {
  return <Suspense fallback={<p>Carregando…</p>}><PosLoginRedirect /></Suspense>;
}

function PosLoginRedirect() {
  const linkedShop = useSearchParams().get("barbearia");
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace(linkedShop ? "/login?barbearia=" + encodeURIComponent(linkedShop) : "/login");
      return;
    }

    const destination = session?.user?.role === "CLIENT" ? clientDestination(session.user.email, linkedShop) : roleRedirect[session?.user?.role ?? ""] ?? "/login";
    router.replace(destination);
  }, [status, session, router, linkedShop]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-white">
      <span className="size-8 animate-spin rounded-full border-2 border-[#e3e5eb] border-t-accent" />
    </main>
  );
}
