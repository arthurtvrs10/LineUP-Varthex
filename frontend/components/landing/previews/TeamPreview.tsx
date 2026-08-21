import { WalletCards } from "lucide-react";
import { Avatar, ProductFrame } from "./ProductFrame";

const professionals = [
  { initials: "DS", name: "Diego Santos", visits: "42", occupancy: "91%", commission: "R$ 2.680", tone: "violet" as const },
  { initials: "JM", name: "João Martins", visits: "35", occupancy: "84%", commission: "R$ 2.140", tone: "gold" as const },
  { initials: "RM", name: "Rafael Moraes", visits: "29", occupancy: "78%", commission: "R$ 1.730", tone: "green" as const },
  { initials: "LC", name: "Lucas Costa", visits: "20", occupancy: "71%", commission: "R$ 1.026", tone: "blue" as const },
];

export function TeamPreview() {
  return (
    <ProductFrame
      active="Equipe"
      eyebrow="EQUIPE"
      title="Desempenho dos profissionais"
      action="+ Adicionar profissional"
    >
      <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {[
          ["ATENDIMENTOS", "126", "Este mês"],
          ["RECEITA DA EQUIPE", "R$ 18.940", "+8,4%"],
          ["COMISSÕES", "R$ 7.576", "Calculadas"],
        ].map(([label, value, detail]) => (
          <article className="grid min-h-[90px] gap-1 rounded-xl border border-[#e8ebf1] p-4" key={label}>
            <small className="text-[7px] font-extrabold tracking-[0.08em] text-[#9da5b3]">{label}</small>
            <strong className="text-lg">{value}</strong>
            <span className="text-[7px] text-[#1fa87a]">{detail}</span>
          </article>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-[#e8ebf1]">
        <div className="hidden min-h-10 grid-cols-[1.5fr_0.8fr_1fr_0.8fr] items-center gap-3 bg-[#fafbfc] px-4 text-[6px] font-extrabold tracking-[0.07em] text-[#9da5b2] sm:grid">
          <span>PROFISSIONAL</span><span>ATENDIMENTOS</span><span>OCUPAÇÃO</span><span>COMISSÃO</span>
        </div>
        {professionals.map((professional) => (
          <div
            className="grid min-h-[64px] grid-cols-[1fr_auto] items-center gap-3 border-b border-[#edf0f4] px-4 text-[8px] text-[#697487] last:border-0 sm:grid-cols-[1.5fr_0.8fr_1fr_0.8fr]"
            key={professional.name}
          >
            <span className="flex items-center gap-2.5 text-[#0d1831]">
              <Avatar initials={professional.initials} tone={professional.tone} />
              <b>{professional.name}</b>
            </span>
            <span className="hidden sm:block">{professional.visits}</span>
            <span className="hidden items-center sm:flex">
              <i className="mr-2 h-1.5 w-14 overflow-hidden rounded-full bg-[#eceef3]">
                <i
                  className="block h-full rounded-full bg-[#7247f3]"
                  style={{ width: professional.occupancy }}
                />
              </i>
              {professional.occupancy}
            </span>
            <strong>{professional.commission}</strong>
          </div>
        ))}
      </div>

      <aside className="absolute right-6 bottom-5 hidden w-[330px] grid-cols-[38px_1fr] items-center gap-x-2.5 gap-y-1.5 rounded-2xl border border-[#e0e4ed] bg-white/95 p-5 shadow-[0_22px_60px_rgba(32,34,66,0.16)] backdrop-blur-xl lg:grid">
        <span className="row-span-2 grid size-8 place-items-center rounded-lg bg-[#fff2d7] text-[#aa6b06]">
          <WalletCards size={18} />
        </span>
        <small className="text-[7px] font-extrabold tracking-[0.08em] text-[#9da5b3]">COMISSÃO CALCULADA</small>
        <strong className="text-base">R$ 2.680,00</strong>
        <p className="col-start-2 m-0 text-[9px] text-[#838c9a]">42 atendimentos · Diego Santos</p>
        <div className="col-start-2 mt-2 h-1.5 overflow-hidden rounded-full bg-[#eceef3]">
          <i className="block h-full w-4/5 rounded-full bg-gradient-to-r from-[#d6a34a] to-[#edc979]" />
        </div>
      </aside>
    </ProductFrame>
  );
}
