"use client";

import { SiteHeader } from "./components/SiteHeader";

import {
  ArrowRight,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  MessageCircle,
  Scissors,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  UserRound,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

type SegmentKey = "owner" | "barber" | "client" | "network";

const segmentContent: Record<
  SegmentKey,
  {
    eyebrow: string;
    title: string;
    description: string;
    benefits: string[];
    stat: string;
    statLabel: string;
  }
> = {
  owner: {
    eyebrow: "Para quem conduz o negócio",
    title: "Visibilidade para decidir. Controle para crescer.",
    description:
      "Acompanhe agenda, faturamento, ocupação e comissão sem depender de planilhas ou mensagens espalhadas.",
    benefits: [
      "Indicadores diários, semanais e mensais",
      "Visão completa da equipe",
      "Comissões calculadas por atendimento",
    ],
    stat: "Hoje",
    statLabel: "Sua operação em uma visão",
  },
  barber: {
    eyebrow: "Para quem transforma horários em experiência",
    title: "Uma agenda clara. Um dia de trabalho mais leve.",
    description:
      "Veja os próximos atendimentos, bloqueie horários e acompanhe sua comissão em uma área simples e objetiva.",
    benefits: [
      "Agenda individual atualizada",
      "Bloqueios e disponibilidade",
      "Histórico de atendimentos e comissão",
    ],
    stat: "6",
    statLabel: "Atendimentos confirmados",
  },
  client: {
    eyebrow: "Para quem quer praticidade",
    title: "Agendar um corte deve levar menos de um minuto.",
    description:
      "O cliente escolhe serviço, profissional e horário disponível sem troca interminável de mensagens.",
    benefits: [
      "Agendamento simples e rápido",
      "Lembretes automáticos",
      "Histórico e preferência de atendimento",
    ],
    stat: "10:30",
    statLabel: "Próximo horário disponível",
  },
  network: {
    eyebrow: "Para operações com mais de uma unidade",
    title: "Cada unidade no lugar certo. A rede inteira sob controle.",
    description:
      "Gerencie barbearias, usuários e indicadores com isolamento de dados e visão consolidada da operação.",
    benefits: [
      "Gestão multiunidade",
      "Perfis e permissões separados",
      "Indicadores consolidados da rede",
    ],
    stat: "4",
    statLabel: "Unidades conectadas",
  },
};

const faqItems = [
  {
    question: "Como começo a usar o Varthex Barber?",
    answer:
      "Cadastre a barbearia, adicione os profissionais, defina os serviços e configure os horários. Depois disso, a agenda já pode começar a receber atendimentos.",
  },
  {
    question: "Posso controlar a agenda de cada barbeiro?",
    answer:
      "Sim. Cada profissional possui disponibilidade própria, bloqueios de horário e uma visão individual dos próximos atendimentos.",
  },
  {
    question: "Como funciona o cálculo de comissão?",
    answer:
      "A regra de comissão é vinculada ao profissional e ao atendimento. O sistema organiza os valores realizados para reduzir contas manuais e divergências.",
  },
  {
    question: "Meus clientes recebem lembretes?",
    answer:
      "A plataforma foi estruturada para centralizar confirmações e lembretes. As integrações de comunicação podem ser ativadas conforme o plano e a fase do produto.",
  },
  {
    question: "O sistema atende redes de barbearias?",
    answer:
      "Sim. A arquitetura considera múltiplas unidades, com dados separados por barbearia e uma visão administrativa consolidada para a rede.",
  },
  {
    question: "Os dados da barbearia ficam protegidos?",
    answer:
      "O Varthex Barber aplica separação por unidade, controle de acesso por perfil e práticas de segurança pensadas para uma operação SaaS.",
  },
];

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className="brand" aria-label="Varthex Barber">
      <span className="brand-mark" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      {!compact && (
        <span className="brand-copy">
          <strong>VARTHEX</strong>
          <small>BARBER</small>
        </span>
      )}
    </span>
  );
}

function Badge({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <span className="eyebrow-pill">
      {icon ?? <Sparkles size={13} aria-hidden="true" />}
      {children}
    </span>
  );
}

function ArrowLink({ children, href = "#contato" }: { children: ReactNode; href?: string }) {
  return (
    <a className="button button-primary" href={href}>
      {children}
      <ArrowRight size={17} aria-hidden="true" />
    </a>
  );
}

