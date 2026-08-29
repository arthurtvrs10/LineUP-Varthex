import { ArrowRight, MessageCircle } from "lucide-react";
import { Avatar, ProductFrame } from "./ProductFrame";

const clients = [
  { initials: "LM", name: "Lucas Mendes", service: "Corte + barba", visit: "12 ago", next: "Em 5 dias", tone: "violet" as const },
  { initials: "RA", name: "Rafael Almeida", service: "Corte", visit: "08 ago", next: "Hoje", tone: "gold" as const },
  { initials: "BC", name: "Bruno Carvalho", service: "Barba", visit: "01 ago", next: "Atrasado", tone: "green" as const },
  { initials: "GF", name: "Gabriel Ferreira", service: "Combo premium", visit: "28 jul", next: "Atrasado", tone: "blue" as const },
];

export function ClientsPreview() {
  return (
    <ProductFrame
      active="Clientes"
      eyebrow="CLIENTES"
      title="Relacionamento e recorrência"
      action="+ Novo cliente"
    >
      <div className="mt-5 flex gap-1 overflow-x-auto rounded-lg border border-[#e8ebf1] bg-[#fafbfc] p-1 text-[7px] text-[#8992a0]">
        <span className="shrink-0 rounded-md bg-white px-2.5 py-2 text-[#0d1831] shadow-sm">Todos 248</span>
        <span className="shrink-0 px-2.5 py-2">Recorrentes 86</span>
        <span className="shrink-0 px-2.5 py-2">Inativos 24</span>
        <span className="shrink-0 px-2.5 py-2">Aniversariantes 7</span>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-[#e8ebf1]">
        <div className="hidden min-h-10 grid-cols-[1.5fr_1fr_0.8fr_0.8fr] items-center gap-3 bg-[#fafbfc] px-4 text-[6px] font-extrabold tracking-[0.07em] text-[#9da5b2] sm:grid">
          <span>CLIENTE</span><span>ÚLTIMO SERVIÇO</span><span>ÚLTIMA VISITA</span><span>RETORNO</span>
        </div>
        {clients.map((client) => (
          <div
            className="grid min-h-[64px] grid-cols-[1fr_auto] items-center gap-3 border-b border-[#edf0f4] px-4 text-[8px] text-[#697487] last:border-0 sm:grid-cols-[1.5fr_1fr_0.8fr_0.8fr]"
            key={client.name}
          >
            <span className="flex items-center gap-2.5 text-[#0d1831]">
              <Avatar initials={client.initials} tone={client.tone} />
              <b>{client.name}</b>
            </span>
            <span className="hidden sm:block">{client.service}</span>
            <span className="hidden sm:block">{client.visit}</span>
            <strong className={client.next === "Atrasado" ? "text-[#d65454]" : ""}>{client.next}</strong>
          </div>
        ))}
      </div>

      <aside className="absolute right-6 bottom-5 hidden w-[350px] grid-cols-[38px_1fr] items-center gap-x-2.5 gap-y-1.5 rounded-2xl border border-[#e0e4ed] bg-white/95 p-5 shadow-[0_22px_60px_rgba(32,34,66,0.16)] backdrop-blur-xl lg:grid">
        <span className="row-span-2 grid size-8 place-items-center rounded-lg bg-accent-subtle text-accent-strong">
          <MessageCircle size={18} />
        </span>
        <small className="text-[7px] font-extrabold tracking-[0.08em] text-[#9da5b3]">LEMBRETE DE RETORNO</small>
        <strong className="text-sm leading-5">Seu corte está pedindo uma renovada.</strong>
        <p className="col-start-2 m-0 text-[9px] text-[#838c9a]">Mensagem pronta para Rafael Almeida.</p>
        <button className="col-start-2 mt-2 inline-flex w-fit items-center gap-1 rounded-lg bg-[#0d1831] px-3 py-2 text-[9px] font-bold text-white">
          Enviar lembrete <ArrowRight size={13} />
        </button>
      </aside>
    </ProductFrame>
  );
}
