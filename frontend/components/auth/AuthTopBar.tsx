import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

// Sobreposição branca no topo das telas de auth (login/cadastro/esqueceu a
// senha): o resto da página herda o cinza-claro global (surface-sunken), e
// esta faixa branca — igual o footer, de propósito — se destaca por cima
// dele, no mesmo espírito do SiteHeader do site institucional.
export function AuthTopBar() {
  return (
    <header className="border-b border-[#eaecf0] bg-white">
      <div className="mx-auto flex h-[76px] w-full max-w-[1216px] items-center gap-4 px-5 sm:px-6">
        <Link
          href="/"
          aria-label="Voltar para o menu"
          className="grid size-10 shrink-0 place-items-center rounded-full border border-[#d9dce5] text-[#4b5468] transition hover:border-[#b8bdcd] hover:text-[#1c1c26]"
        >
          <ChevronLeft size={18} strokeWidth={2} />
        </Link>
        <Link href="/" aria-label="LINEUP - Página inicial">
          <Logo variant="horizontal" height={26} className="text-ink" />
        </Link>
      </div>
    </header>
  );
}
