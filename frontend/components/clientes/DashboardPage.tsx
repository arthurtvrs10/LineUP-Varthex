import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, Gift, MapPin, Scissors, UserRound } from "lucide-react";
import { SaudacaoHeader } from "@/components/layout/SaudacaoHeader";
import { GastosSection } from "./charts/GastosSection";
import {
  brl,
  fidelidade,
  pontosRestantes,
  progressoFidelidade,
  proximoAgendamento,
} from "./dashboardData";

export function DashboardPage() {
  return (
    <div className="flex flex-col gap-5">
      <SaudacaoHeader
        data="Sexta-feira, 14 de agosto"
        nome="Rafael"
        contexto="Barbearia Estilo Único · Unidade Centro"
        acoes={
          <Link
            href="/clientes/agendamento"
            className="flex h-11 items-center gap-2 rounded-[10px] bg-accent px-5 text-sm font-bold text-on-accent transition hover:bg-accent-hover"
          >
            Agendar novo horário
            <ArrowRight size={16} strokeWidth={2.5} />
          </Link>
        }
      />

      <section>
        <h2 className="text-[17px] font-bold text-[#0d1831]">Próximo agendamento</h2>

        <div className="mt-3 rounded-[12px] border border-[#e6e4df] bg-white p-5">
          <div className="flex flex-wrap items-start gap-6">
            <div className="flex items-center gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-[10px] bg-accent-subtle text-accent-strong">
                <CalendarDays size={22} strokeWidth={1.8} />
              </span>
              <div>
                <p className="text-[11px] font-bold tracking-wide text-[#98a2b3]">
                  {proximoAgendamento.diaSemana.toUpperCase()}
                </p>
                <p className="text-xl font-bold text-[#0d1831]">{proximoAgendamento.data}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-[#5f6f87]">
                  <Clock size={13} strokeWidth={2} />
                  {proximoAgendamento.horario}
                </p>
              </div>
            </div>

            <div className="hidden self-stretch border-l border-[#eef0f3] lg:block" />

            <div className="min-w-[200px] flex-1">
              <p className="flex items-center gap-1.5 text-sm font-bold text-[#0d1831]">
                <Scissors size={14} strokeWidth={2} className="text-[#98a2b3]" />
                {proximoAgendamento.servico}
              </p>
              <p className="mt-1 text-xs text-[#98a2b3]">{proximoAgendamento.detalhe}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#5f6f87]">
                <span className="flex items-center gap-1.5">
                  <UserRound size={13} strokeWidth={2} className="text-[#98a2b3]" />
                  {proximoAgendamento.profissional}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} strokeWidth={2} className="text-[#98a2b3]" />
                  {proximoAgendamento.unidade}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3">
              <div className="text-right">
                <p className="text-[11px] font-bold tracking-wide text-[#98a2b3]">VALOR</p>
                <p className="text-xl font-bold text-[#0d1831]">
                  {brl.format(proximoAgendamento.valor)}
                </p>
              </div>
              <Link
                href="/clientes/historico"
                className="rounded-[10px] border border-[#e6e4df] px-4 py-2 text-xs font-bold text-[#5f6f87] transition hover:bg-[#f7f6f2] hover:text-[#0d1831]"
              >
                Ver detalhes
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-[17px] font-bold text-[#0d1831]">Minha fidelidade</h2>

        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[1.6fr_1fr]">
          <div className="rounded-[12px] border border-[#e6e4df] bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#98a2b3]">
                  Pontos acumulados
                </p>
                <p className="mt-1.5 text-[22px] font-bold leading-none text-[#0d1831]">
                  {fidelidade.pontos}
                </p>
              </div>
              <span className="flex items-center gap-2 rounded-full bg-accent-subtle px-3 py-1.5 text-xs font-bold text-accent-strong">
                <Gift size={14} strokeWidth={2} />
                {fidelidade.recompensa}
              </span>
            </div>

            <div className="mt-4">
              <div
                role="progressbar"
                aria-valuenow={fidelidade.pontos}
                aria-valuemin={0}
                aria-valuemax={fidelidade.proximaRecompensaEm}
                aria-label="Progresso para a próxima recompensa"
                className="h-2 w-full overflow-hidden rounded-full bg-[#eef0f3]"
              >
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${progressoFidelidade}%` }}
                />
              </div>
              <div className="mt-2.5 flex items-center justify-between text-xs">
                <p className="font-bold text-[#0d1831]">
                  {pontosRestantes > 0
                    ? `Faltam ${pontosRestantes} pontos para ${fidelidade.recompensa}`
                    : `Recompensa disponível: ${fidelidade.recompensa}`}
                </p>
                <p className="text-[#98a2b3]">
                  {fidelidade.pontos} / {fidelidade.proximaRecompensaEm}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[12px] border border-[#e6e4df] bg-white p-5">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#98a2b3]">
              Visitas realizadas
            </p>
            <p className="mt-1.5 text-[22px] font-bold leading-none text-[#0d1831]">
              {fidelidade.visitasTotais}
            </p>
            <p className="mt-1.5 text-[11px] text-[#98a2b3]">
              Desde o seu cadastro.
            </p>
            <Link
              href="/clientes/historico"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-accent-strong transition hover:text-accent"
            >
              Ver histórico completo
              <ArrowRight size={13} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </section>

      <GastosSection />

      <p className="border-t border-[#e6e4df] pt-5 text-[11px] text-[#98a2b3]">
        Valores consolidados a partir do seu histórico de serviços.
      </p>
    </div>
  );
}
