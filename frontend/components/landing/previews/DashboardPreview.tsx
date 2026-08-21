import { CalendarDays, TrendingUp, WalletCards } from "lucide-react";
import { Avatar, ProductFrame } from "./ProductFrame";

type DashboardPreviewProps = {
  className?: string;
};

const appointments = [
  { time: "09:00", name: "Lucas Mendes", service: "Corte + barba", avatar: "JM" },
  { time: "10:30", name: "Rafael Lima", service: "Corte", avatar: "DS" },
  { time: "11:15", name: "Bruno Alves", service: "Barba", avatar: "RM" },
];

function PerformanceChart() {
  return (
    <div className="relative mt-5 h-[210px]" aria-label="Gráfico ilustrativo de desempenho">
      <div className="absolute inset-x-0 top-2 bottom-7 flex flex-col justify-between">
        {[0, 1, 2, 3].map((line) => (
          <i className="border-t border-dashed border-[#e7eaf0]" key={line} />
        ))}
      </div>
      <svg
        className="relative z-10 h-[175px] w-full overflow-visible"
        viewBox="0 0 620 190"
        role="img"
        aria-label="Crescimento de atendimentos na semana"
      >
        <path
          d="M0 164 C55 150 73 105 126 122 S210 154 265 106 S356 35 406 75 S502 116 620 42 L620 190 L0 190 Z"
          fill="rgba(114, 71, 243, 0.12)"
        />
        <path
          d="M0 164 C55 150 73 105 126 122 S210 154 265 106 S356 35 406 75 S502 116 620 42"
          fill="none"
          stroke="#7247f3"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {[
          [0, 164],
          [126, 122],
          [265, 106],
          [406, 75],
          [620, 42],
        ].map(([x, y]) => (
          <circle
            key={x}
            cx={x}
            cy={y}
            r="5"
            fill="white"
            stroke="#7247f3"
            strokeWidth="3"
          />
        ))}
      </svg>
      <div className="flex justify-between text-[7px] text-[#9aa2af]">
        {['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
    </div>
  );
}

export function DashboardPreview({ className = "" }: DashboardPreviewProps) {
  return (
    <ProductFrame
      eyebrow="VISÃO GERAL"
      title="Bom dia, Arthur."
      action="+ Novo agendamento"
      className={className}
    >
      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <article className="grid min-h-24 grid-cols-[32px_1fr] gap-x-2.5 rounded-xl border border-[#e8ebf1] p-3.5">
          <span className="row-span-2 grid size-8 place-items-center rounded-lg bg-[#eee8ff] text-[#7247f3]">
            <CalendarDays size={17} />
          </span>
          <small className="text-[8px] text-[#838d9d]">Agendamentos hoje</small>
          <strong className="text-xl leading-none">18</strong>
          <em className="col-start-2 text-[7px] text-[#1fa87a] not-italic">
            +12% esta semana
          </em>
        </article>
        <article className="grid min-h-24 grid-cols-[32px_1fr] gap-x-2.5 rounded-xl border border-[#e8ebf1] p-3.5">
          <span className="row-span-2 grid size-8 place-items-center rounded-lg bg-[#fff2d7] text-[#aa6b06]">
            <TrendingUp size={17} />
          </span>
          <small className="text-[8px] text-[#838d9d]">Ocupação da agenda</small>
          <strong className="text-xl leading-none">84%</strong>
          <em className="col-start-2 text-[7px] text-[#1fa87a] not-italic">
            6 horários livres
          </em>
        </article>
        <article className="grid min-h-24 grid-cols-[32px_1fr] gap-x-2.5 rounded-xl border border-[#e8ebf1] p-3.5">
          <span className="row-span-2 grid size-8 place-items-center rounded-lg bg-[#e5f8f1] text-[#1fa87a]">
            <WalletCards size={17} />
          </span>
          <small className="text-[8px] text-[#838d9d]">Receita prevista</small>
          <strong className="text-xl leading-none">R$ 2.480</strong>
          <em className="col-start-2 text-[7px] text-[#1fa87a] not-italic">Hoje</em>
        </article>
      </div>

      <div className="mt-2.5 grid gap-2.5 lg:grid-cols-[1.55fr_0.9fr]">
        <article className="min-w-0 rounded-xl border border-[#e8ebf1] p-3.5">
          <div className="flex items-start justify-between">
            <div className="grid gap-1">
              <small className="text-[7px] font-extrabold tracking-[0.08em] text-[#9da5b3]">
                DESEMPENHO
              </small>
              <strong className="text-[10px]">Atendimentos da semana</strong>
            </div>
            <span className="rounded-md border border-[#e7eaf0] px-2 py-1 text-[7px] text-[#7b8493]">
              Últimos 7 dias
            </span>
          </div>
          <PerformanceChart />
        </article>

        <article className="hidden rounded-xl border border-[#e8ebf1] p-3.5 lg:block">
          <div className="flex items-start justify-between">
            <div className="grid gap-1">
              <small className="text-[7px] font-extrabold tracking-[0.08em] text-[#9da5b3]">
                PRÓXIMOS
              </small>
              <strong className="text-[10px]">Agenda de hoje</strong>
            </div>
            <span className="text-[7px] text-[#7b8493]">Ver agenda</span>
          </div>

          {appointments.map((appointment) => (
            <div
              className="grid min-h-[72px] grid-cols-[34px_28px_1fr_6px] items-center gap-2 border-b border-[#edf0f4] last:border-0"
              key={appointment.time}
            >
              <time className="text-[8px] text-[#737d8c]">{appointment.time}</time>
              <Avatar initials={appointment.avatar} />
              <div className="grid gap-0.5">
                <strong className="text-[8px]">{appointment.name}</strong>
                <small className="text-[7px] text-[#929aa7]">{appointment.service}</small>
              </div>
              <i className="size-1.5 rounded-full bg-[#1fa87a]" />
            </div>
          ))}
        </article>
      </div>
    </ProductFrame>
  );
}
