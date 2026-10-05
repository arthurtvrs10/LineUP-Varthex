"use client";
import { Receipt } from "./Receipt";
import { Award, Crown, Scissors, Plus, SlidersHorizontal, Receipt as ReceiptIcon } from "lucide-react";
import { csvText, downloadText } from "@/lib/csv";
import { fetchAllPages } from "@/lib/paginated";
import { StatCard } from "@/components/ui/StatCard";
import { ActionForm, Heading, Panel, Status, Table, brl, date, kinds, options, post, useResource, type Row } from "./Primitives";

type Finance = { registers: Row[]; payments: Row[]; balance: number };
const methods = { CASH: "Dinheiro", PIX: "Pix registrado manualmente", CARD: "Cartão registrado manualmente" };
const movementKinds = { PAYMENT: "Pagamento de atendimento", SUPPLY: "Suprimento", WITHDRAWAL: "Sangria", REVERSAL: "Estorno", PRODUCT_SALE: "Venda de produto" };
export function FinancePage() {
  const resource = useResource<Finance>("/commercial/finance");
  const appointments = useResource<Row[]>("/appointments?from=2020-01-01T00:00:00&to=2100-01-01T00:00:00");
  const customers = useResource<Row[]>("/customers", fetchAllPages);
  const current = resource.data?.registers.find(r => !r.closedAt);
  const names = Object.fromEntries((customers.data ?? []).map(c=>[c.id,c.fullName]));
  const appts = (appointments.data ?? []).filter(a=>a.status==='COMPLETED').map(a=>({value:a.id,label:`${names[String(a.customerId)] ?? "Cliente"} · ${date(a.startAt)} · ${brl(a.totalAmount)}`}));
  const submit = async (path: string, body: unknown) => { await post(path,body); resource.reload(); };
  return <div className="space-y-5"><Heading title="Financeiro" detail="Caixa e recebimentos manuais. Pix e cartão registram valores já recebidos; não geram cobranças externas."/><Status ready={!!resource.data} error={resource.error || appointments.error || customers.error}/>
    {resource.data && <><Panel title={current ? "Caixa aberto" : "Caixa fechado"}><p className="text-2xl font-bold">{brl(resource.data.balance)}</p><p className="text-sm text-secondary">Saldo esperado em dinheiro</p></Panel>
    {!current ? <ActionForm title="Abrir caixa" fields={[{name:"amount",label:"Fundo inicial (R$)",type:"number"}]} onSubmit={d=>submit('/commercial/cash/open',{amount:Number(d.amount)})}/> : <>
    <ActionForm title="Receber atendimento" submitLabel="Registrar recebimento" fields={[{name:"appointmentId",label:"Atendimento concluído",options:appts},{name:"amount",label:"Valor recebido (R$)",type:"number",min:"0.01"},{name:"method",label:"Meio",options:kinds(methods)},{name:"reason",label:"Descrição"}]} onSubmit={(d,key)=>submit('/commercial/payments',{...d,amount:Number(d.amount),kind:'PAYMENT',requestKey:key})}/>
    <ActionForm title="Suprimento ou sangria" fields={[{name:"kind",label:"Operação",options:kinds({SUPPLY:'Suprimento',WITHDRAWAL:'Sangria'})},{name:"amount",label:"Valor (R$)",type:"number",min:"0.01"},{name:"reason",label:"Motivo"}]} onSubmit={(d,key)=>submit('/commercial/payments',{...d,amount:Number(d.amount),method:'CASH',requestKey:key})}/>
    <ActionForm title="Fechar caixa" submitLabel="Confirmar fechamento" fields={[{name:"amount",label:"Dinheiro contado (R$)",type:"number"},{name:"reason",label:"Observações do fechamento"}]} onSubmit={d=>submit('/commercial/cash/close',{amount:Number(d.amount),reason:d.reason})}/>
    <ActionForm title="Estornar movimento" submitLabel="Confirmar estorno" fields={[{name:"id",label:"Movimento",options:resource.data.payments.filter(p=>!p.reversalOf&&!resource.data!.payments.some(r=>r.reversalOf===p.id)).map(p=>({value:p.id,label:`${date(p.createdAt)} · ${p.reason} · ${brl(p.amount)}`}))},{name:"reason",label:"Motivo do estorno"}]} onSubmit={d=>submit(`/commercial/payments/${d.id}/reverse`,{reason:d.reason})}/></>}
    <Receipt appointments={appts}/><button type="button" className="underline" onClick={()=>downloadText('movimentos-financeiros.csv',csvText([['Identificador','Data','Tipo','Descrição','Meio','Valor','Caixa','Estorno de'],...resource.data!.payments.map(p=>[p.id,p.createdAt,p.kind,p.reason,p.method,p.amount,p.registerId,p.reversalOf])]))}>Exportar movimentos em CSV</button><Panel title="Movimentos"><Table rows={[...resource.data.payments].sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)))} columns={[{label:'Data',render:r=>date(r.createdAt)},{label:'Tipo',render:r=>movementKinds[r.kind as keyof typeof movementKinds]},{label:'Descrição',render:r=>r.reason},{label:'Meio',render:r=>methods[r.method as keyof typeof methods]},{label:'Valor',render:r=>brl(r.amount)}]}/></Panel>
    <Panel title="Fechamentos"><Table rows={resource.data.registers.filter(r=>r.closedAt)} columns={[{label:'Fechado em',render:r=>date(r.closedAt)},{label:'Esperado',render:r=>brl(r.expectedAmount)},{label:'Contado',render:r=>brl(r.countedAmount)},{label:'Diferença',render:r=>brl(Number(r.countedAmount)-Number(r.expectedAmount))},{label:'Observação',render:r=>r.closingReason}]}/></Panel></>}
  </div>;
}

