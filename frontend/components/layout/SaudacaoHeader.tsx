import type { ReactNode } from "react";

/**
 * Cabeçalho de saudação dos painéis: data, "Olá, <nome>" e a linha de
 * contexto (barbearia / plataforma). Extraído do dashboard do admin,
 * que já usava esse padrão, para que os quatro painéis abram igual.
 *
 * `acoes` recebe os controles do topo (filtro de período, CTA) para que
 * fiquem na mesma linha do título em telas largas, em vez de ocupar
 * uma faixa própria.
 */

type SaudacaoHeaderProps = {
  data: string;
  nome: string;
  contexto: string;
  acoes?: ReactNode;
};

export function SaudacaoHeader({ data, nome, contexto, acoes }: SaudacaoHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-sm capitalize text-[#686a73]">{data}</p>
        <h1 className="mt-0.5 flex items-center gap-2 text-[26px] font-bold leading-tight text-[#0d1831]">
          Olá, {nome}
          <span aria-hidden="true">👋</span>
        </h1>
        <p className="mt-0.5 text-sm text-[#5f6f87]">{contexto}</p>
      </div>
      {acoes && <div className="flex items-end gap-3">{acoes}</div>}
    </div>
  );
}
