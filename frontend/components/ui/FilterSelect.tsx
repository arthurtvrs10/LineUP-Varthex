"use client";

import { useId } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Filtro das listagens.
 *
 * É um <select> nativo estilizado, não um listbox à mão: teclado,
 * picker nativo no mobile e semântica de acessibilidade vêm prontos.
 * A seta é decorativa (`pointer-events-none`) para não roubar o clique.
 */
export function FilterSelect({
  label,
  options,
  value,
  onChange,
  className = "",
}: {
  /** Rótulo acessível; a primeira opção é o texto visível quando nada foi filtrado. */
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  const id = useId();
  const filtrando = value !== options[0];

  return (
    <div className={`relative ${className}`}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-10 w-full cursor-pointer appearance-none rounded-[10px] border bg-white py-0 pl-3.5 pr-9 text-sm outline-none transition focus:border-[#7247f3] ${
          filtrando ? "font-medium" : ""
        }`}
        /* Cor via `style`: em <select> as utilities de cor do Tailwind não
           estavam vencendo (verificado — a classe aplicava, a cor computada
           continuava neutra). Inline é determinístico e é o mesmo padrão
           que o StatCard usa para cor dinâmica. */
        style={{
          borderColor: filtrando ? "#7247f3" : "#e6e4df",
          color: filtrando ? "#7247f3" : "#0d1831",
        }}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        strokeWidth={2}
        aria-hidden="true"
        className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 ${
          filtrando ? "text-[#7247f3]" : "text-[#98a2b3]"
        }`}
      />
    </div>
  );
}
