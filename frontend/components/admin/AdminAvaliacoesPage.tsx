"use client";

import { Star, MessageSquare } from "lucide-react";

const metrics = [
  { label: "Nota média", value: "4.5" },
  { label: "Total de avaliações", value: "4" },
  { label: "5 estrelas", value: "50%" },
  { label: "Respondidas", value: "25%" },
];

const distribution = [
  { stars: 5, count: 2, percent: 50 },
  { stars: 4, count: 2, percent: 50 },
  { stars: 3, count: 0, percent: 0 },
  { stars: 2, count: 0, percent: 0 },
  { stars: 1, count: 0, percent: 0 },
];

type BarberRating = {
  initials: string;
  name: string;
  rating: number;
  count: number;
  percent: number;
};

const byBarber: BarberRating[] = [
  { initials: "LO", name: "Lucas Oliveira", rating: 5.0, count: 2, percent: 100 },
  { initials: "GS", name: "Gabriel Santos", rating: 4.0, count: 1, percent: 80 },
  { initials: "FC", name: "Felipe Cardoso", rating: 4.0, count: 1, percent: 80 },
];

type Review = {
  initials: string;
  name: string;
  barbeiro: string;
  date: string;
  rating: number;
  text: string;
  reply?: string;
};

const reviews: Review[] = [
  {
    initials: "JS",
    name: "João Silva",
    barbeiro: "Lucas Oliveira",
    date: "05/08/2026",
    rating: 5,
    text: "Serviço impecável, como sempre. Lucas é muito habilidoso e atencioso.",
  },
  {
    initials: "TP",
    name: "Thiago Pereira",
    barbeiro: "Gabriel Santos",
    date: "01/08/2026",
    rating: 4,
    text: "Ótimo atendimento, o ambiente é muito agradável. Recomendo!",
    reply: "Obrigado pelo feedback, Thiago! Até a próxima visita.",
  },
  {
    initials: "RC",
    name: "Rafael Costa",
    barbeiro: "Lucas Oliveira",
    date: "28/07/2026",
    rating: 5,
    text: "Sempre saio daqui satisfeito. Melhor barbearia da região!",
  },
  {
    initials: "DM",
    name: "Diego Martins",
    barbeiro: "Felipe Cardoso",
    date: "22/07/2026",
    rating: 4,
    text: "Muito profissional e pontual.",
  },
];

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          strokeWidth={1.8}
          className={i < rating ? "fill-[#c8a86b] text-[#c8a86b]" : "text-[#e6e4df]"}
        />
      ))}
    </div>
  );
}

export function AdminAvaliacoesPage() {
  return (
    <div className="flex w-full flex-col items-start">
      <div>
        <h1 className="font-['Manrope',sans-serif] text-2xl font-bold tracking-[-0.48px] text-[#0d1831]">
          Avaliações
        </h1>
        <p className="pt-0.5 text-sm text-[#686a73]">Reputação e feedback dos clientes</p>
      </div>

      <div className="grid w-full grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-[12px] border border-[#e6e4df] bg-white p-5">
            <p className="text-sm text-[#686a73]">{metric.label}</p>
            <p className="pt-1 font-['Manrope',sans-serif] text-2xl font-bold text-[#0d1831]">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
        <div className="rounded-[12px] border border-[#e6e4df] bg-white p-5">
          <p className="text-sm font-semibold text-[#0d1831]">Distribuição de notas</p>
          <div className="flex flex-col gap-3 pt-4">
            {distribution.map((row) => (
              <div key={row.stars} className="flex items-center gap-3">
                <span className="flex w-4 items-center gap-1 text-sm text-[#686a73]">{row.stars}</span>
                <Star size={13} strokeWidth={1.8} className="fill-[#c8a86b] text-[#c8a86b]" />
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#f0efea]">
                  <div className="h-full rounded-full bg-[#c8a86b]" style={{ width: `${row.percent}%` }} />
                </div>
                <span className="w-4 text-right text-sm text-[#686a73]">{row.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-2 rounded-[12px] border border-[#e6e4df] bg-white p-5">
          <p className="text-sm font-semibold text-[#0d1831]">Por profissional</p>
          <div className="flex flex-col gap-4 pt-4">
            {byBarber.map((b) => (
              <div key={b.name}>
                <div className="flex items-center gap-3">
                  <span className="grid size-8 place-items-center rounded-full bg-[#ede9fd] text-xs font-semibold text-[#7247f3]">
                    {b.initials}
                  </span>
                  <p className="flex-1 text-sm font-medium text-[#0d1831]">{b.name}</p>
                  <StarRow rating={Math.round(b.rating)} />
                  <span className="text-sm text-[#686a73]">
                    {b.rating.toFixed(1)} ({b.count})
                  </span>
                </div>
                <div className="mt-2 ml-11 h-1.5 overflow-hidden rounded-full bg-[#f0efea]">
                  <div className="h-full rounded-full bg-[#7247f3]" style={{ width: `${b.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full pt-8">
        <h2 className="text-lg font-semibold text-[#0d1831]">Avaliações recentes</h2>
        <div className="flex flex-col gap-4 pt-4">
          {reviews.map((review) => (
            <div key={`${review.name}-${review.date}`} className="rounded-[12px] border border-[#e6e4df] bg-white p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-full bg-[#ede9fd] text-sm font-semibold text-[#7247f3]">
                    {review.initials}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[#0d1831]">{review.name}</p>
                    <p className="text-xs text-[#686a73]">
                      {review.barbeiro} · {review.date}
                    </p>
                  </div>
                </div>
                <StarRow rating={review.rating} size={15} />
              </div>
              <p className="pt-3 text-sm text-[#0d1831]">{review.text}</p>

              {review.reply ? (
                <div className="mt-4 rounded-[10px] border-l-2 border-[#7247f3] bg-[#ede9fd] p-4">
                  <p className="text-xs font-semibold text-[#7247f3]">Resposta da barbearia</p>
                  <p className="pt-1 text-sm text-[#0d1831]">{review.reply}</p>
                </div>
              ) : (
                <button
                  type="button"
                  className="mt-4 flex items-center gap-2 rounded-[8px] border border-[#e6e4df] bg-white px-3 py-1.5 text-sm font-medium text-[#0d1831] transition hover:bg-[#f7f6f2]"
                >
                  <MessageSquare size={14} strokeWidth={1.8} />
                  Responder
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
