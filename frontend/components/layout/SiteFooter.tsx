import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

type SiteFooterProps = {
  simple?: boolean;
};

function MadeByLineup() {
  return (
    <span className="flex items-center gap-1.5 whitespace-nowrap">
      Desenvolvido pela
      <Image
        src="/brand/varthex-b-brandmark-color.svg"
        alt=""
        width={14}
        height={14}
        aria-hidden="true"
      />
      <strong className="font-semibold text-[#4e5d73]">LINEUP</strong>
    </span>
  );
}

export function SiteFooter({ simple = false }: SiteFooterProps) {
  if (simple) {
    return (
      <footer className="mx-auto flex w-full max-w-[1216px] flex-col items-center gap-4 border-t border-[#e2e7f0] px-5 py-7 text-[11px] text-[#8d97a7] sm:flex-row sm:justify-between sm:px-6">
        <p>© {new Date().getFullYear()} LINEUP</p>
        <div className="flex items-center gap-7">
          <Link href="/privacidade">Privacidade</Link>
          <Link href="/termos">Termos de uso</Link>
        </div>
        <MadeByLineup />
      </footer>
    );
  }

  return (
    <footer className="mt-16 grid gap-10 border-t border-[#e2e7f0] pt-10 sm:grid-cols-2 lg:mt-20 lg:grid-cols-[1.4fr_0.7fr_0.7fr_0.7fr]">
      <Logo variant="horizontal" height={28} className="text-ink" />
      <div className="grid content-start gap-3 text-[11px] text-[#647186]">
        <strong className="mb-1 text-[13px] font-bold text-[#0d1831]">Produto</strong>
        <Link href="/#recursos">Recursos</Link>
        <Link href="/#publicos">Para quem</Link>
        <Link href="/#planos">Planos</Link>
      </div>
      <div className="grid content-start gap-3 text-[11px] text-[#647186]">
        <strong className="mb-1 text-[13px] font-bold text-[#0d1831]">Empresa</strong>
        <Link href="/sobre-nos">Sobre a LINEUP</Link>
        <Link href="/#contato">Contato</Link>
        <Link href="/#faq">Ajuda</Link>
      </div>
      <div className="grid content-start gap-3 text-[11px] text-[#647186]">
        <strong className="mb-1 text-[13px] font-bold text-[#0d1831]">Legal</strong>
        <Link href="/privacidade">Privacidade</Link>
        <Link href="/termos">Termos de uso</Link>
      </div>
      <div className="flex flex-col gap-3 border-t border-[#eef0f4] pt-6 text-[10px] text-[#8d97a7] sm:col-span-2 sm:flex-row sm:items-center sm:justify-between lg:col-span-4">
        <small>
          © {new Date().getFullYear()} LINEUP. Todos os direitos reservados.
        </small>
        <MadeByLineup />
      </div>
    </footer>
  );
}
