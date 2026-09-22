"use client";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { downloadText } from "@/lib/csv";
import { ActionForm, brl, date, Panel, Table, type Row } from "./Primitives";

type ReceiptData = { appointmentId: string; establishment: string; unit: string; customer: string; date: string; items: {name:string;amount:number}[]; payments: Row[]; total:number;paid:number;remaining:number };
const means: Record<string,string> = { CASH:"Dinheiro", PIX:"Pix", CARD:"Cartão" };

export function Receipt({ appointments }: { appointments: { value:string;label:string }[] }) {
  const [receipt,setReceipt]=useState<ReceiptData>();
  const lines = receipt ? [
    "COMPROVANTE NÃO FISCAL", receipt.establishment, `Unidade: ${receipt.unit}`,
    `Cliente: ${receipt.customer}`, `Atendimento: ${receipt.appointmentId}`, `Data: ${date(receipt.date)}`, "",
    ...receipt.items.map(i=>`${i.name}: ${brl(i.amount)}`), "",
    `Total do atendimento: ${brl(receipt.total)}`, `Pago (líquido de estornos): ${brl(receipt.paid)}`, `Saldo a pagar: ${brl(receipt.remaining)}`, "",
    ...receipt.payments.map(p=>`${date(p.createdAt)} · ${means[String(p.method)]??p.method} · ${brl(p.amount)} · ${p.reason}`),
    "", "Não substitui documento fiscal. Pagamentos registrados manualmente pelo estabelecimento."
  ] : [];
  return <><ActionForm title="Comprovante não fiscal" submitLabel="Consultar comprovante" fields={[{name:"id",label:"Atendimento",options:appointments}]} onSubmit={async d=>setReceipt(await apiFetch<ReceiptData>(`/commercial/receipts/${d.id}`))}/>
    {receipt&&<Panel title="Comprovante não fiscal"><p>{receipt.establishment} · {receipt.unit}</p><p>{receipt.customer} · {date(receipt.date)}</p>
      <Table rows={receipt.items.map((item,index)=>({id:String(index),...item}))} columns={[{label:"Item",render:r=>r.name},{label:"Valor",render:r=>brl(r.amount)}]}/>
      <p className="mt-3">Total: {brl(receipt.total)} · Pago: {brl(receipt.paid)} · Saldo: {brl(receipt.remaining)}</p>
      <button type="button" className="mt-3 underline" onClick={()=>downloadText(`comprovante-${receipt.appointmentId}.txt`,lines.join("\r\n"),"text/plain;charset=utf-8")}>Baixar comprovante</button>
    </Panel>}
  </>;
}
