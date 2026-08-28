"use client";

import { useState } from "react";
import { Search, FolderPlus } from "lucide-react";
import { Modal, ModalCancelButton, ModalSubmitButton } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { FieldGrid, SelectField, TextField } from "@/components/ui/FormFields";
import { Toast, useToast } from "@/components/ui/Toast";

type Barbearia = {
  name: string;
  cnpj: string;
  responsavel: string;
  plano: "pro" | "free";
  usuarios: number;
  criacao: string;
  ultimoAcesso: string;
  status: "Ativo" | "Bloqueado";
};

const barbearias: Barbearia[] = [
  {
    name: "Barbearia Estilo Único",
    cnpj: "12.345.678/0001-90",
    responsavel: "Rafael Mendes",
    plano: "pro",
    usuarios: 8,
    criacao: "15/01/2024",
    ultimoAcesso: "15/01/2024",
    status: "Ativo",
  },
  {
    name: "Corte & Arte",
    cnpj: "23.456.789/0001-11",
    responsavel: "Marcos Vieira",
    plano: "free",
    usuarios: 3,
    criacao: "02/03/2024",
    ultimoAcesso: "01/08/2026",
    status: "Bloqueado",
  },
  {
    name: "Studio Navalha de Ouro",
    cnpj: "34.567.890/0001-22",
    responsavel: "Camila Duarte",
    plano: "pro",
    usuarios: 6,
    criacao: "18/05/2024",
    ultimoAcesso: "24/08/2026",
    status: "Ativo",
  },
  {
    name: "Barba Boa",
    cnpj: "45.678.901/0001-33",
    responsavel: "Diego Almeida",
    plano: "free",
    usuarios: 2,
    criacao: "09/09/2024",
    ultimoAcesso: "20/08/2026",
    status: "Ativo",
  },
  {
    name: "Barbearia Vintage",
    cnpj: "56.789.012/0001-44",
    responsavel: "Renata Souza",
    plano: "pro",
    usuarios: 5,
    criacao: "27/11/2024",
    ultimoAcesso: "22/08/2026",
    status: "Ativo",
  },
  {
    name: "Clube do Corte",
    cnpj: "67.890.123/0001-55",
    responsavel: "Felipe Nogueira",
    plano: "free",
    usuarios: 4,
    criacao: "14/02/2025",
    ultimoAcesso: "19/08/2026",
    status: "Ativo",
  },
];

const planoStyles: Record<Barbearia["plano"], string> = {
  pro: "bg-[#ede9fd] text-[#7247f3]",
  free: "bg-[#f0efea] text-[#686a73]",
};

const statusStyles: Record<Barbearia["status"], string> = {
  Ativo: "bg-[#e8f7f1] text-[#27865b]",
  Bloqueado: "bg-[#fdeaea] text-[#c84a4a]",
};

