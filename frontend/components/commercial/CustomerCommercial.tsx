"use client";
import { Status, useResource, type Row } from "./Primitives";
import { ReviewForm } from "@/components/clientes/ReviewPrompt";
export function CustomerReview({appointmentId,onSaved}:{appointmentId:string;onSaved:()=>void}) {
 return <details className="mt-3"><summary className="cursor-pointer text-sm font-semibold text-accent-strong">Avaliar atendimento</summary><div className="mt-3"><ReviewForm appointmentId={appointmentId} onSaved={onSaved} /></div></details>;
}
export function CustomerCommercialSummary(){const resource=useResource<{points:number;paidAmount:number;loyalty:Row[]}>('/commercial/me');return <section className="mt-5 border border-fog bg-white p-5"><h2 className="text-lg font-semibold">Fidelidade e pagamentos</h2><Status ready={!!resource.data} error={resource.error}/>{resource.data&&<><p className="mt-3">Saldo: <strong>{resource.data.points} pontos</strong></p><p>Total de pagamentos registrados: {Number(resource.data.paidAmount).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</p><p className="mt-2 text-xs text-secondary">1 ponto por real inteiro em cada pagamento. Estornos revertem pontos.</p></>}</section>;}
