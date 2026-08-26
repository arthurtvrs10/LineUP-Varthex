"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";

type Client = {
  name: string;
  role: string;
  phone: string;
  email: string;
  birth: string;
  registeredAt: string;
  status: "Ativo" | "Arquivado";
  duplicate?: boolean;
  initials: string;
  avatarBg: string;
  avatarColor: string;
};

const clients: Client[] = [
  {
    name: "Carlos Henrique",
    role: "Cliente",
    phone: "(61) 99999-1020",
    email: "carlos@exemplo.com",
    birth: "15/04/1992",
    registeredAt: "10/02/2026",
    status: "Ativo",
    initials: "CH",
    avatarBg: "bg-[#e8e6ff]",
    avatarColor: "text-[#293aa3]",
  },
  {
    name: "Rafael Martins",
    role: "Cliente",
    phone: "(61) 98888-2210",
    email: "Não informado",
    birth: "22/09/1988",
    registeredAt: "18/03/2026",
    status: "Ativo",
    duplicate: true,
    initials: "RM",
    avatarBg: "bg-[#e0e7ff]",
    avatarColor: "text-[#3448c5]",
  },
  {
    name: "André Lima",
    role: "Cliente",
    phone: "(61) 97777-0345",
    email: "andre@exemplo.com",
    birth: "Não informado",
    registeredAt: "06/04/2026",
    status: "Ativo",
    initials: "AL",
    avatarBg: "bg-[#e8e6ff]",
    avatarColor: "text-[#293aa3]",
  },
  {
    name: "Marcos Souza",
    role: "Cliente",
    phone: "(61) 96666-4182",
    email: "marcos@exemplo.com",
    birth: "03/11/1995",
    registeredAt: "21/01/2026",
    status: "Arquivado",
    initials: "MS",
    avatarBg: "bg-[#f2f4f7]",
    avatarColor: "text-[#475467]",
  },
];

const TOTAL_CLIENTS = 48;

export function BarberClientesPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return clients;
    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(term) || client.email.toLowerCase().includes(term),
    );
  }, [query]);

  const hasDuplicateAlert = filtered.some((client) => client.duplicate);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[30px] font-bold text-[#101828]">Clientes</h1>
          <p className="mt-1 text-sm text-[#475467]">Consulte dados permitidos e o histórico de atendimentos.</p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg bg-[#4318ff] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#3712d1]"
        >
          <Plus size={16} strokeWidth={2.5} />
          Cadastrar cliente
        </button>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-[#eaecf0] bg-white p-5">
        <div className="min-w-[260px] flex-1">
          <label className="text-sm text-[#344054]" htmlFor="buscar-clientes">
            Buscar
          </label>
          <div className="relative mt-2">
            <Search size={16} strokeWidth={2} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#667085]" />
            <input
              id="buscar-clientes"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar clientes"
              className="h-11 w-full rounded-lg border border-[#d0d5dd] pl-10 pr-3.5 text-sm text-[#101828] outline-none focus:border-[#7247f3] focus:ring-3 focus:ring-[#7247f3]/10"
            />
          </div>
        </div>

        <div>
          <p className="text-xs text-[#475467]">RESULTADOS POR PÁGINA</p>
          <select
            className="mt-1.5 h-10 rounded-lg border border-[#d0d5dd] px-3 text-sm font-bold text-[#101828] outline-none"
            defaultValue="4"
          >
            <option value="4">4</option>
            <option value="10">10</option>
            <option value="25">25</option>
          </select>
        </div>

        <p className="text-sm text-[#475467]">{TOTAL_CLIENTS} clientes</p>
      </div>

      {hasDuplicateAlert && (
        <div className="flex items-start gap-3 rounded-xl border border-[#fedf89] bg-[#fffaeb] px-5 py-4">
          <AlertTriangle size={18} strokeWidth={2} className="mt-0.5 shrink-0 text-[#dc6803]" />
          <div>
            <p className="text-sm font-bold text-[#93370d]">Possível cadastro duplicado</p>
            <p className="mt-1 text-xs text-[#b54708]">
              Telefone ou e-mail semelhante foi encontrado. Revise os dados antes de cadastrar outro cliente.
            </p>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-[#eaecf0] bg-white">
        <div className="px-6 pt-5">
          <p className="text-xl font-bold text-[#101828]">Lista de clientes</p>
          <p className="mt-1 text-sm text-[#475467]">Cadastros disponíveis no seu escopo.</p>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left">
            <thead>
              <tr className="border-y border-[#eaecf0] bg-[#f9fafb] text-[12px] font-bold text-[#475467]">
                <th className="px-6 py-3 font-bold">CLIENTE</th>
                <th className="px-6 py-3 font-bold">CONTATO</th>
                <th className="px-6 py-3 font-bold">NASCIMENTO</th>
                <th className="px-6 py-3 font-bold">CADASTRO</th>
                <th className="px-6 py-3 font-bold">STATUS</th>
                <th className="px-6 py-3 text-right font-bold">AÇÃO</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((client) => (
                <tr key={client.name} className="border-b border-[#eaecf0] last:border-none">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={`grid size-10 shrink-0 place-items-center rounded-full text-xs font-bold ${client.avatarBg} ${client.avatarColor}`}
                      >
                        {client.initials}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-[#101828]">{client.name}</p>
                        {client.duplicate ? (
                          <p className="flex items-center gap-1 text-[11px] font-bold text-[#b54708]">
                            <AlertTriangle size={11} strokeWidth={2.5} />
                            Possível duplicidade
                          </p>
                        ) : (
                          <p className="text-xs text-[#475467]">{client.role}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[13px] text-[#344054]">{client.phone}</p>
                    <p className="mt-0.5 text-xs text-[#475467]">{client.email}</p>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-[#344054]">{client.birth}</td>
                  <td className="px-6 py-4 text-[13px] text-[#344054]">{client.registeredAt}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                        client.status === "Ativo"
                          ? "bg-[#e6f7ec] text-[#085d3a]"
                          : "bg-[#f2f4f7] text-[#475467]"
                      }`}
                    >
                      <span className="size-1.5 rounded-full bg-current" />
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-[13px] font-bold text-[#3448c5]">
                    <button type="button" className="hover:underline">
                      Ver histórico
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-[#667085]">
                    Nenhum cliente encontrado para essa busca.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eaecf0] px-6 py-4 text-sm">
          <p className="text-[#475467]">
            Mostrando 1–{filtered.length} de {TOTAL_CLIENTS}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled
              className="flex items-center gap-1 rounded-lg border border-[#d0d5dd] px-3.5 py-2 text-[#344054] opacity-40"
            >
              <ChevronLeft size={14} strokeWidth={2} />
              Anterior
            </button>
            <span className="grid size-10 place-items-center rounded-lg border border-[#3448c5] text-sm font-bold text-[#293aa3]">
              1
            </span>
            <button
              type="button"
              className="flex items-center gap-1 rounded-lg border border-[#d0d5dd] px-3.5 py-2 text-[#344054] transition hover:bg-[#f9fafb]"
            >
              Próxima
              <ChevronRight size={14} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
