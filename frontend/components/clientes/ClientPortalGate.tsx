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
  const accountPage = pathname.startsWith("/clientes/configuracoes") || pathname === "/clientes/ajuda";
  useEffect(() => {
    if (!picker && !accountPage && !loading && !error && !shop) router.replace("/clientes/barbearias");
  }, [picker, accountPage, loading, error, shop, router]);
  if (picker || accountPage) return <>{children}</>;
  if (loading || (!shop && !error)) return <div role="status" className="flex justify-center py-24"><span className="size-8 animate-spin rounded-full border-2 border-[#e6e4df] border-t-accent" /><span className="sr-only">Carregando…</span></div>;
  if (error || customer?.status === "ARCHIVED") return <div className="rounded-[12px] border border-[#e6e4df] bg-white p-8 text-center">
    <p role="alert" className="text-sm text-[#5f6f87]">{error ?? "Seu cadastro nesta barbearia está arquivado. Entre em contato com ela ou escolha outra."}</p>
    <button onClick={reload} className="mt-4 mr-4 text-sm font-semibold text-accent-strong">Tentar novamente</button>
    <Link href="/clientes/configuracoes" className="text-sm font-semibold text-accent-strong">Abrir configurações</Link>
  </div>;
  if (!customer && pathname !== "/clientes/agendamento") return <div className="rounded-[12px] border border-[#e6e4df] bg-white p-8 text-center">
    <h1 className="text-xl font-semibold text-[#0d1831]">Tudo pronto para seu primeiro agendamento</h1>
    <p className="mt-2 text-sm text-[#5f6f87]">Você escolheu {shop?.name}. Ao confirmar um horário, seu vínculo será criado automaticamente.</p>
    <Link href="/clientes/agendamento" className="mt-6 inline-block rounded-[10px] bg-accent px-5 py-3 text-sm font-semibold text-on-accent">Agendar horário</Link>
  </div>;
  return <>{children}</>;
}
