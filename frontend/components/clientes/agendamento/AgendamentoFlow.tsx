"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Toast, useToast } from "@/components/ui/Toast";
import { PassoServico } from "./PassoServico";
import { PassoProfissional } from "./PassoProfissional";
import { PassoDataHora } from "./PassoDataHora";
import { PassoConfirmacao } from "./PassoConfirmacao";
import { selecaoVazia, type Selecao } from "./dados";

const PASSOS = ["Serviço", "Profissional", "Data e hora", "Confirmar"] as const;

export function AgendamentoFlow() {
  const router = useRouter();
  const toast = useToast();
  const [passo, setPasso] = useState(0);
  const [selecao, setSelecao] = useState<Selecao>(selecaoVazia);

  /**
   * Data-base criada uma vez, no cliente. Se fosse gerada durante a
   * renderização, servidor e cliente poderiam cair em dias diferentes
   * e a hidratação quebraria.
   */
  const [hoje] = useState(() => new Date());

  /** Cada passo só libera o "Continuar" quando tem o que precisa. */
  const completo = [
    selecao.servico !== null,
    selecao.profissional !== null,
    selecao.dia !== null && selecao.horario !== null,
    true,
  ];

  const ultimo = passo === PASSOS.length - 1;

  function avancar() {
    if (!completo[passo]) return;
    if (ultimo) {
      // Sem backend: a chamada de API entra aqui.
      toast.mostrar("Agendamento confirmado! Você recebe a confirmação no WhatsApp.");
      setTimeout(() => router.push("/clientes/dashboard"), 1200);
      return;
    }
    setPasso((p) => p + 1);
  }

  function voltar() {
    if (passo === 0) {
      router.push("/clientes/dashboard");
      return;
    }
    setPasso((p) => p - 1);
  }

  return (
    /* pb-28 abre espaço para o rodapé fixo não cobrir o conteúdo. */
    <div className="flex flex-col gap-5 pb-28">
      <div>
        <h1 className="text-[22px] font-bold text-[#0d1831]">Novo agendamento</h1>
        <p className="mt-0.5 text-sm text-[#5f6f87]">
          Passo {passo + 1} de {PASSOS.length} · {PASSOS[passo]}
        </p>
      </div>

      {/* Passos concluídos voltam a ser clicáveis, para trocar sem recomeçar. */}
      <ol className="flex items-center gap-1.5" aria-label="Progresso do agendamento">
        {PASSOS.map((nome, i) => {
          const concluido = i < passo;
          const atual = i === passo;
          return (
            <li key={nome} className="flex-1">
              <button
                type="button"
                disabled={i > passo}
                aria-current={atual ? "step" : undefined}
                onClick={() => setPasso(i)}
                /* min-h-11 + py: o rótulo é pequeno, mas o passo concluído
                   é clicável — o alvo precisa dos 44px. */
                className="flex min-h-11 w-full flex-col justify-center gap-1.5 py-2 text-left disabled:cursor-default"
              >
                <span
                  className={`h-1 w-full rounded-full transition ${
                    concluido || atual ? "bg-accent" : "bg-[#eef0f3]"
                  }`}
                />
                <span
                  className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide ${
                    atual ? "text-accent-strong" : concluido ? "text-[#5f6f87]" : "text-[#98a2b3]"
                  }`}
                >
                  {concluido && <Check size={10} strokeWidth={3} />}
                  <span className="truncate">{nome}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div>
        {passo === 0 && (
          <PassoServico
            selecionado={selecao.servico}
            onSelecionar={(servico) => setSelecao((s) => ({ ...s, servico }))}
          />
        )}
        {passo === 1 && (
          <PassoProfissional
            selecionado={selecao.profissional}
            onSelecionar={(profissional) => setSelecao((s) => ({ ...s, profissional }))}
          />
        )}
        {passo === 2 && (
          <PassoDataHora
            hoje={hoje}
            dia={selecao.dia}
            horario={selecao.horario}
            /* Trocar de dia zera o horário: o escolhido pode estar ocupado no novo dia. */
            onSelecionarDia={(dia) => setSelecao((s) => ({ ...s, dia, horario: null }))}
            onSelecionarHorario={(horario) => setSelecao((s) => ({ ...s, horario }))}
          />
        )}
        {passo === 3 && <PassoConfirmacao selecao={selecao} />}
      </div>

      {/* Rodapé fixo: o CTA fica sempre no alcance do polegar, sem rolar
          até o fim de uma lista longa. */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#e6e4df] bg-white/95 px-4 py-3 backdrop-blur lg:pl-[calc(15rem+1.75rem)] lg:pr-7">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={voltar}
            className="flex h-12 items-center gap-2 rounded-[10px] border border-[#e6e4df] px-4 text-sm font-medium text-[#5f6f87] transition hover:bg-[#f7f6f2] hover:text-[#0d1831]"
          >
            <ArrowLeft size={16} strokeWidth={2} />
            Voltar
          </button>
          <button
            type="button"
            onClick={avancar}
            disabled={!completo[passo]}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-[10px] bg-accent text-sm font-bold text-on-accent transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            {ultimo ? "Confirmar agendamento" : "Continuar"}
            {!ultimo && <ArrowRight size={16} strokeWidth={2} />}
          </button>
        </div>
      </div>

      <Toast mensagem={toast.mensagem} tone={toast.tone} onClose={toast.fechar} />
    </div>
  );
}
