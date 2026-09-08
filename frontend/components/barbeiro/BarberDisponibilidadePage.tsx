import { CalendarClock } from "lucide-react";

export function BarberDisponibilidadePage() {
  return (
    <div className="flex flex-col items-center justify-center rounded-[12px] border border-dashed border-[#e6e4df] bg-white px-8 py-24 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-subtle">
        <CalendarClock className="h-6 w-6 text-accent-strong" />
      </div>
      <h1 className="mt-5 text-xl font-semibold text-[#0d1831]">Disponibilidade</h1>
      <p className="mt-2 max-w-md text-sm text-[#98a2b3]">
        Este recurso ainda está em desenvolvimento. Em breve você poderá configurar aqui sua
        jornada de trabalho e exceções (folgas, férias, ausências).
      </p>
    </div>
  );
}
