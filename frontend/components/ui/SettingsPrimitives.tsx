"use client";

import { useId, useState, type ReactNode } from "react";
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
        on ? "bg-[#7247f3]" : "bg-[#d4d2cc]"
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
  hint,
  type = "text",
}: {
  label: string;
  defaultValue: string;
  hint?: string;
  type?: string;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-[#0d1831]">
        {label}
      </label>
      <input
        id={id}
        type={type}
        defaultValue={defaultValue}
        className="h-10 rounded-[10px] border border-[#e6e4df] bg-white px-3 text-sm text-[#0d1831] outline-none transition focus:border-[#7247f3]"
      />
      {hint && <p className="text-xs text-[#686a73]">{hint}</p>}
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
    <div className={`flex items-center gap-6 py-3 ${border ? "border-b border-[#e6e4df]" : ""}`}>
      <div className="flex-1">
        <p className="text-sm font-medium text-[#0d1831]">{title}</p>
        <p className="pt-0.5 text-xs text-[#686a73]">{hint}</p>
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
    <section className="flex w-full flex-col rounded-[12px] border border-[#e6e4df] bg-white p-6">
      <div className="flex items-center gap-3 border-b border-[#e6e4df] pb-3">
        <span className="grid size-8 place-items-center rounded-[8px] bg-[#ede9fd]">
          <Icon size={16} strokeWidth={1.8} className="text-[#7247f3]" />
        </span>
        <h2 className="text-sm font-bold tracking-[-0.28px] text-[#0d1831]">{title}</h2>
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
        className="flex h-10 items-center gap-2 rounded-[10px] bg-[#7247f3] px-4 text-sm font-medium text-white transition hover:bg-[#5c2ee0]"
      >
        Salvar alterações
      </button>
    </div>
  );
}
