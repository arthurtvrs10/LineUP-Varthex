import type { LucideIcon } from "lucide-react";

/**
 * Card de métrica denso, compartilhado pelos quatro painéis.
 *
 * Sem diretiva "use client" de propósito: assim funciona tanto em página
 * server (barbeiro) quanto client (admin, superadmin, cliente), entrando
 * no grafo de quem importar.
 *
 * Densidade: p-4, rótulo 11px, valor 22px. O valor usa tabular-nums:
 * o spec do rebrand exige Archivo + tabular-nums em todo número da
 * interface, constraint global que sobrepõe a preferência local por
 * algarismos proporcionais que este comentário documentava antes.
 */

export type StatTone = "neutro" | "positivo" | "negativo" | "atencao";

const toneText: Record<StatTone, string> = {
  neutro: "text-tertiary",
  positivo: "text-success",
  negativo: "text-danger",
  atencao: "text-warning",
};

const toneIcon: Record<StatTone, { bg: string; color: string }> = {
  neutro: { bg: "bg-surface-sunken", color: "text-secondary" },
  positivo: { bg: "bg-success-subtle", color: "text-success" },
  negativo: { bg: "bg-danger-subtle", color: "text-danger" },
  atencao: { bg: "bg-warning-subtle", color: "text-warning" },
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
  const paleta = toneIcon[tone];

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
        <span className={`grid size-8 shrink-0 place-items-center rounded-[8px] ${paleta.bg}`}>
          <Icon size={16} strokeWidth={1.8} className={paleta.color} />
        </span>
      )}
    </div>
  );
}
