"use client";

import { useState } from "react";
import { Toast, useToast } from "@/components/ui/Toast";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { NovoClienteModal } from "./modals/CadastroModals";
import { Plus, Search, MoreVertical } from "lucide-react";

type Cliente = {
  initials: string;
  avatarBg: string;
  avatarText: string;
  name: string;
  email: string;
  phone: string;
  lastVisit: string;
  nextAppointment: string;
  totalSpent: string;
  visits: string;
  status: "Ativo" | "Inativo";
};

const clientes: Cliente[] = [
  {
    initials: "JS",
    avatarBg: "bg-[#fbf4e8]",
    avatarText: "text-[#c8a86b]",
    name: "João Silva",
    email: "joao.silva@email.com",
    phone: "(11) 96543-2109",
    lastVisit: "05/08/2026",
    nextAppointment: "15/08/2026",
    totalSpent: "R$ 1.840,00",
    visits: "46x",
    status: "Ativo",
  },
  {
    initials: "MR",
    avatarBg: "bg-[#fdf3e3]",
    avatarText: "text-[#d28b27]",
    name: "Mateus Rodrigues",
    email: "mateus.r@email.com",
    phone: "(11) 95678-1234",
    lastVisit: "20/07/2026",
    nextAppointment: "—",
    totalSpent: "R$ 640,00",
    visits: "16x",
    status: "Ativo",
  },
  {
    initials: "TP",
    avatarBg: "bg-[#fbf4e8]",
    avatarText: "text-[#c8a86b]",
    name: "Thiago Pereira",
    email: "thiago.p@email.com",
    phone: "(11) 94567-8901",
    lastVisit: "10/06/2026",
    nextAppointment: "—",
    totalSpent: "R$ 2.200,00",
    visits: "55x",
    status: "Ativo",
  },
  {
    initials: "BF",
    avatarBg: "bg-[#e8f7f1]",
    avatarText: "text-[#27865b]",
    name: "Bruno Ferreira",
    email: "bruno.f@email.com",
    phone: "(11) 93456-7890",
    lastVisit: "01/05/2026",
    nextAppointment: "—",
    totalSpent: "R$ 240,00",
    visits: "6x",
    status: "Inativo",
  },
  {
    initials: "RC",
    avatarBg: "bg-[#fdf3e3]",
    avatarText: "text-[#d28b27]",
    name: "Rafael Costa",
    email: "rafael.c@email.com",
    phone: "(11) 92345-6789",
    lastVisit: "08/08/2026",
    nextAppointment: "20/08/2026",
    totalSpent: "R$ 960,00",
    visits: "24x",
    status: "Ativo",
  },
  {
    initials: "DM",
    avatarBg: "bg-[#eaf2fb]",
    avatarText: "text-[#3478c9]",
    name: "Diego Martins",
    email: "diego.m@email.com",
    phone: "(11) 91234-5678",
    lastVisit: "10/08/2026",
    nextAppointment: "—",
    totalSpent: "R$ 580,00",
    visits: "14x",
    status: "Ativo",
  },
];

export function AdminClientesPage() {
  const [search, setSearch] = useState("");
  const [novoAberto, setNovoAberto] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState("Todos os status");
  const toast = useToast();

  const filtered = clientes.filter(
    (c) =>
      (filtroStatus === "Todos os status" || c.status === filtroStatus) &&
      [c.name, c.phone, c.email].some((field) =>
        field.toLowerCase().includes(search.toLowerCase()),
      ),
  );

  return (
    <div className="flex w-full flex-col items-start">
      <div className="flex w-full items-center justify-between">
        <div>
          <h1 className="font-['Manrope',sans-serif] text-2xl font-bold tracking-[-0.48px] text-[#0d1831]">
            Clientes
          </h1>
          <p className="pt-0.5 text-sm text-[#686a73]">{clientes.length} clientes cadastrados</p>
        </div>
        <button
          type="button"
          onClick={() => setNovoAberto(true)}
          className="flex h-10 items-center justify-center gap-2 rounded-[10px] bg-[#7247f3] px-4 text-sm font-medium text-white transition hover:bg-[#5c2ee0]"
        >
          <Plus size={16} strokeWidth={2} />
          Novo cliente
        </button>
      </div>

      <div className="flex w-full flex-wrap items-center gap-3 pt-6">
        <div className="flex h-9 flex-1 items-center gap-2 rounded-[10px] border border-[#e6e4df] bg-white px-3">
          <Search size={15} strokeWidth={1.8} className="text-[#b0afa8]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, telefone ou e-mail..."
            className="w-full bg-transparent text-sm text-[#0d1831] placeholder:text-[#b0afa8] focus:outline-none"
          />
        </div>
        <FilterSelect
          label="Filtrar por status"
          className="w-[155px]"
          options={["Todos os status", "Ativo", "Inativo"]}
          value={filtroStatus}
          onChange={setFiltroStatus}
        />
      </div>

      <div className="w-full pt-6">
        <div className="w-full overflow-x-auto rounded-[12px] border border-[#e6e4df] bg-white">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#e6e4df] bg-[#f7f6f2] text-xs font-medium text-[#686a73]">
                <th className="sticky left-0 z-10 bg-white px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Telefone</th>
                <th className="px-4 py-3 font-medium">Última visita</th>
                <th className="px-4 py-3 font-medium">Próx. agendamento</th>
                <th className="px-4 py-3 font-medium">Total gasto</th>
                <th className="px-4 py-3 font-medium">Visitas</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((cliente) => (
                <tr key={cliente.email} className="border-b border-[#e6e4df] last:border-b-0">
                  <td className="sticky left-0 z-10 bg-white px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`grid size-8 shrink-0 place-items-center rounded-full ${cliente.avatarBg} text-xs font-semibold ${cliente.avatarText}`}
                      >
                        {cliente.initials}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-[#0d1831]">{cliente.name}</p>
                        <p className="text-xs text-[#686a73]">{cliente.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#686a73]">{cliente.phone}</td>
                  <td className="px-4 py-3 text-sm text-[#686a73]">{cliente.lastVisit}</td>
                  <td className="px-4 py-3 text-sm text-[#686a73]">{cliente.nextAppointment}</td>
                  <td className="px-4 py-3 text-sm font-medium text-[#0d1831]">{cliente.totalSpent}</td>
                  <td className="px-4 py-3 text-sm text-[#686a73]">{cliente.visits}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        cliente.status === "Ativo"
                          ? "bg-[#e8f7f1] text-[#27865b]"
                          : "bg-[#f0efea] text-[#686a73]"
                      }`}
                    >
                      {cliente.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      aria-label="Mais opções"
                      className="text-[#b0afa8] transition hover:text-[#686a73]"
                    >
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <NovoClienteModal
        open={novoAberto}
        onClose={() => setNovoAberto(false)}
        onConcluir={toast.mostrar}
      />
      <Toast mensagem={toast.mensagem} tone={toast.tone} onClose={toast.fechar} />
    </div>
  );
}