function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`.trim()}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

function AppSidebar({ active = "Visão geral" }: { active?: string }) {
  const items = [
    ["Visão geral", BarChart3],
    ["Agenda", CalendarDays],
    ["Clientes", UsersRound],
    ["Equipe", Scissors],
    ["Comissões", WalletCards],
  ] as const;

  return (
    <aside className="app-sidebar">
      <div className="app-logo-row">
        <Brand compact />
        <strong>Varthex</strong>
      </div>
      <div className="app-search"><Search size={14} /> Buscar</div>
      <span className="app-nav-label">OPERAÇÃO</span>
      <nav aria-label="Demonstração do menu do sistema">
        {items.map(([label, Icon]) => (
          <span className={label === active ? "active" : ""} key={label}>
            <Icon size={15} />
            {label}
          </span>
        ))}
      </nav>
      <div className="app-user">
        <span>AT</span>
        <div><strong>Arthur</strong><small>Administrador</small></div>
      </div>
    </aside>
  );
}

function Chart() {
  return (
    <div className="chart" aria-label="Gráfico ilustrativo de desempenho">
      <div className="chart-lines"><i /><i /><i /><i /></div>
      <svg viewBox="0 0 620 190" role="img" aria-label="Crescimento de atendimentos no mês">
        <defs>
          <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7448f5" stopOpacity="0.23" />
            <stop offset="1" stopColor="#7448f5" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path className="chart-area" d="M0 164 C55 150 73 105 126 122 S210 154 265 106 S356 35 406 75 S502 116 620 42 L620 190 L0 190 Z" />
        <path className="chart-path" d="M0 164 C55 150 73 105 126 122 S210 154 265 106 S356 35 406 75 S502 116 620 42" />
        {[0, 126, 265, 406, 620].map((x, index) => {
          const y = [164, 122, 106, 75, 42][index];
          return <circle key={x} cx={x} cy={y} r="5" />;
        })}
      </svg>
      <div className="chart-axis"><span>SEG</span><span>TER</span><span>QUA</span><span>QUI</span><span>SEX</span><span>SÁB</span></div>
    </div>
  );
}

function DashboardPreview({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`product-window dashboard-window ${compact ? "compact" : ""}`}>
      <AppSidebar />
      <div className="app-main">
        <div className="app-topbar">
          <div><small>VISÃO GERAL</small><strong>Bom dia, Arthur.</strong></div>
          <div className="topbar-actions"><span><Bell size={15} /></span><button>+ Novo agendamento</button></div>
        </div>
        <div className="metric-grid">
          <article><span className="metric-icon violet"><CalendarDays size={17} /></span><small>Agendamentos hoje</small><strong>18</strong><em>+12% esta semana</em></article>
          <article><span className="metric-icon gold"><TrendingUp size={17} /></span><small>Ocupação da agenda</small><strong>84%</strong><em>6 horários livres</em></article>
          <article><span className="metric-icon green"><WalletCards size={17} /></span><small>Receita prevista</small><strong>R$ 2.480</strong><em>Hoje</em></article>
        </div>
        <div className="dashboard-body">
          <article className="chart-card">
            <div className="card-heading"><div><small>DESEMPENHO</small><strong>Atendimentos da semana</strong></div><span>Últimos 7 dias</span></div>
            <Chart />
          </article>
          <article className="next-card">
            <div className="card-heading"><div><small>PRÓXIMOS</small><strong>Agenda de hoje</strong></div><span>Ver agenda</span></div>
            {[
              ["09:00", "Lucas Mendes", "Corte + barba", "JM"],
              ["10:30", "Rafael Lima", "Corte", "DS"],
              ["11:15", "Bruno Alves", "Barba", "RM"],
            ].map(([time, name, service, avatar]) => (
              <div className="appointment" key={time}>
                <time>{time}</time><span>{avatar}</span><div><strong>{name}</strong><small>{service}</small></div><i />
              </div>
            ))}
          </article>
        </div>
      </div>
    </div>
  );
}

function AgendaPreview() {
  const days = ["SEG 18", "TER 19", "QUA 20", "QUI 21", "SEX 22"];
  return (
    <div className="product-window module-window">
      <AppSidebar active="Agenda" />
      <div className="app-main agenda-main">
        <div className="app-topbar"><div><small>AGENDA</small><strong>Semana de 18 a 22 de agosto</strong></div><button>+ Agendar</button></div>
        <div className="calendar-head"><span>HORÁRIO</span>{days.map(day => <strong key={day}>{day}</strong>)}</div>
        <div className="calendar-grid">
          {["09:00", "10:00", "11:00", "12:00", "13:00"].map((time, row) => (
            <div className="calendar-row" key={time}>
              <time>{time}</time>
              {days.map((day, col) => {
                const booked = (row + col) % 3 !== 1;
                return booked ? (
                  <span className={`booking booking-${(row + col) % 3}`} key={day}>
                    <b>{["Corte", "Barba", "Combo"][(row + col) % 3]}</b>
                    <small>{["Lucas", "Rafael", "Bruno", "Carlos"][(row + col) % 4]}</small>
                  </span>
                ) : <span className="empty-slot" key={day}>Disponível</span>;
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="floating-detail agenda-detail">
        <span className="metric-icon violet"><Clock3 size={18} /></span>
        <small>PRÓXIMO HORÁRIO</small>
        <strong>10:30 · Rafael Lima</strong>
        <p>Corte tradicional com Diego</p>
        <button>Confirmado <Check size={13} /></button>
      </div>
    </div>
  );
}

function TeamPreview() {
  return (
    <div className="product-window module-window">
      <AppSidebar active="Equipe" />
      <div className="app-main">
        <div className="app-topbar"><div><small>EQUIPE</small><strong>Desempenho dos profissionais</strong></div><button>+ Adicionar profissional</button></div>
        <div className="team-metrics">
          <article><small>ATENDIMENTOS</small><strong>126</strong><span>Este mês</span></article>
          <article><small>RECEITA DA EQUIPE</small><strong>R$ 18.940</strong><span>+8,4%</span></article>
          <article><small>COMISSÕES</small><strong>R$ 7.576</strong><span>Calculadas</span></article>
        </div>
        <div className="team-table">
          <div className="table-row table-head"><span>PROFISSIONAL</span><span>ATENDIMENTOS</span><span>OCUPAÇÃO</span><span>COMISSÃO</span></div>
          {[
            ["DS", "Diego Santos", "42", "91%", "R$ 2.680"],
            ["JM", "João Martins", "35", "84%", "R$ 2.140"],
            ["RM", "Rafael Moraes", "29", "78%", "R$ 1.730"],
            ["LC", "Lucas Costa", "20", "71%", "R$ 1.026"],
          ].map(([initials, name, visits, occupancy, commission], index) => (
            <div className="table-row" key={name}>
              <span className="person-cell"><i className={`avatar avatar-${index}`}>{initials}</i><b>{name}</b></span>
              <span>{visits}</span><span><i className="progress"><i style={{ width: occupancy }} /></i>{occupancy}</span><strong>{commission}</strong>
            </div>
          ))}
        </div>
      </div>
      <div className="floating-detail commission-detail">
        <span className="metric-icon gold"><WalletCards size={18} /></span>
        <small>COMISSÃO CALCULADA</small>
        <strong>R$ 2.680,00</strong>
        <p>42 atendimentos · Diego Santos</p>
        <div className="mini-progress"><i /></div>
      </div>
    </div>
  );
}

function ClientPreview() {
  return (
    <div className="product-window module-window">
      <AppSidebar active="Clientes" />
      <div className="app-main">
        <div className="app-topbar"><div><small>CLIENTES</small><strong>Relacionamento e recorrência</strong></div><button>+ Novo cliente</button></div>
        <div className="client-filter"><span className="selected">Todos 248</span><span>Recorrentes 86</span><span>Inativos 24</span><span>Aniversariantes 7</span></div>
        <div className="client-table">
          <div className="table-row table-head"><span>CLIENTE</span><span>ÚLTIMO SERVIÇO</span><span>ÚLTIMA VISITA</span><span>RETORNO</span></div>
          {[
            ["LM", "Lucas Mendes", "Corte + barba", "12 ago", "Em 5 dias"],
            ["RA", "Rafael Almeida", "Corte", "08 ago", "Hoje"],
            ["BC", "Bruno Carvalho", "Barba", "01 ago", "Atrasado"],
            ["GF", "Gabriel Ferreira", "Combo premium", "28 jul", "Atrasado"],
          ].map(([initials, name, service, visit, returnLabel], index) => (
            <div className="table-row" key={name}>
              <span className="person-cell"><i className={`avatar avatar-${index}`}>{initials}</i><b>{name}</b></span>
              <span>{service}</span><span>{visit}</span><strong className={returnLabel === "Atrasado" ? "late" : ""}>{returnLabel}</strong>
            </div>
          ))}
        </div>
      </div>
      <div className="floating-detail message-detail">
        <span className="metric-icon violet"><MessageCircle size={18} /></span>
        <small>LEMBRETE DE RETORNO</small>
        <strong>Seu corte está pedindo uma renovada.</strong>
        <p>Mensagem pronta para Rafael Almeida.</p>
        <button>Enviar lembrete <ArrowRight size={13} /></button>
      </div>
    </div>
  );
}

function MiniFlow({ type }: { type: "setup" | "schedule" | "control" }) {
  if (type === "setup") {
    return (
      <div className="mini-flow import-flow">
        <div className="mini-table">{Array.from({ length: 20 }).map((_, i) => <i className={i % 5 === 1 || i % 7 === 0 ? "active" : ""} key={i} />)}</div>
        <span className="flow-badge"><UsersRound size={17} /> Sua equipe</span>
      </div>
    );
  }
  if (type === "schedule") {
    return (
      <div className="mini-flow schedule-flow">
        <div className="phone-card"><small>NOVO AGENDAMENTO</small><strong>Escolha um horário</strong><div><i>09:00</i><i className="selected">10:30</i><i>11:15</i></div><button>Confirmar</button></div>
        <span className="time-bubble">1 min</span>
      </div>
    );
  }
  return (
    <div className="mini-flow control-flow">
      <div className="mini-stat"><small>OCUPAÇÃO</small><strong>84%</strong><span>+12%</span></div>
      <div className="mini-chart"><i /><i /><i /><i /><i /></div>
      <span className="flow-badge"><TrendingUp size={17} /> Em crescimento</span>
    </div>
  );
}

function InsightVisual() {
  return (
    <div className="insight-visual">
      <div className="insight-orb orb-one" /><div className="insight-orb orb-two" />
      <article className="floating-insight">
        <span className="attention"><Sparkles size={13} /> Oportunidade encontrada</span>
        <strong>Sextas-feiras estão com 3 horários livres.</strong>
        <p>Uma campanha de retorno para 18 clientes pode preencher os horários de menor ocupação.</p>
        <div><span><UsersRound size={13} /> 18 clientes</span><span><Clock3 size={13} /> 3 horários</span></div>
        <button>Criar campanha de retorno</button>
      </article>
    </div>
  );
}

function SegmentPanel({ segment }: { segment: SegmentKey }) {
  const content = segmentContent[segment];
  return (
    <div className="segment-panel">
      <div className="segment-copy">
        <span>{content.eyebrow}</span>
        <h3>{content.title}</h3>
        <p>{content.description}</p>
        <ul>{content.benefits.map(item => <li key={item}><Check size={15} /> {item}</li>)}</ul>
      </div>
      <div className="segment-ui">
        <div className="segment-ui-top"><Brand compact /><span><Bell size={14} /></span></div>
        <div className="segment-feature-stat"><small>{content.statLabel}</small><strong>{content.stat}</strong><em><TrendingUp size={13} /> Atualizado agora</em></div>
        <div className="segment-bars">{[64, 88, 45, 76, 92, 58, 82].map((height, i) => <i key={i} style={{ height: `${height}%` }} />)}</div>
        <div className="segment-bottom"><span>SEG</span><span>TER</span><span>QUA</span><span>QUI</span><span>SEX</span><span>SÁB</span><span>DOM</span></div>
      </div>
    </div>
  );
}

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <div className="faq-list">
      {faqItems.map((item, index) => {
        const expanded = open === index;
        return (
          <article className={expanded ? "open" : ""} key={item.question}>
            <button onClick={() => setOpen(expanded ? -1 : index)} aria-expanded={expanded}>
              <span>{item.question}</span><ChevronDown size={18} />
            </button>
            {expanded && <div className="faq-answer"><p>{item.answer}</p></div>}
          </article>
        );
      })}
    </div>
  );
}

export function LandingPage() {
  const [segment, setSegment] = useState<SegmentKey>("owner");

  return (
    <main className="site-shell">
        <SiteHeader />

        <section className="hero section" id="inicio">
          <div className="hero-copy">
            <Reveal><Badge icon={<Sparkles size={13} />}>A nova rotina das barbearias em crescimento</Badge></Reveal>
            <Reveal delay={0.05}><h1>Gestão sob controle.<br /><span>Crescimento sem improviso.</span></h1></Reveal>
            <Reveal delay={0.1}><p>O Varthex Barber conecta agenda, equipe, clientes, comissões e indicadores para mostrar o que está funcionando — e o que fazer depois.</p></Reveal>
            <Reveal className="hero-actions" delay={0.16}>
              <ArrowLink>Começar agora</ArrowLink>
              <a className="button button-secondary" href="#publicos">Conhecer o produto <ArrowRight size={17} /></a>
            </Reveal>
          </div>
          <div className="hero-visual">
            <div className="organic-glow glow-a" /><div className="organic-glow glow-b" /><div className="organic-glow glow-c" />
            <Reveal className="hero-window-wrap" delay={0.22}>
              <span className="visual-label"><Sparkles size={13} /> Veja sua operação por inteiro</span>
              <DashboardPreview />
            </Reveal>
          </div>
        </section>

        <section className="first-wins section" id="produto">
          <Reveal className="section-intro">
            <Badge icon={<Clock3 size={13} />}>Comece sem complicação</Badge>
            <h2>Sua primeira melhoria<br />começa em minutos.</h2>
            <p>Configure a operação, organize os horários e transforme dados do dia a dia em decisões claras.</p>
          </Reveal>
          <div className="win-grid">
            {[
              { type: "setup" as const, tag: "01 · CONFIGURE", title: "Traga sua equipe para o mesmo lugar", text: "Cadastre profissionais, serviços, horários e regras da barbearia em um fluxo simples." },
              { type: "schedule" as const, tag: "02 · ORGANIZE", title: "Receba o primeiro agendamento", text: "O cliente escolhe serviço, profissional e horário sem depender de mensagens." },
              { type: "control" as const, tag: "03 · ACOMPANHE", title: "Veja a operação ganhar clareza", text: "A agenda alimenta indicadores e deixa o desempenho visível para quem decide." },
            ].map((item, index) => (
              <Reveal className="win-card" delay={index * 0.08} key={item.title}>
                <MiniFlow type={item.type} />
                <div className="win-copy"><span>{item.tag}</span><h3>{item.title}</h3><p>{item.text}</p></div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="operations section" id="recursos">
          <Reveal className="section-intro operations-intro">
            <Badge icon={<BarChart3 size={13} />}>A plataforma de gestão</Badge>
            <h2>Do agendamento ao resultado.<br />Tudo em um só lugar.</h2>
            <p>Menos planilhas, menos mensagens perdidas e mais visibilidade sobre a rotina da barbearia.</p>
            <ArrowLink>Explorar a plataforma</ArrowLink>
          </Reveal>

          <div className="module-list">
            <Reveal className="feature-module">
              <div className="module-heading"><h3>Domine sua agenda.<br /><span>Pare de perder horários.</span></h3><p>Disponibilidade, bloqueios, encaixes e próximos atendimentos organizados para toda a equipe.</p></div>
              <AgendaPreview />
            </Reveal>
            <Reveal className="feature-module">
              <div className="module-heading"><h3>Equipe organizada.<br /><span>Comissões sem confusão.</span></h3><p>Veja produtividade, ocupação e valores por profissional sem recalcular tudo no fim do mês.</p></div>
              <TeamPreview />
            </Reveal>
            <Reveal className="feature-module">
              <div className="module-heading"><h3>Clientes por perto.<br /><span>Retorno no momento certo.</span></h3><p>Histórico, recorrência e lembretes para transformar um bom atendimento em relacionamento.</p></div>
              <ClientPreview />
            </Reveal>
          </div>
        </section>

        <section className="crm-section section">
          <Reveal className="section-intro crm-intro">
            <Badge icon={<UserRound size={13} />}>Clientes e relacionamento</Badge>
            <h2>Seu relacionamento,<br />incluído.</h2>
            <p>Conheça a frequência, as preferências e o histórico de cada cliente sem pagar por outra ferramenta ou trocar de tela.</p>
          </Reveal>
          <Reveal className="crm-visual"><ClientPreview /></Reveal>
        </section>

        <section className="insights-section section">
          <Reveal className="insight-card">
            <div className="insight-copy">
              <Badge icon={<Sparkles size={13} />}>Inteligência operacional</Badge>
              <h2>Decisões mais inteligentes.<br /><span>Saiba o que está funcionando.</span></h2>
              <p>O Varthex identifica padrões da operação: dias com baixa ocupação, clientes que precisam retornar e serviços que mais movimentam o negócio.</p>
              <ArrowLink>Conhecer os indicadores</ArrowLink>
            </div>
            <InsightVisual />
          </Reveal>
        </section>

        <section className="audience-section section" id="publicos">
          <Reveal className="section-intro audience-intro">
            <Badge icon={<Star size={13} />}>Uma plataforma, quatro experiências</Badge>
            <h2>Mais clareza.<br />Menos ferramentas.</h2>
            <p>Cada pessoa vê o que precisa, sem carregar a complexidade da operação inteira.</p>
          </Reveal>
          <div className="segment-tabs" role="tablist" aria-label="Perfis atendidos">
            {[["owner", "Dono"], ["barber", "Barbeiro"], ["client", "Cliente"], ["network", "Rede / Super Admin"]].map(([key, label]) => (
              <button role="tab" aria-selected={segment === key} className={segment === key ? "active" : ""} onClick={() => setSegment(key as SegmentKey)} key={key}>{label}</button>
            ))}
          </div>
          <div className="segment-stage"><SegmentPanel key={segment} segment={segment} /></div>
        </section>

        <section className="comparison-section section">
          <Reveal className="comparison-panel">
            <div className="comparison-copy">
              <Badge icon={<Check size={13} />}>Antes e depois</Badge>
              <h2>Sua operação,<br />finalmente organizada.</h2>
              <p>Agenda em conversa, cliente no caderno e comissão na planilha dão lugar a uma operação conectada.</p>
              <div className="replaces"><strong>Substitui:</strong><span>Agenda de papel</span><span>Planilhas</span><span>Mensagens perdidas</span></div>
              <ul><li><Check size={15} /> Veja o que está acontecendo agora</li><li><Check size={15} /> Mantenha equipe e agenda conectadas</li><li><Check size={15} /> Tome decisões com dados da própria operação</li></ul>
            </div>
            <div className="comparison-ui"><DashboardPreview compact /></div>
          </Reveal>
        </section>

        <section className="visual-cta section">
          <Reveal className="visual-cta-panel">
            <div className="sky sky-one" /><div className="sky sky-two" /><div className="sky sky-three" />
            <div className="cta-brand-orb floating-brand"><Brand compact /></div>
            <h2>Sua barbearia,<br />em uma única visão.</h2>
            <p>Agenda, equipe, clientes, comissões e indicadores conectados para você cuidar do crescimento — sem perder o controle.</p>
            <ArrowLink>Quero organizar minha operação</ArrowLink>
          </Reveal>
        </section>

        <section className="faq-section section" id="faq">
          <Reveal className="section-intro faq-intro">
            <Badge icon={<ShieldCheck size={13} />}>Perguntas frequentes</Badge>
            <h2>É justo perguntar.</h2>
            <p>Respostas diretas sobre como o Varthex Barber entra na rotina da sua operação.</p>
          </Reveal>
          <Reveal><Faq /></Reveal>
        </section>

        <section className="final-section section" id="contato">
          <div className="final-glow" />
          <Reveal className="final-content">
            <h2>Proteja sua margem.<br />Reduza o caos.</h2>
            <p>O Varthex Barber mantém sua operação organizada hoje e preparada para os próximos passos.</p>
            <div className="feature-checklist">
              <div>{["Agenda e disponibilidade", "Cadastro de clientes", "Gestão da equipe", "Comissões", "Indicadores da operação"].map(item => <span key={item}><i><Check size={13} /></i>{item}</span>)}</div>
              <div>{["Perfis e permissões", "Multiunidade", "Bloqueios de horário", "Histórico de atendimentos", "Busca centralizada"].map(item => <span key={item}><i><Check size={13} /></i>{item}</span>)}</div>
              <div>{["Estoque", "Programa de fidelidade", "Google Agenda", "Automações inteligentes"].map(item => <span className="soon" key={item}><i><Check size={13} /></i>{item}<em>Em breve</em></span>)}</div>
            </div>
            <ArrowLink>Começar agora</ArrowLink>
          </Reveal>
          <footer className="site-footer">
            <Brand />
            <div><strong>Produto</strong><a href="#produto">Como funciona</a><a href="#recursos">Recursos</a><a href="#publicos">Para quem</a></div>
            <div><strong>Empresa</strong><a href="#inicio">Sobre a Varthex</a><a href="#contato">Contato</a><a href="#faq">Ajuda</a></div>
            <div><strong>Legal</strong><a href="#contato">Privacidade</a><a href="#contato">Termos de uso</a></div>
            <small>© {new Date().getFullYear()} Varthex Barber. Todos os direitos reservados.</small>
          </footer>
        </section>
    </main>
  );
}
