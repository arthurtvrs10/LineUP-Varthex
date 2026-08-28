"use client";

import { CalendarDays, Clock, MapPin, Scissors, UserRound } from "lucide-react";
import { brl, type Selecao } from "./dados";

function Linha({
  icone,
  rotulo,
  valor,
}: {
  icone: React.ReactNode;
  rotulo: string;
  valor: string;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-[#eef0f3] py-3 last:border-none">
      <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-[8px] bg-[#f7f6f2] text-[#5f6f87]">
        {icone}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#98a2b3]">{rotulo}</p>
        <p className="mt-0.5 text-sm font-bold text-[#0d1831]">{valor}</p>
      </div>
    </div>
  );
}

export function PassoConfirmacao({ selecao }: { selecao: Selecao }) {
  const { servico, profissional, dia, horario } = selecao;
  if (!servico || !profissional || !dia || !horario) return null;

  const fim = (() => {
    const [h, m] = horario.split(":").map(Number);
    const total = h * 60 + m + servico.duracaoMin;
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  })();

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-[12px] border border-[#e6e4df] bg-white p-5">
        <Linha
          icone={<Scissors size={14} strokeWidth={1.8} />}
          rotulo="Serviço"
          valor={servico.nome}
        />
        <Linha
          icone={<UserRound size={14} strokeWidth={1.8} />}
          rotulo="Profissional"
          valor={profissional.nome}
        />
        <Linha
          icone={<CalendarDays size={14} strokeWidth={1.8} />}
          rotulo="Data"
          valor={`${dia.diaSemana} · ${dia.diaMes} de ${dia.mesCurto}`}
        />
        <Linha
          icone={<Clock size={14} strokeWidth={1.8} />}
          rotulo="Horário"
          valor={`${horario} — ${fim} · ${servico.duracaoMin} min`}
        />
        <Linha
          icone={<MapPin size={14} strokeWidth={1.8} />}
          rotulo="Unidade"
          valor="Barbearia Estilo Único — Centro"
        />
      </div>

      <div className="flex items-center justify-between rounded-[12px] border border-[#e6e4df] bg-[#f7f6f2] px-5 py-4">
        <span className="text-sm text-[#5f6f87]">Total</span>
        <span className="text-xl font-bold text-[#0d1831]">{brl.format(servico.preco)}</span>
      </div>

      <p className="text-xs text-[#98a2b3]">
        O pagamento é feito na barbearia. Você pode cancelar até 12h antes pelo histórico.
      </p>
    </div>
  );
}
