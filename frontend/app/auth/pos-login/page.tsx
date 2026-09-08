"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

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
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    const destination = roleRedirect[session?.user?.role ?? ""] ?? "/clientes/dashboard";
    router.replace(destination);
  }, [status, session, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-white">
      <span className="size-8 animate-spin rounded-full border-2 border-[#e3e5eb] border-t-accent" />
    </main>
  );
}