export function SuperAdminBarbeariasPage() {
  const [novaAberto, setNovaAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos os status");
  const [filtroPlano, setFiltroPlano] = useState("Todos os planos");
  /** Barbearia cuja mudança de status está sendo confirmada. */
  const [confirmando, setConfirmando] = useState<Barbearia | null>(null);
  const toast = useToast();

  const visiveis = barbearias.filter(
    (b) =>
      (filtroStatus === "Todos os status" || b.status === filtroStatus) &&
      (filtroPlano === "Todos os planos" || b.plano === filtroPlano) &&
      (busca === "" ||
        b.name.toLowerCase().includes(busca.toLowerCase()) ||
        b.responsavel.toLowerCase().includes(busca.toLowerCase())),
  );

  function confirmarMudancaDeStatus() {
    const b = confirmando;
    setConfirmando(null);
    if (!b) return;
    toast.mostrar(
      b.status === "Ativo"
        ? `${b.name} foi bloqueada. Os usuários perderam o acesso.`
        : `${b.name} foi reativada.`,
    );
  }

  function criarBarbearia(event: React.FormEvent) {
    event.preventDefault();
    // Sem backend ainda: é aqui que a chamada de API entra depois.
    setNovaAberto(false);
    toast.mostrar("Barbearia criada. Um convite foi enviado ao responsável.");
  }

  return (
    <div className="flex w-full flex-col items-start gap-4">
      <div className="flex w-full flex-wrap items-center gap-3">
        <div className="flex h-10 flex-1 items-center gap-2 rounded-[10px] border border-[#e6e4df] bg-white px-4">
          <Search size={15} strokeWidth={1.8} className="text-[#98a2b3]" />
          <input
            type="text"
            placeholder="Buscar por nome ou responsável..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="h-full flex-1 bg-transparent text-xs text-[#0d1831] placeholder:text-[#98a2b3] focus:outline-none"
          />
        </div>
        <FilterSelect
          label="Filtrar por status"
          options={["Todos os status", "Ativo", "Bloqueado"]}
          value={filtroStatus}
          onChange={setFiltroStatus}
        />
        <FilterSelect
          label="Filtrar por plano"
          options={["Todos os planos", "pro", "free"]}
          value={filtroPlano}
          onChange={setFiltroPlano}
        />
        <button
          type="button"
          onClick={() => setNovaAberto(true)}
          className="flex h-10 items-center gap-2 rounded-[10px] bg-[#7247f3] px-4 text-xs font-medium text-white transition hover:bg-[#5c2ee0]"
        >
          <FolderPlus size={18} strokeWidth={1.8} />
          Nova barbearia
        </button>
      </div>

      <div className="w-full rounded-[12px] border border-[#e6e4df] bg-white p-6">
        <p className="text-lg font-bold text-[#0d1831]">Barbearias recentes</p>
        <div className="w-full overflow-x-auto">
          <table className="mt-4 w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#e6e4df] text-[10px] font-bold text-[#98a2b3]">
                <th className="pb-2 pr-3 font-bold">BARBEARIA</th>
                <th className="pb-2 pr-3 text-center font-bold">RESPONSÁVEL</th>
                <th className="pb-2 pr-3 text-center font-bold">PLANO</th>
                <th className="pb-2 pr-3 text-center font-bold">USUÁRIOS</th>
                <th className="pb-2 pr-3 text-center font-bold">CRIAÇÃO</th>
                <th className="pb-2 pr-3 text-center font-bold">ÚLTIMO ACESSO</th>
                <th className="pb-2 pr-3 text-center font-bold">STATUS</th>
                <th className="pb-2 pr-3 text-center font-bold">AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {visiveis.map((b) => (
                <tr key={b.name} className="border-b border-[#eef0f3] last:border-b-0">
                  <td className="sticky left-0 z-10 bg-white py-3 pr-3">
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-[10px] bg-[#ede9fd] text-xs font-bold text-[#7247f3]">
                        {b.name
                          .split(" ")
                          .slice(0, 2)
                          .map((w) => w[0])
                          .join("")}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-[#0d1831]">{b.name}</p>
                        <p className="text-sm text-[#5f6f87]">{b.cnpj}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-3 text-center text-sm text-[#5f6f87]">{b.responsavel}</td>
                  <td className="py-3 pr-3 text-center">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${planoStyles[b.plano]}`}>
                      {b.plano}
                    </span>
                  </td>
                  <td className="py-3 pr-3 text-center text-sm text-[#5f6f87]">{b.usuarios}</td>
                  <td className="py-3 pr-3 text-center text-sm text-[#5f6f87]">{b.criacao}</td>
                  <td className="py-3 pr-3 text-center text-sm text-[#5f6f87]">{b.ultimoAcesso}</td>
                  <td className="py-3 pr-3 text-center">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${statusStyles[b.status]}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="py-3 pr-3">
                    <div className="flex items-center justify-center gap-3">
                      <button type="button" className="text-sm text-[#5f6f87] transition hover:text-[#0d1831]">
                        Ver
                      </button>
                      {b.status === "Ativo" ? (
                        <button
                          type="button"
                          onClick={() => setConfirmando(b)}
                          className="rounded-[8px] bg-[#c84a4a] px-3 py-1 text-sm font-medium text-white transition hover:bg-[#b13f3f]"
                        >
                          Bloquear
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmando(b)}
                          className="rounded-[8px] border border-[#e6e4df] px-3 py-1 text-sm text-[#0d1831] transition hover:bg-[#f7f6f2]"
                        >
                          Ativar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={novaAberto}
        onClose={() => setNovaAberto(false)}
        title="Nova barbearia"
        description="A barbearia começa em trial e o responsável recebe um convite por e-mail."
        size="md"
        footer={
          <>
            <ModalCancelButton onClick={() => setNovaAberto(false)} />
            <ModalSubmitButton form="form-nova-barbearia">Criar barbearia</ModalSubmitButton>
          </>
        }
      >
        <form id="form-nova-barbearia" onSubmit={criarBarbearia} className="flex flex-col gap-4">
          <FieldGrid>
            <TextField label="Nome da barbearia" required placeholder="Barbearia Estilo Único" />
            <TextField label="CNPJ" required placeholder="00.000.000/0001-00" />
          </FieldGrid>
          <FieldGrid>
            <TextField label="Nome do responsável" required placeholder="Rafael Mendes" />
            <TextField
              label="E-mail do responsável"
              type="email"
              required
              placeholder="responsavel@barbearia.com"
              hint="O convite de acesso vai para este endereço."
            />
          </FieldGrid>
          <FieldGrid>
            <SelectField label="Plano inicial" options={["Básico", "Pro", "Enterprise"]} defaultValue="Básico" />
            <TextField label="Dias de trial" type="number" defaultValue="14" />
          </FieldGrid>
          <TextField label="Cidade / UF" placeholder="São Paulo / SP" />
        </form>
      </Modal>

      <ConfirmModal
        open={confirmando !== null}
        onClose={() => setConfirmando(null)}
        onConfirm={confirmarMudancaDeStatus}
        tone={confirmando?.status === "Ativo" ? "danger" : "accent"}
        title={
          confirmando?.status === "Ativo"
            ? `Bloquear ${confirmando.name}?`
            : `Reativar ${confirmando?.name}?`
        }
        confirmLabel={confirmando?.status === "Ativo" ? "Bloquear barbearia" : "Reativar barbearia"}
        description={
          confirmando?.status === "Ativo"
            ? "Todos os usuários perdem o acesso imediatamente e os agendamentos futuros ficam suspensos. Nenhum dado é apagado — a barbearia pode ser reativada depois."
            : "Os usuários voltam a ter acesso e os agendamentos suspensos são retomados."
        }
      >
        {confirmando && (
          <p className="mt-3 rounded-[8px] bg-[#f7f6f2] px-3 py-2 text-xs text-[#5f6f87]">
            {confirmando.usuarios} usuário(s) · responsável {confirmando.responsavel}
          </p>
        )}
      </ConfirmModal>

      <Toast mensagem={toast.mensagem} tone={toast.tone} onClose={toast.fechar} />
    </div>
  );
}
