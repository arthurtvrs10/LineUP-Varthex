import type { LucideIcon } from "lucide-react";

/**
 * Card de métrica denso, compartilhado pelos quatro painéis.
 *
 * Sem diretiva "use client" de propósito: assim funciona tanto em página
 * server (barbeiro) quanto client (admin, superadmin, cliente), entrando
 * no grafo de quem importar.
 *
 * Densidade: p-4, rótulo 11px, valor 22px. O valor usa algarismos
 * proporcionais (sem tabular-nums) — números grandes isolados ficam
 * frouxos com largura fixa; tabular só onde alinha em coluna.
 */

export type StatTone = "neutro" | "positivo" | "negativo" | "atencao";

const toneText: Record<StatTone, string> = {
  neutro: "text-[#98a2b3]",
  positivo: "text-[#27865b]",
  negativo: "text-[#c84a4a]",
  atencao: "text-[#d28b27]",
};

const toneIconBg: Record<StatTone, { bg: string; color: string }> = {
  neutro: { bg: "#f7f6f2", color: "#5f6f87" },
  positivo: { bg: "#e8f7f1", color: "#27865b" },
  negativo: { bg: "#fdeaea", color: "#c84a4a" },
  atencao: { bg: "#fdf3e3", color: "#d28b27" },
};

export type StatCardProps = {
  label: string;
  value: string;
  /** Linha de apoio: variação, contexto ou nada. */
  hint?: string;
  /** Colore o hint e o ícone. */
  tone?: StatTone;
  icon?: LucideIcon;
};

export function StatCard({ label, value, hint, tone = "neutro", icon: Icon }: StatCardProps) {
  const paleta = toneIconBg[tone];

  return (
    <div className="flex items-start justify-between gap-3 rounded-[12px] border border-[#e6e4df] bg-white p-4">
      <div className="min-w-0">
        <p className="truncate text-[11px] font-bold uppercase tracking-wide text-[#98a2b3]">
          {label}
        </p>
        <p className="mt-1.5 text-[22px] font-bold leading-none text-[#0d1831]">{value}</p>
        {hint && <p className={`mt-1.5 text-[11px] ${toneText[tone]}`}>{hint}</p>}
      </div>

      {Icon && (
        <span
          className="grid size-8 shrink-0 place-items-center rounded-[8px]"
          style={{ backgroundColor: paleta.bg }}
        >
          <Icon size={16} strokeWidth={1.8} style={{ color: paleta.color }} />
        </span>
      )}
    </div>
  );
}
