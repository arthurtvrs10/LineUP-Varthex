import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft } from "lucide-react";

/**
 * Estado de página inteira pra um módulo fora do MVP (Nível 1) atual —
 * substitui telas com dado mockado por um aviso honesto, em vez de
 * números fabricados que parecem reais.
 */
export function PaginaEmBreve({
  icon: Icon,
  title,
  description,
  voltarHref,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  voltarHref: string;
}) {
  return (
    <div className="flex flex-1 items-center justify-center py-16">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <span className="grid size-14 place-items-center rounded-full bg-[#f7f6f2] text-[#98a2b3]">
          <Icon size={26} strokeWidth={1.6} />
        </span>
        <div>
          <h1 className="text-lg font-bold text-[#0d1831]">{title}</h1>
          <p className="mt-2 text-sm text-[#5f6f87]">{description}</p>
        </div>
        <p className="rounded-full bg-[#fdf3e3] px-3 py-1 text-xs font-semibold text-[#d28b27]">
          Fora do MVP atual — planejado para uma fase futura
        </p>
        <Link
          href={voltarHref}
          className="mt-2 flex items-center gap-1.5 text-sm font-medium text-accent-strong hover:underline"
        >
          <ArrowLeft size={15} strokeWidth={2} />
          Voltar
        </Link>
      </div>
    </div>
  );
}