export {AdminEstoquePage as InventoryPage} from "@/components/admin/AdminEstoquePage";

export function LoyaltyPage(){
 const resource=useResource<Row[]>('/commercial/loyalty');
 const customers=useResource<Row[]>('/customers', fetchAllPages);
 const balances:Record<string,number>={};
 for(const row of resource.data??[]) balances[String(row.customerId)]=(balances[String(row.customerId)]??0)+Number(row.points);
 const ranked=(customers.data??[]).map<Row & { points: number }>(customer=>({...customer,points:balances[customer.id]??0})).sort((a,b)=>b.points-a.points);
 const positive=ranked.filter(customer=>customer.points>0);
 const inCirculation=Object.values(balances).reduce((sum,points)=>sum+points,0);
 const loyalizedRate=customers.data?.length?Math.round(positive.length/customers.data.length*100):0;
 const ready=!!resource.data&&!!customers.data;
 return <div className="space-y-6">
  <div className="flex flex-wrap items-end justify-between gap-4"><Heading title="Fidelidade e planos" detail="Planos, assinantes e programa de pontos em um único lugar."/><button type="button" disabled title="Cadastro de planos ainda não disponível" className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-on-accent opacity-60"><Plus size={16}/>Novo plano</button></div>
  <Status ready={ready} error={resource.error||customers.error}/>
  {ready&&<>
   <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
    <StatCard label="Assinaturas ativas" value="—" hint="Planos para clientes indisponíveis" icon={Crown}/>
    <StatCard label="Receita recorrente" value="—" hint="Sem cobrança recorrente" icon={ReceiptIcon}/>
    <StatCard label="Clientes fidelizados" value={`${loyalizedRate}%`} hint={`${positive.length} com saldo de pontos`} tone="positivo" icon={Award}/>
    <StatCard label="Pontos em circulação" value={inCirculation.toLocaleString('pt-BR')} hint="Saldo líquido registrado" icon={Award}/>
   </div>
   <nav aria-label="Seções de fidelidade" className="flex w-fit flex-wrap gap-1 rounded-lg border border-fog bg-white p-1 text-sm">
    <a href="#planos" className="rounded-md px-4 py-2 text-secondary hover:bg-surface-sunken">Planos</a>
    <a href="#clientes" className="rounded-md px-4 py-2 text-secondary hover:bg-surface-sunken">Assinantes</a>
    <a href="#programa-de-pontos" className="rounded-md bg-accent-subtle px-4 py-2 font-medium text-accent">Programa de pontos</a>
   </nav>
   <section id="planos" className="grid items-start gap-3 lg:grid-cols-3">
    {[
     {title:'Plano de fidelidade',period:'Benefícios recorrentes',icon:Award,detail:'Descontos e prioridade no agendamento.',features:['Benefícios por assinatura','Acúmulo de pontos bônus']},
     {title:'Assinatura premium',period:'Mensal',icon:Crown,detail:'Uma experiência completa para clientes frequentes.',features:['Serviços recorrentes','Vantagens exclusivas']},
     {title:'Pacote de serviços',period:'Créditos pré-pagos',icon:Scissors,detail:'Combos de serviços com condições especiais.',features:['Créditos por pacote','Agendamento facilitado']},
    ].map(plan=><article key={plan.title} className="rounded-xl border border-fog bg-white p-5">
     <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-accent-subtle text-accent"><plan.icon size={19}/></span><div><h2 className="font-semibold text-ink">{plan.title}</h2><p className="text-xs text-secondary">{plan.period}</p></div></div>
     <p className="mt-4 text-sm text-secondary">{plan.detail}</p><ul className="mt-3 space-y-1.5 text-sm text-secondary">{plan.features.map(feature=><li key={feature} className="flex gap-2"><span className="text-accent">•</span>{feature}</li>)}</ul>
     <div className="mt-5 flex items-center justify-between border-t border-fog pt-3"><span className="text-xs font-medium text-warning">Indisponível nesta versão</span><button type="button" disabled className="rounded-md border border-fog px-4 py-2 text-sm text-secondary opacity-60">Configurar</button></div>
    </article>)}
   </section>
   <section id="clientes" className="space-y-3">
    <div className="flex items-center gap-3"><h2 className="text-lg font-semibold text-ink">Assinantes</h2><span className="rounded-full bg-accent-subtle px-2.5 py-1 text-xs text-accent">{positive.length} clientes com pontos</span></div>
    <div className="overflow-hidden rounded-xl border border-fog bg-white"><Table rows={positive} columns={[{label:'Cliente',render:r=><span className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-full bg-accent-subtle text-xs font-semibold text-accent">{String(r.fullName??'?').split(/\s+/).slice(0,2).map(part=>part[0]).join('').toUpperCase()}</span><span className="font-medium text-ink">{r.fullName}</span></span>},{label:'Plano',render:()=> <span className="rounded-full bg-surface-sunken px-2 py-1 text-xs text-secondary">Não disponível</span>},{label:'Total gasto',render:()=> <span className="text-secondary">Não disponível</span>},{label:'Pontos',render:r=><span className="tabular-nums">{Number(r.points).toLocaleString('pt-BR')} pts</span>},{label:'Última visita',render:()=> <span className="text-secondary">Não disponível</span>},{label:'Status',render:()=> <span className="rounded-full bg-success-subtle px-2 py-1 text-xs text-success">Fidelizado</span>}]}/></div>
   </section>
   <section id="programa-de-pontos" className="space-y-3">
    <div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-ink">Programa de pontos</h2><span className="inline-flex items-center gap-2 rounded-lg border border-fog bg-white px-3 py-2 text-xs text-secondary"><SlidersHorizontal size={14}/>Regras atuais</span></div>
    <div className="grid gap-3 lg:grid-cols-2">
     <Panel title="Regras vigentes"><dl className="divide-y divide-fog text-sm">
      {[
       ['Pontos por real gasto','1 ponto por R$ 1,00'],
       ['Bônus por assinatura','Não disponível'],
       ['Expiração dos pontos','Sem expiração configurável'],
       ['Resgate','Até o saldo disponível'],
      ].map(([label,value])=><div key={label} className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between"><dt className="text-secondary">{label}</dt><dd className="font-medium text-ink">{value}</dd></div>)}
     </dl><p className="mt-3 text-xs text-secondary">Pacotes, bônus de assinatura, expiração e valor monetário de resgate não são configuráveis.</p></Panel>
     <Panel title="Ranking de pontos"><div className="space-y-4">{positive.slice(0,5).map((customer,index)=><div key={customer.id}>
      <div className="mb-2 flex items-center gap-3 text-sm"><span className="w-4 text-secondary">{index+1}</span><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-subtle text-xs font-semibold text-accent">{String(customer.fullName??'?').split(/\s+/).slice(0,2).map(part=>part[0]).join('').toUpperCase()}</span><span className="min-w-0 flex-1 truncate">{customer.fullName}</span><span className="rounded-full bg-surface-sunken px-2 py-1 text-xs text-secondary">{customer.points.toLocaleString('pt-BR')} pts</span></div>
      <div className="h-1.5 rounded-full bg-surface-sunken"><div className="h-full rounded-full bg-accent" style={{width:`${Math.max(5,(customer.points/Math.max(1,positive[0]?.points??1))*100)}%`}}/></div>
     </div>)}{!positive.length&&<p className="py-3 text-sm text-secondary">Ainda não há pontos acumulados.</p>}</div></Panel>
    </div>
   </section>
   <div className="grid gap-5 xl:grid-cols-2">
    <ActionForm title="Resgatar recompensa" fields={[{name:'customerId',label:'Cliente',options:options(customers.data??[],'fullName')},{name:'points',label:'Pontos inteiros',type:'number',step:'1',min:'1'},{name:'reason',label:'Recompensa entregue'}]} onSubmit={async(d,key)=>{await post('/commercial/loyalty/redeem',{...d,points:Number(d.points),requestKey:key});resource.reload();}}/>
    <Panel title="Extrato de pontos"><Table rows={[...(resource.data??[])].sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)))} columns={[{label:'Data',render:r=>date(r.createdAt)},{label:'Cliente',render:r=>customers.data?.find(c=>c.id===r.customerId)?.fullName??'Cliente indisponível'},{label:'Pontos',render:r=>Number(r.points)>0?`+${r.points}`:r.points},{label:'Origem / recompensa',render:r=>r.reason}]}/></Panel>
   </div>
  </>}
 </div>;
}
export function CrmPage(){const resource=useResource<{campaigns:Row[];birthdayCustomerIds:string[];inactiveCustomerIds:string[]}>('/commercial/crm');const customers=useResource<Row[]>('/customers', fetchAllPages);return <div className="space-y-5"><Heading title="CRM" detail="Aniversariantes do mês e clientes sem atendimento concluído nos últimos 60 dias. Campanhas são rascunhos: envio externo ainda não configurado."/><Status ready={!!resource.data} error={resource.error||customers.error}/>
 {resource.data&&<><div className="grid gap-5 lg:grid-cols-2">{[['Aniversariantes do mês',resource.data.birthdayCustomerIds],['Sem atendimento há 60 dias',resource.data.inactiveCustomerIds]].map(([title,ids])=><Panel key={String(title)} title={String(title)}><Table rows={(customers.data??[]).filter(c=>(ids as string[]).includes(c.id))} columns={[{label:'Cliente',render:r=>r.fullName}]}/></Panel>)}</div>
 <ActionForm title="Salvar rascunho de campanha" fields={[{name:'name',label:'Nome'},{name:'segment',label:'Público',options:kinds({BIRTHDAY_MONTH:'Aniversariantes do mês',INACTIVE_60_DAYS:'Sem atendimento há 60 dias'})},{name:'message',label:'Mensagem'}]} onSubmit={async d=>{await post('/commercial/campaigns',d);resource.reload();}}/>
 <Panel title="Rascunhos"><Table rows={resource.data.campaigns} columns={[{label:'Nome',render:r=>r.name},{label:'Mensagem',render:r=>r.message},{label:'Estado',render:()=> 'Rascunho — não enviado'}]}/></Panel></>}
 </div>;}
export function ReviewsPage(){const resource=useResource<Row[]>('/commercial/reviews');return <div className="space-y-5"><Heading title="Avaliações" detail="Avaliações de atendimentos concluídos, enviadas pelos próprios clientes."/><Status ready={!!resource.data} error={resource.error}/><Panel title="Avaliações recebidas"><Table rows={resource.data??[]} columns={[{label:'Data',render:r=>date(r.createdAt)},{label:'Nota',render:r=>`${r.rating}/5`},{label:'Comentário',render:r=>r.comment},{label:'Resposta',render:r=>r.reply||'Sem resposta'}]}/></Panel><ActionForm title="Responder avaliação" fields={[{name:'id',label:'Avaliação',options:(resource.data??[]).map(r=>({value:r.id,label:`${r.rating}/5 · ${r.comment}`}))},{name:'reason',label:'Resposta'}]} onSubmit={async d=>{await post(`/commercial/reviews/${d.id}/reply`,{reason:d.reason});resource.reload();}}/></div>;}
