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
  neutro: "text-tertiary",
  positivo: "text-success",
  negativo: "text-danger",
  atencao: "text-warning",
};

const toneIconBg: Record<StatTone, { bg: string; color: string }> = {
  neutro: { bg: "var(--color-surface-sunken)", color: "var(--color-secondary)" },
  positivo: { bg: "var(--color-success-subtle)", color: "var(--color-success)" },
  negativo: { bg: "var(--color-danger-subtle)", color: "var(--color-danger)" },
  atencao: { bg: "var(--color-warning-subtle)", color: "var(--color-warning)" },
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
    <div className="flex items-start justify-between gap-3 rounded-[12px] border border-fog bg-white p-4">
      <div className="min-w-0">
        <p className="truncate text-caption uppercase text-tertiary">
          {label}
        </p>
        <p className="mt-1.5 text-h3 font-display tabular-nums leading-none text-ink">{value}</p>
        {hint && <p className={`mt-1.5 text-caption ${toneText[tone]}`}>{hint}</p>}
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
