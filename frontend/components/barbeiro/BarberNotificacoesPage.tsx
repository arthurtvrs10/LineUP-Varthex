import { Bell } from "lucide-react";

export function BarberNotificacoesPage() {
  return (
    <div className="flex flex-col items-center justify-center rounded-[12px] border border-dashed border-[#e6e4df] bg-white px-8 py-24 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-subtle">
        <Bell className="h-6 w-6 text-accent-strong" />
      </div>
      <h1 className="mt-5 text-xl font-semibold text-[#0d1831]">Notificações</h1>
      <p className="mt-2 max-w-md text-sm text-[#98a2b3]">
        Este recurso ainda está em desenvolvimento. Em breve você poderá acompanhar e configurar
        aqui suas notificações.
      </p>
    </div>
  );
}
