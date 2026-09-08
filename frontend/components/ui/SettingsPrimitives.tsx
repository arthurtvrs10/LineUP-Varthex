"use client";

import { useId, useState, type ChangeEvent, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

/**
 * Peças compartilhadas das páginas de Configurações dos quatro portais.
 * Extraídas de SuperAdminConfiguracoesPage para que todos os painéis
 * usem exatamente a mesma anatomia e os mesmos tokens.
 */

export function Toggle({
  defaultOn = false,
  label,
}: {
  defaultOn?: boolean;
  label: string;
}) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => setOn((v) => !v)}
      className={`relative h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors ${
        on ? "bg-accent" : "bg-fog"
      }`}
    >
      <span
        className={`absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-all ${
          on ? "left-[18px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

export function FieldInput({
  label,
  defaultValue,
  value,
  onChange,
  hint,
  type = "text",
  disabled,
}: {
  label: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  hint?: string;
  type?: string;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        type={type}
        disabled={disabled}
        {...(onChange
          ? { value: value ?? "", onChange: (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value) }
          : { defaultValue })}
        className="h-10 rounded-[10px] border border-fog bg-white px-3 text-sm text-ink outline-none transition focus:border-accent disabled:bg-[#f7f6f2] disabled:text-secondary"
      />
      {hint && <p className="text-xs text-secondary">{hint}</p>}
    </div>
  );
}

export function ToggleRow({
  title,
  hint,
  defaultOn = false,
  border = true,
}: {
  title: string;
  hint: string;
  defaultOn?: boolean;
  border?: boolean;
}) {
  return (
    <div className={`flex items-center gap-6 py-3 ${border ? "border-b border-fog" : ""}`}>
      <div className="flex-1">
        <p className="text-sm font-medium text-ink">{title}</p>
        <p className="pt-0.5 text-xs text-secondary">{hint}</p>
      </div>
      <Toggle defaultOn={defaultOn} label={title} />
    </div>
  );
}

export function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex w-full flex-col rounded-[12px] border border-fog bg-white p-6">
      <div className="flex items-center gap-3 border-b border-fog pb-3">
        <span className="grid size-8 place-items-center rounded-[8px] bg-accent-subtle">
          <Icon size={16} strokeWidth={1.8} className="text-accent-strong" />
        </span>
        <h2 className="text-sm font-bold tracking-[-0.28px] text-ink">{title}</h2>
      </div>
      <div className="flex flex-col gap-4 pt-5">{children}</div>
    </section>
  );
}

export function SaveBar() {
  return (
    <div className="flex justify-end">
      <button
        type="button"
        className="flex h-10 items-center gap-2 rounded-[10px] bg-accent px-4 text-sm font-medium text-on-accent transition hover:bg-accent-hover"
      >
        Salvar alterações
      </button>
    </div>
  );
}
