"use client";

import { useRouter, usePathname } from "next/navigation";
import { signIn } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { Check, LayoutGrid, Loader2, Scissors, ShieldCheck, Store, UserRound, X } from "lucide-react";
import { Toast, useToast } from "@/components/ui/Toast";

/**
 * ────────────────────────────────────────────────────────────────
 *  AID DE DEMONSTRAÇÃO — não é um recurso de produto.
 *
 *  Atalho pra trocar de portal ao apresentar o sistema: cada opção
 *  faz login de verdade com a conta de teste daquele papel (senha
 *  compartilhada abaixo), não é só navegação. Num produto real um
 *  admin não "vira" cliente — a troca de papel deve respeitar
 *  permissão de verdade. Para esconder em produção, basta deixar de
 *  montar este componente nos Shells (ou envolver o return num
 *  guard de ambiente) — ele é o único ponto a mudar.
 * ────────────────────────────────────────────────────────────────
 */

const SENHA_DEMO = "admin123";

type Portal = {
  label: string;
  descricao: string;
  href: string;
  prefixo: string;
  email: string;
  icon: typeof Store;
};

const portais: Portal[] = [
  {
    label: "Super Admin",
    descricao: "Plataforma",
    href: "/superadmin/dashboard",
    prefixo: "/superadmin",
    email: "superadmin@gmail.com",
    icon: ShieldCheck,
  },
  {
    label: "Admin",
    descricao: "Barbearia",
    href: "/admin/dashboard",
    prefixo: "/admin",
    email: "admin@gmail.com",
    icon: Store,
  },
  {
    label: "Barbeiro",
    descricao: "Profissional",
    href: "/barbeiro/dashboard",
    prefixo: "/barbeiro",
    email: "barbeiro@gmail.com",
    icon: Scissors,
  },
  {
    label: "Cliente",
    descricao: "Minha área",
    href: "/clientes/dashboard",
    prefixo: "/clientes",
    email: "cliente@gmail.com",
    icon: UserRound,
  },
];

export function PortalSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [trocando, setTrocando] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const toast = useToast();

  const atual = portais.find((p) => pathname?.startsWith(p.prefixo));

  async function trocarPara(portal: Portal) {
    if (portal.prefixo === atual?.prefixo) {
      setOpen(false);
      return;
    }

    setTrocando(portal.prefixo);
    try {
      const result = await signIn("credentials", {
        email: portal.email,
        password: SENHA_DEMO,
        redirect: false,
      });

      if (!result || result.error) {
        toast.mostrar(`Não consegui logar como ${portal.label} (${portal.email}).`, "erro");
        return;
      }

      setOpen(false);
      router.push(portal.href);
    } finally {
      setTrocando(null);
    }
  }

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={ref} className="fixed right-4 top-1/2 z-40 -translate-y-1/2">
      {open && (
        <div
          role="menu"
          aria-label="Trocar de painel"
          className="absolute right-0 top-1/2 w-60 -translate-y-1/2 overflow-hidden rounded-[12px] border border-[#e6e4df] bg-white shadow-[0_12px_32px_rgba(13,24,49,0.14)]"
        >
          <div className="flex items-center justify-between border-b border-[#eef0f3] px-3.5 py-2.5">
            <div>
              <p className="text-[13px] font-bold text-[#0d1831]">Trocar de painel</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#98a2b3]">
                Modo demonstração
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar seletor de painel"
              className="grid size-6 place-items-center rounded-[6px] text-[#98a2b3] transition hover:bg-[#f7f6f2] hover:text-[#0d1831]"
            >
              <X size={14} strokeWidth={2} />
            </button>
          </div>

          <ul className="p-1.5">
            {portais.map((portal) => {
              const Icon = portal.icon;
              const ativo = portal.prefixo === atual?.prefixo;
              const carregando = trocando === portal.prefixo;
              return (
                <li key={portal.prefixo}>
                  <button
                    type="button"
                    role="menuitem"
                    aria-current={ativo ? "page" : undefined}
                    disabled={carregando}
                    onClick={() => trocarPara(portal)}
                    className={`flex w-full items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-left transition disabled:cursor-wait ${
                      ativo ? "bg-accent-subtle" : "hover:bg-[#f7f6f2]"
                    }`}
                  >
                    <span
                      className={`grid size-7 shrink-0 place-items-center rounded-[7px] ${
                        ativo ? "bg-accent text-on-accent" : "bg-[#f0efea] text-[#5f6f87]"
                      }`}
                    >
                      {carregando ? (
                        <Loader2 size={15} strokeWidth={1.8} className="animate-spin" />
                      ) : (
                        <Icon size={15} strokeWidth={1.8} />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate text-[13px] font-bold ${
                          ativo ? "text-accent-strong" : "text-[#0d1831]"
                        }`}
                      >
                        {portal.label}
                      </span>
                      <span className="block truncate text-[11px] text-[#98a2b3]">
                        {carregando ? "Entrando…" : portal.descricao}
                      </span>
                    </span>
                    {ativo && <Check size={14} strokeWidth={2.5} className="shrink-0 text-accent-strong" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        title={atual ? `Painel ${atual.label} — trocar` : "Trocar de painel"}
        className={`grid size-11 place-items-center rounded-full border border-[#e6e4df] bg-white text-[#5f6f87] shadow-[0_6px_20px_rgba(13,24,49,0.12)] transition hover:text-accent-strong ${
          open ? "opacity-0" : "opacity-100"
        }`}
      >
        <LayoutGrid size={19} strokeWidth={1.8} />
        <span className="sr-only">
          {atual ? `Painel atual: ${atual.label}. Trocar de painel` : "Trocar de painel"}
        </span>
      </button>

      <Toast mensagem={toast.mensagem} tone={toast.tone} onClose={toast.fechar} />
    </div>
  );
}
