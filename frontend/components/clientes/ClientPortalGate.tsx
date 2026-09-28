"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMyCustomer } from "./MyCustomerContext";

export function ClientPortalGate({ children }: { children: ReactNode }) {
  const { customer, shop, loading, error, reload } = useMyCustomer();
  const pathname = usePathname();
  const router = useRouter();
  const picker = pathname === "/clientes/barbearias";
  useEffect(() => {
    if (!picker && !loading && !shop) router.replace("/clientes/barbearias");
  }, [picker, loading, shop, router]);
  if (picker) return <>{children}</>;
  if (loading || !shop) return <div role="status" className="flex justify-center py-24"><span className="size-8 animate-spin rounded-full border-2 border-[#e6e4df] border-t-accent" /><span className="sr-only">Carregando…</span></div>;
  if (error || customer?.status === "ARCHIVED") return <div className="rounded-[12px] border border-[#e6e4df] bg-white p-8 text-center">
    <p role="alert" className="text-sm text-[#5f6f87]">{error ?? "Seu cadastro nesta barbearia está arquivado. Entre em contato com ela ou escolha outra."}</p>
    <button onClick={reload} className="mt-4 mr-4 text-sm font-semibold text-accent-strong">Tentar novamente</button>
    <Link href="/clientes/barbearias" className="text-sm font-semibold text-accent-strong">Escolher outra barbearia</Link>
  </div>;
  if (!customer && pathname !== "/clientes/agendamento") return <div className="rounded-[12px] border border-[#e6e4df] bg-white p-8 text-center">
    <h1 className="text-xl font-semibold text-[#0d1831]">Tudo pronto para seu primeiro agendamento</h1>
    <p className="mt-2 text-sm text-[#5f6f87]">Você escolheu {shop.name}. Ao confirmar um horário, seu vínculo será criado automaticamente.</p>
    <Link href="/clientes/agendamento" className="mt-6 inline-block rounded-[10px] bg-accent px-5 py-3 text-sm font-semibold text-on-accent">Agendar horário</Link>
  </div>;
  return <>{children}</>;
}
