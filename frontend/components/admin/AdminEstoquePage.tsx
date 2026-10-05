"use client";
import {useState} from "react";
import {AlertTriangle,History,Package,Pencil,Plus,Search,ShoppingCart} from "lucide-react";
import {apiFetch} from "@/lib/api";
import {Modal} from "@/components/ui/Modal";
import {StatCard} from "@/components/ui/StatCard";
import {ActionForm,Heading,Panel,Status,Table,brl,date,kinds,options,post,useResource,type Row} from "@/components/commercial/Primitives";
const methods={CASH:"Dinheiro",PIX:"Pix registrado manualmente",CARD:"Cartão registrado manualmente"};
const button="inline-flex min-h-9 items-center justify-center gap-2 border border-fog bg-surface px-3 text-sm font-medium text-secondary hover:bg-surface-sunken disabled:opacity-50";
type Inventory = {products:Row[];movements:Row[];balances:Record<string,number>};
export function AdminEstoquePage(){
 const [editing,setEditing]=useState<Row>();
 const [dialog,setDialog]=useState<"create"|"move"|"sale"|"history">();
 const [selected,setSelected]=useState<Row>();
 const [search,setSearch]=useState("");

 const resource=useResource<Inventory>('/commercial/inventory');const submit=async(path:string,body:unknown)=>{await post(path,body);resource.reload();setDialog(undefined);};

 const products=resource.data?.products??[];
 const balance=(p:Row)=>resource.data?.balances[p.id]??0;
 const low=(p:Row)=>balance(p)<=Number(p.minimumStock);
 const lowCount=products.filter(p=>p.active&&low(p)).length;
 const normalize=(s:string)=>s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("pt-BR");
 const filtered=products.filter(p=>normalize([p.name,p.sku,p.category,p.supplier].join(" ")).includes(normalize(search.trim())));
 return <div className="space-y-5">
 <div className="flex flex-wrap items-center justify-between gap-4"><Heading title="Estoque" detail="Controle de produtos e movimentações"/><button type="button" className="inline-flex min-h-10 items-center gap-2 bg-accent px-4 text-sm font-semibold text-on-accent hover:bg-accent-hover" onClick={()=>setDialog("create")}><Plus size={16}/>Novo produto</button></div>
 <Status ready={!!resource.data} error={resource.error}/>
 {resource.data&&<>
 {lowCount>0&&<div role="status" className="flex items-center gap-3 border border-warning/40 bg-warning-subtle px-4 py-3 text-sm text-warning"><AlertTriangle size={18}/>{lowCount} produto(s) no estoque mínimo ou abaixo dele. Verifique e reponha.</div>}
 <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
 <StatCard label="Total de produtos" value={String(products.length)}/>
 <StatCard label="Estoque baixo" value={String(lowCount)}/>
 <StatCard label="Valor em estoque" value={brl(products.reduce((sum,p)=>sum+balance(p)*Number(p.cost),0))}/>
 <StatCard label="Valor de venda" value={brl(products.reduce((sum,p)=>sum+balance(p)*Number(p.price),0))}/>
 </div>
 <div className="flex flex-wrap items-center justify-between gap-3">
 <label className="flex min-h-10 w-full items-center gap-2 border border-fog bg-surface px-3 sm:w-80"><Search size={16}/><span className="sr-only">Buscar produto</span><input type="search" className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Buscar produto..." value={search} onChange={e=>setSearch(e.target.value)}/></label>
 <div className="flex flex-wrap gap-2"><button type="button" className={button} onClick={()=>setDialog("history")}><History size={16}/>Histórico</button><button type="button" className={button} disabled={!products.some(p=>p.active)} onClick={()=>setDialog("sale")}><ShoppingCart size={16}/>Vender produto</button></div>
 </div>
 <div className="overflow-x-auto border border-fog bg-surface">
 <table className="w-full min-w-[1000px] text-left text-sm"><caption className="sr-only">Produtos e posição atual do estoque</caption><thead className="bg-surface-sunken text-secondary"><tr>{["Produto","Categoria","Estoque atual","Mínimo","Custo","Preço","Margem","Status","Ações"].map(label=><th key={label} scope="col" className="px-4 py-4 text-xs font-medium">{label}</th>)}</tr></thead>
 <tbody>{filtered.map(p=>{
 const margin=Number(p.price)>0?(Number(p.price)-Number(p.cost))/Number(p.price)*100:null;
 return <tr key={p.id} className="border-t border-fog hover:bg-surface-sunken/50">
 <td className="px-4 py-3"><div className="flex items-center gap-3"><span className="grid size-9 shrink-0 place-items-center bg-accent-subtle text-accent"><Package size={18}/></span><div><span className="font-medium text-ink">{p.name}</span><p className="mt-0.5 text-xs text-secondary">{p.supplier||"Sem fornecedor"}{p.sku ? " · "+p.sku : ""}</p></div></div></td>
 <td className="px-4 py-3"><span className="bg-surface-sunken px-2 py-1 text-xs text-secondary">{p.category||"Sem categoria"}</span></td>
 <td className={"px-4 py-3 font-semibold tabular-nums "+(p.active&&low(p)?"text-danger":"text-ink")}>{balance(p)} un</td>
 <td className="px-4 py-3 text-secondary tabular-nums">{p.minimumStock} un</td>
 <td className="whitespace-nowrap px-4 py-3 text-secondary tabular-nums">{brl(p.cost)}</td>
 <td className="whitespace-nowrap px-4 py-3 tabular-nums">{brl(p.price)}</td>
 <td className="px-4 py-3"><span className={"px-2 py-1 text-xs tabular-nums "+(margin===null?"bg-surface-sunken text-secondary":margin>=0?"bg-success-subtle text-success":"bg-danger-subtle text-danger")}>{margin===null?"—":Math.round(margin)+"%"}</span></td>
 <td className="px-4 py-3"><span className={"px-2 py-1 text-xs "+(!p.active?"bg-surface-sunken text-secondary":low(p)?"bg-danger-subtle text-danger":"bg-success-subtle text-success")}>{!p.active?"Inativo":low(p)?"Baixo":"Ok"}</span></td>
 <td className="px-4 py-3"><div className="flex gap-2"><button type="button" className={button} aria-label={"Movimentar "+p.name} onClick={()=>{setSelected(p);setDialog("move");}}>Movimentar</button><button type="button" className={button} aria-label={"Editar "+p.name} onClick={()=>setEditing(p)}><Pencil size={14}/></button></div></td>
 </tr>;
 })}</tbody></table>
 {!filtered.length&&<p className="p-10 text-center text-sm text-secondary">{products.length?"Nenhum produto corresponde à busca.":"Nenhum produto cadastrado. Adicione seu primeiro produto para começar."}</p>}
 </div>
 <p className="text-xs text-secondary">{filtered.length} de {products.length} produto(s) · Valor em estoque pelo custo de referência. Margem sobre o preço de venda.</p>
 </>}
 {dialog==="create"&&<Modal open title="Novo produto" onClose={()=>setDialog(undefined)}><ActionForm title="Cadastrar produto" fields={[{name:'name',label:'Nome'},{name:'sku',label:'SKU',optional:true},{name:'category',label:'Categoria'},{name:'supplier',label:'Fornecedor'},{name:'cost',label:'Custo de referência (R$)',type:'number'},{name:'price',label:'Preço (R$)',type:'number'},{name:'minimumStock',label:'Estoque mínimo',type:'number',step:'1'}]} onSubmit={d=>submit('/commercial/products',{...d,cost:Number(d.cost),price:Number(d.price),minimumStock:Number(d.minimumStock)})}/></Modal>}
 {resource.data&&dialog==="move"&&<Modal open title="Movimentar estoque" onClose={()=>setDialog(undefined)}> <ActionForm title="Registrar movimento" fields={[{name:'productId',label:'Produto',value:selected?.id,options:options(resource.data.products,'name')},{name:'kind',label:'Tipo',options:kinds({ENTRY:'Entrada',CONSUMPTION:'Consumo em serviço',LOSS:'Perda',ADJUSTMENT_IN:'Ajuste positivo',ADJUSTMENT_OUT:'Ajuste negativo'})},{name:'quantity',label:'Quantidade inteira',type:'number',step:'1',min:'1',max:'1000000'},{name:'reason',label:'Motivo / origem'}]} onSubmit={(d,key)=>submit('/commercial/stock',{...d,quantity:Number(d.quantity),requestKey:key})}/></Modal>}
 {resource.data&&dialog==="sale"&&<Modal open title="Vender produto" onClose={()=>setDialog(undefined)}><ActionForm title="Vender produto" submitLabel="Confirmar venda e recebimento" fields={[{name:'productId',label:'Produto',options:options(resource.data.products.filter(p=>p.active),'name')},{name:'quantity',label:'Quantidade inteira',type:'number',step:'1',min:'1'},{name:'method',label:'Meio recebido',options:kinds(methods)},{name:'reason',label:'Descrição da venda'}]} onSubmit={(d,key)=>submit('/commercial/sales',{...d,quantity:Number(d.quantity),requestKey:key})}/></Modal>}
 {resource.data&&dialog==="history"&&<Modal open size="lg" title="Histórico de movimentações" onClose={()=>setDialog(undefined)}><Panel title="Histórico"><Table rows={resource.data.movements} columns={[{label:'Data',render:r=>date(r.createdAt)},{label:'Produto',render:r=>resource.data!.products.find(p=>p.id===r.productId)?.name},{label:'Quantidade',render:r=>r.quantity},{label:'Motivo',render:r=>r.reason}]}/></Panel></Modal>}
 {editing&&<Modal open title="Editar produto" onClose={()=>setEditing(undefined)}><ActionForm title="Dados e disponibilidade" fields={[
 {name:'name',label:'Nome',value:String(editing.name)}, {name:'sku',label:'SKU',optional:true,value:String(editing.sku??'')},
 {name:'category',label:'Categoria',value:String(editing.category)}, {name:'supplier',label:'Fornecedor',value:String(editing.supplier)},
 {name:'cost',label:'Custo de referência (R$)',type:'number',value:String(editing.cost)}, {name:'price',label:'Preço (R$)',type:'number',value:String(editing.price)},
 {name:'minimumStock',label:'Estoque mínimo',type:'number',step:'1',value:String(editing.minimumStock)},
 {name:'active',label:'Estado',value:String(editing.active),options:kinds({true:'Ativo',false:'Inativo — bloqueia novas vendas'})}
 ]} onSubmit={async d=>{await apiFetch(`/commercial/products/${editing.id}`,{method:'PUT',body:{product:{...d,cost:Number(d.cost),price:Number(d.price),minimumStock:Number(d.minimumStock)},active:d.active==='true',version:editing.version}});setEditing(undefined);resource.reload();}}/></Modal>}
 </div>;
}
