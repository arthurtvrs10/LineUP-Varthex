import { AgendamentoFlow } from "./agendamento/AgendamentoFlow";

/** Invólucro fino: o fluxo em si vive em ./agendamento. */
export function AgendamentoPage() {
  return <AgendamentoFlow />;
}
