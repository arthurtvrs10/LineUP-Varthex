"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { ActionLink } from "@/components/ui/ActionLink";

const navLinks = [
  { label: "Recursos", href: "/#recursos" },
  { label: "Para quem", href: "/#publicos" },
  { label: "Planos", href: "/#planos" },
  { label: "Sobre nós", href: "/sobre-nos" },
  { label: "Ajuda", href: "/#faq" },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#e2e7f0] bg-white">
      <div className="relative mx-auto flex h-[76px] w-full max-w-[1216px] items-center gap-10 px-5 sm:px-6">
        <Link href="/" aria-label="LINEUP - Página inicial">
          <Logo variant="horizontal" height={28} className="text-ink" />
        </Link>

        <nav
          className="hidden items-center gap-8 lg:flex"
          aria-label="Navegação principal"
        >
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[13px] font-semibold text-[#4e5d73] transition hover:text-[#0d1831]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-5 lg:flex">
          <Link
            className="text-[13px] font-semibold text-[#4e5d73] transition hover:text-[#0d1831]"
            href="/login"
          >
            Entrar
          </Link>
          <ActionLink href="/cadastro" variant="dark" className="min-h-10 px-4">
            Começar agora
          </ActionLink>
        </div>

        <button
          className="ml-auto grid size-10 place-items-center rounded-xl border border-[#e2e7f0] bg-white text-[#0d1831] lg:hidden"
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>

        {menuOpen && (
          <nav
            className="absolute left-5 right-5 top-[68px] grid gap-1 rounded-xl border border-[#e2e7f0] bg-white p-4 shadow-[0_12px_32px_rgba(33,34,72,0.08)] lg:hidden"
            aria-label="Navegação mobile"
          >
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="border-b border-[#eef0f4] px-2.5 py-3 text-[13px] font-bold text-[#4e5d73]"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="px-2.5 py-3 text-[13px] font-bold text-[#4e5d73]"
            >
              Entrar
            </Link>
            <ActionLink href="/cadastro" className="mt-2 w-full">
              Começar agora
            </ActionLink>
          </nav>
        )}
      </div>
    </header>
  );
}
