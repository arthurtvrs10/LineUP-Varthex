import { Clock } from "lucide-react";

/** Aviso compacto pra um bloco de configuração sem backend ainda — evita
 * inputs/toggles que parecem funcionar mas não persistem nada. */
export function EmBreve({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-[10px] border border-dashed border-[#e6e4df] bg-[#f7f6f2] px-4 py-3.5">
      <Clock size={16} strokeWidth={1.8} className="shrink-0 text-[#98a2b3]" />
      <p className="text-xs text-[#5f6f87]">{text}</p>
    </div>
  );
}
