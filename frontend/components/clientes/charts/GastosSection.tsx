"use client";

import { useMemo, useState } from "react";
import {
  brl,
  fatiasPorServico,
  periodos,
  serieMensal,
  totalGasto,
  totalVisitas,
  type Periodo,
} from "../dashboardData";
import { GastosMensaisChart } from "./GastosMensaisChart";
import { ServicosDonutChart } from "./ServicosDonutChart";

export function GastosSection() {
  const [periodo, setPeriodo] = useState<Periodo>(6);

  const { fatias, serie, total, visitas, media } = useMemo(() => {
    const total = totalGasto(periodo);
    return {
      fatias: fatiasPorServico(periodo),
      serie: serieMensal(periodo),
      total,
      visitas: totalVisitas(periodo),
      media: total / periodo,
    };
  }, [periodo]);

  return (
    <section>
      {/* Uma única linha de filtro acima de tudo que ela controla —
          nunca um filtro dentro do card de um gráfico. */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-[17px] font-bold text-[#0d1831]">Meus gastos</h2>
          <p className="mt-0.5 text-xs text-[#5f6f87]">
            {visitas} {visitas === 1 ? "visita" : "visitas"} · média de{" "}
            {brl.format(media)} por mês
          </p>
        </div>

        <div
          role="group"
          aria-label="Período"
          className="flex items-center gap-1 rounded-[10px] border border-[#e6e4df] bg-white p-1"
        >
          {periodos.map((item) => {
            const ativo = item.value === periodo;
            return (
              <button
                key={item.value}
                type="button"
                aria-pressed={ativo}
                onClick={() => setPeriodo(item.value)}
                className={`rounded-[7px] px-3 py-1.5 text-xs font-bold transition ${
                  ativo
                    ? "bg-accent text-on-accent"
                    : "text-[#5f6f87] hover:bg-[#f7f6f2] hover:text-[#0d1831]"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-2">
        <div className="min-w-0 rounded-[12px] border border-[#e6e4df] bg-white p-5">
          <h3 className="text-base font-bold text-[#0d1831]">Por serviço</h3>
          <p className="mt-1 text-xs text-[#5f6f87]">
            Como o valor se distribuiu entre os serviços contratados.
          </p>

          <div className="mt-5 grid grid-cols-1 items-center gap-6 sm:grid-cols-[220px_minmax(0,1fr)]">
            <ServicosDonutChart data={fatias} total={total} />

            {/* Esta lista é o "table view": todo valor é legível sem depender
                do tooltip nem da cor — o alívio exigido pelo check de contraste. */}
            <ul className="flex flex-col">
              {fatias.map((fatia) => (
                <li
                  key={fatia.key}
                  className="flex items-center justify-between gap-4 border-b border-[#eef0f3] py-3 last:border-none"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: fatia.color }}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[#0d1831]">{fatia.name}</p>
                      <p className="text-[11px] text-[#98a2b3]">{fatia.subtitle}</p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-[#0d1831]">{brl.format(fatia.value)}</p>
                    <p className="text-[11px] text-[#98a2b3]">{fatia.percent.toFixed(0)}%</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="min-w-0 rounded-[12px] border border-[#e6e4df] bg-white p-5">
          <h3 className="text-base font-bold text-[#0d1831]">Evolução mensal</h3>
          <p className="mt-1 text-xs text-[#5f6f87]">
            Quanto você gastou a cada mês do período. Passe o mouse para ver as visitas.
          </p>
          <div className="mt-5">
            <GastosMensaisChart data={serie} />
          </div>
        </div>
      </div>
    </section>
  );
}
