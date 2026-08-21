import Link from "next/link";
import { Brand } from "@/components/brand/Brand";

type SiteFooterProps = {
  simple?: boolean;
};

export function SiteFooter({ simple = false }: SiteFooterProps) {
  if (simple) {
    return (
      <footer className="mx-auto flex w-full max-w-[1216px] flex-col gap-4 border-t border-[#e2e7f0] px-5 py-7 text-[11px] text-[#8d97a7] sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>© {new Date().getFullYear()} Varthex Barber</p>
        <div className="flex gap-7">
          <Link href="#">Privacidade</Link>
          <Link href="#">Termos de uso</Link>
        </div>
      </footer>
    );
  }

  return (
    <footer className="mt-16 grid gap-10 border-t border-[#e2e7f0] pt-10 sm:grid-cols-2 lg:mt-20 lg:grid-cols-[1.4fr_0.7fr_0.7fr_0.7fr]">
      <Brand />
      <div className="grid content-start gap-3 text-[11px] text-[#647186]">
        <strong className="mb-1 text-[13px] font-bold text-[#0d1831]">Produto</strong>
        <Link href="/#recursos">Recursos</Link>
        <Link href="/#publicos">Para quem</Link>
        <Link href="/#planos">Planos</Link>
      </div>
      <div className="grid content-start gap-3 text-[11px] text-[#647186]">
        <strong className="mb-1 text-[13px] font-bold text-[#0d1831]">Empresa</strong>
        <Link href="/sobre-nos">Sobre a Varthex</Link>
        <Link href="/#contato">Contato</Link>
        <Link href="/#faq">Ajuda</Link>
      </div>
      <div className="grid content-start gap-3 text-[11px] text-[#647186]">
        <strong className="mb-1 text-[13px] font-bold text-[#0d1831]">Legal</strong>
        <Link href="#">Privacidade</Link>
        <Link href="#">Termos de uso</Link>
      </div>
      <small className="text-[10px] text-[#8d97a7] sm:col-span-2 lg:col-span-4">
        © {new Date().getFullYear()} Varthex Barber. Todos os direitos reservados.
      </small>
    </footer>
  );
}
