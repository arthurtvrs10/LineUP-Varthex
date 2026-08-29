import { Check, Clock3 } from "lucide-react";
import { ProductFrame } from "./ProductFrame";

const days = ["SEG 18", "TER 19", "QUA 20", "QUI 21", "SEX 22"];
const times = ["09:00", "10:00", "11:00", "12:00", "13:00"];

export function AgendaPreview() {
  return (
    <ProductFrame
      active="Agenda"
      eyebrow="AGENDA"
      title="Semana de 18 a 22 de agosto"
      action="+ Agendar"
    >
      <div className="mt-5 overflow-x-auto">
        <div className="min-w-[650px]">
          <div className="grid h-11 grid-cols-[65px_repeat(5,1fr)] items-center border-y border-[#e8ebf1]">
            <span className="px-2 text-[7px] font-bold text-[#8f98a6]">HORÁRIO</span>
            {days.map((day) => (
              <strong className="px-2 text-[7px] font-bold text-[#8f98a6]" key={day}>
                {day}
              </strong>
            ))}
          </div>

          {times.map((time, row) => (
            <div
              className="grid min-h-[82px] grid-cols-[65px_repeat(5,1fr)] border-b border-[#edf0f4]"
              key={time}
            >
              <time className="m-1.5 border-0 p-2 text-[8px] text-[#939ba8]">{time}</time>
              {days.map((day, column) => {
                const index = (row + column) % 3;
                const booked = index !== 1;
                const tone =
                  index === 0
                    ? "border-[#7247f3]/15 bg-[#f1ecff] text-[#5d39bf]"
                    : index === 1
                      ? "border-[#d6a34a]/20 bg-[#fff2da] text-[#925e0c]"
                      : "border-[#1fa87a]/15 bg-[#e8f8f4] text-[#19785e]";

                return booked ? (
                  <span
                    className={`m-1.5 flex flex-col gap-1 rounded-lg border p-2 ${tone}`}
                    key={day}
                  >
                    <b className="text-[7px]">{["Corte", "Barba", "Combo"][index]}</b>
                    <small className="text-[6px] opacity-75">
                      {["Lucas", "Rafael", "Bruno", "Carlos"][(row + column) % 4]}
                    </small>
                  </span>
                ) : (
                  <span
                    className="m-1.5 rounded-lg border border-dashed border-[#dfe4ec] p-2 text-center text-[6px] text-[#b3bac5]"
                    key={day}
                  >
                    Disponível
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <aside className="absolute right-6 bottom-5 hidden w-[330px] grid-cols-[38px_1fr] items-center gap-x-2.5 gap-y-1.5 rounded-2xl border border-[#e0e4ed] bg-white/95 p-5 shadow-[0_22px_60px_rgba(32,34,66,0.16)] backdrop-blur-xl lg:grid">
        <span className="row-span-2 grid size-8 place-items-center rounded-lg bg-accent-subtle text-accent-strong">
          <Clock3 size={18} />
        </span>
        <small className="text-[7px] font-extrabold tracking-[0.08em] text-[#9da5b3]">
          PRÓXIMO HORÁRIO
        </small>
        <strong className="text-base">10:30 · Rafael Lima</strong>
        <p className="col-start-2 m-0 text-[9px] text-[#838c9a]">Corte tradicional com Diego</p>
        <button className="col-start-2 mt-2 inline-flex w-fit items-center gap-1 rounded-lg bg-[#0d1831] px-3 py-2 text-[9px] font-bold text-white">
          Confirmado <Check size={13} />
        </button>
      </aside>
    </ProductFrame>
  );
}
