"use client";

import Link from "next/link";
import Script from "next/script";
import { useState } from "react";
import { ShieldCheck, Link2, MessageCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useResource, Status } from "@/components/commercial/Primitives";
import { Modal } from "@/components/ui/Modal";
import { type Connection, type Dashboard, fieldClass,buttonClass,secondaryClass,panelClass,statusLabel } from "./types";

type FacebookSdk={init:(options:Record<string,unknown>)=>void;login:(callback:(response:{authResponse?:{code?:string}})=>void,options:Record<string,unknown>)=>void};
declare global {interface Window { FB?:FacebookSdk }}

export function WhatsAppSettings(){
 const resource=useResource<Connection>("/integrations/whatsapp");
 const [busy,setBusy]=useState(false),[feedback,setFeedback]=useState(""),[error,setError]=useState(""),[verifyToken,setVerifyToken]=useState(""),[disconnect,setDisconnect]=useState(false),[sdkReady,setSdkReady]=useState(false);
 const c=resource.data;
 async function action(fn:()=>Promise<void>){if(busy)return;setBusy(true);setError("");setFeedback("");try{await fn();resource.reload();}catch(e){setError(e instanceof Error?e.message:"Não foi possível concluir.");}finally{setBusy(false);}}
 async function connect(){
  if(!window.FB||!c)return;
  await action(async()=>{
   const {state}=await apiFetch<{state:string}>("/integrations/whatsapp/signup/start",{method:"POST"});
   const result=await new Promise<{code:string;wabaId:string;phoneId:string}>((resolve,reject)=>{
    let code="",wabaId="",phoneId="";
    const finish=()=>{if(code&&wabaId&&phoneId){cleanup();resolve({code,wabaId,phoneId});}};
    const listener=(event:MessageEvent)=>{if(!["https://www.facebook.com","https://web.facebook.com"].includes(event.origin))return;let data;try{data=typeof event.data==="string"?JSON.parse(event.data):event.data;}catch{return;}if(data?.type!=="WA_EMBEDDED_SIGNUP")return;if(data.event==="FINISH"){wabaId=data.data?.waba_id??"";phoneId=data.data?.phone_number_id??"";finish();}else if(data.event==="CANCEL"||data.event==="ERROR"){cleanup();reject(Error("Conexão não concluída na Meta. Tente novamente."));}};
    const timer=window.setTimeout(()=>{cleanup();reject(Error("Conexão expirada. Tente novamente."));},180000);
    function cleanup(){window.clearTimeout(timer);window.removeEventListener("message",listener);}
    window.addEventListener("message",listener);
    window.FB!.login(response=>{code=response.authResponse?.code??"";if(!code){cleanup();reject(Error("Autorização cancelada."));}else finish();},{config_id:c.configId,response_type:"code",override_default_response_type:true,extras:{setup:{},sessionInfoVersion:"3"}});
   });
   const connected=await apiFetch<Connection>("/integrations/whatsapp/signup/finish",{method:"POST",body:{...result,state}});
   if(connected.status!=="CONNECTED")throw Error(statusLabel[connected.status]??"Verifique a conexão na Meta");
   setFeedback("Conta conectada. Sincronize seus modelos no CRM e confirme o recebimento de eventos.");
  });
 }
 return <div className="max-w-4xl space-y-5">
  <Link href="/admin/configuracoes/integracoes" className="text-sm font-semibold text-accent-strong">Voltar às integrações</Link>
  <div><h1 className="text-2xl font-bold text-ink">WhatsApp Business</h1><p className="mt-1 text-sm text-secondary">Conecte a conta e o número da sua barbearia pela API oficial da Meta.</p></div>
  <Status ready={!!c} error={resource.error}/>
  {error&&<p role="alert" className="rounded-[10px] bg-danger-subtle p-4 text-sm text-danger">{error}</p>}{feedback&&<p role="status" className="rounded-[10px] bg-success-subtle p-4 text-sm text-success">{feedback}</p>}
  {c&&<>
   {c.embeddedReady&&<Script src="https://connect.facebook.net/pt_BR/sdk.js" strategy="afterInteractive" onReady={()=>{window.FB?.init({appId:c.appId,version:c.graphVersion,cookie:false,xfbml:false});setSdkReady(true);}} onError={()=>setError("Não foi possível carregar a conexão da Meta. Verifique bloqueadores do navegador.")} />}
   <section className={panelClass}><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="flex items-center gap-2 font-semibold"><MessageCircle size={20}/>Sua conta WhatsApp</h2><p className="mt-2 text-sm text-secondary">{statusLabel[c.status]??c.status}</p><p className="mt-1 text-sm">{c.businessName||"Nenhuma conta validada"} {c.displayPhone&&`· ${c.displayPhone}`}</p><p className="mt-1 text-xs text-secondary">{c.testedAt?`Último teste: ${new Date(c.testedAt).toLocaleString("pt-BR")}`:"Conexão ainda não testada"}</p>{c.quality&&<p className="mt-1 text-xs text-secondary">Qualidade informada pela Meta: {c.quality}</p>}</div><button disabled={busy||!c.embeddedReady||!sdkReady} onClick={connect} className={buttonClass}><Link2 size={16}/>Conectar com a Meta</button></div>
    {!c.embeddedReady&&<p className="mt-4 text-sm text-secondary">A conexão guiada depende da configuração do aplicativo Meta do LineUp. Você pode usar a configuração manual abaixo.</p>}
    {!c.encryptionReady&&<p role="alert" className="mt-3 text-sm text-danger">O operador do LineUp precisa habilitar a proteção de credenciais antes de conectar uma conta.</p>}
   </section>
   <details className={panelClass} open={!c.configured}><summary className="cursor-pointer font-semibold text-ink">Configuração manual avançada</summary>
    <p className="mt-3 text-sm text-secondary">Cadastre as credenciais da sua própria conta Meta. O token fica criptografado no backend e não será exibido novamente.</p>
    <form key={`${c.phoneId}-${c.wabaId}`} className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={e=>{e.preventDefault();const form=e.currentTarget;const data=Object.fromEntries(new FormData(form));void action(async()=>{const saved=await apiFetch<{verifyToken:string}>("/integrations/whatsapp",{method:"PUT",body:data});setVerifyToken(saved.verifyToken);(form.elements.namedItem("accessToken") as HTMLInputElement).value="";(form.elements.namedItem("appSecret") as HTMLInputElement).value="";setFeedback("Credenciais salvas. Configure o webhook e teste a conexão.");});}}>
     <label className="space-y-1 text-sm">ID da conta WhatsApp Business (WABA)<input className={fieldClass} name="wabaId" required pattern="[0-9]+" defaultValue={c.wabaId??""}/></label>
     <label className="space-y-1 text-sm">ID do número (Phone Number ID)<input className={fieldClass} name="phoneId" required pattern="[0-9]+" defaultValue={c.phoneId??""}/></label>
     <label className="space-y-1 text-sm">Token de acesso da Meta<input className={fieldClass} name="accessToken" type="password" autoComplete="new-password" maxLength={4096} required={!c.configured} placeholder={c.configured?"Cadastrado. Preencha para substituir":"Cole seu token de acesso"}/></label>
     <label className="space-y-1 text-sm">Segredo do aplicativo Meta<input className={fieldClass} name="appSecret" type="password" autoComplete="new-password" maxLength={2048} required={!c.configured} placeholder={c.configured?"Cadastrado. Preencha para substituir":"Usado para validar os eventos recebidos"}/></label>
     <div className="flex flex-wrap gap-2 sm:col-span-2"><button disabled={busy||!c.encryptionReady} className={buttonClass}>Salvar credenciais</button><a href="https://developers.facebook.com/documentation/business-messaging/whatsapp/" target="_blank" rel="noreferrer" className={secondaryClass}>Como obter as credenciais</a></div>
    </form>
   </details>
   <section className={panelClass}><h2 className="flex items-center gap-2 font-semibold"><ShieldCheck size={19}/>Conexão e atualizações de entrega</h2><p className="mt-2 text-sm text-secondary">O teste verifica as credenciais e o número, sem enviar mensagens.</p><button disabled={busy||!c.configured} className={`${secondaryClass} mt-3`} onClick={()=>void action(async()=>{const result=await apiFetch<Connection>("/integrations/whatsapp/test",{method:"POST"});if(result.status!=="CONNECTED")throw Error(statusLabel[result.status]??result.status);setFeedback("Credenciais e número verificados com sucesso.");})}>Testar conexão</button>
    <p className="mt-4 text-sm">Webhook: <strong>{c.webhookVerified?"Verificado":"Aguardando configuração"}</strong></p><p className="mt-1 text-xs text-secondary">{c.webhookAt?`Último evento: ${new Date(c.webhookAt).toLocaleString("pt-BR")}`:"Nenhum evento recebido ainda"}</p>
    <label className="mt-3 block text-sm">URL de retorno<input readOnly className={`${fieldClass} mt-1`} value={c.webhookUrl??"Disponível após configurar a URL pública HTTPS do LineUp"}/></label>
    {verifyToken&&<div className="mt-3 rounded-[10px] bg-surface-sunken p-3"><p className="text-sm font-semibold">Token de verificação — copie agora para o aplicativo Meta</p><p className="mt-2 break-all font-mono text-xs">{verifyToken}</p><button className={`${secondaryClass} mt-2`} onClick={()=>navigator.clipboard.writeText(verifyToken).then(()=>setFeedback("Token de verificação copiado.")).catch(()=>setError("Não foi possível copiar. Selecione o texto manualmente."))}>Copiar token</button></div>}
    <p className="mt-3 text-xs text-secondary">No aplicativo Meta, configure o webhook e assine o campo messages. No ambiente local, os retornos dependem de uma URL HTTPS pública configurada pelo operador.</p>
   </section>
   {c.configured&&<TestMessage connected={c.status==="CONNECTED"} onDone={message=>setFeedback(message)}/>}
   <section className={panelClass}><h2 className="font-semibold">Custos por mensagem</h2><p className="mt-2 text-sm text-secondary">A Meta pode cobrar por mensagens entregues conforme categoria, país de destino e tabela vigente. Esses custos são separados do plano do LineUp. Testar a conexão não envia mensagens; enviar uma mensagem de teste pode gerar cobrança.</p><a href="https://whatsappbusiness.com/products/platform-pricing/" target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-semibold text-accent-strong">Consultar preços oficiais da Meta</a></section>
   <div className="flex flex-wrap gap-3"><Link className={buttonClass} href="/admin/crm">Abrir CRM & WhatsApp</Link>{c.configured&&<button className={secondaryClass} disabled={busy} onClick={()=>setDisconnect(true)}>Desconectar WhatsApp</button>}</div>
  </>}
  {disconnect&&<Modal open title="Desconectar WhatsApp?" onClose={()=>{if(!busy)setDisconnect(false);}}><p className="text-sm text-secondary">As automações serão pausadas e os envios ainda na fila serão cancelados. O histórico será preservado. Envios já em andamento podem terminar.</p><div className="mt-5 flex justify-end gap-2"><button disabled={busy} className={secondaryClass} onClick={()=>setDisconnect(false)}>Cancelar</button><button disabled={busy} className={buttonClass} onClick={()=>void action(async()=>{await apiFetch("/integrations/whatsapp",{method:"DELETE"});setDisconnect(false);setVerifyToken("");setFeedback("WhatsApp desconectado.");})}>Confirmar desconexão</button></div></Modal>}
 </div>;
}

function TestMessage({connected,onDone}:{connected:boolean;onDone:(message:string)=>void}){
 const resource=useResource<Dashboard>("/integrations/whatsapp/dashboard");const [templateId,setTemplateId]=useState("");const [error,setError]=useState("");const [busy,setBusy]=useState(false);const [key,setKey]=useState(()=>crypto.randomUUID());
 const templates=resource.data?.templates.filter(t=>t.status==="APPROVED"&&t.supported)??[];const selected=templates.find(t=>t.id===templateId);
 return <section className={panelClass}><h2 className="font-semibold">Enviar mensagem de teste</h2><p className="mt-2 text-sm text-secondary">Use um destinatário autorizado. Se não houver modelos, sincronize-os no CRM primeiro.</p><form className="mt-4 space-y-3" onSubmit={async e=>{e.preventDefault();if(busy)return;const d=new FormData(e.currentTarget);setBusy(true);setError("");try{await apiFetch("/integrations/whatsapp/test-message",{method:"POST",body:{templateId,phone:d.get("phone"),parameters:Array.from({length:selected?.parameterCount??0},(_,i)=>d.get(`p${i}`)),requestKey:key,authorized:d.get("authorized")==="on"}});setKey(crypto.randomUUID());onDone("Teste adicionado à fila. Acompanhe a entrega no histórico do CRM.");}catch(err){setError(err instanceof Error?err.message:"Falha ao enviar teste.");}finally{setBusy(false);}}}>
  <label className="block text-sm">Telefone com DDI e DDD<input required name="phone" placeholder="5511999999999" className={fieldClass}/></label><label className="block text-sm">Modelo aprovado<select required value={templateId} onChange={e=>{setTemplateId(e.target.value);setKey(crypto.randomUUID());}} className={fieldClass}><option value="">Selecione</option>{templates.map(t=><option key={t.id} value={t.id}>{t.name} · {t.language}</option>)}</select></label>
  {selected&&<p className="rounded-[10px] bg-surface-sunken p-3 text-sm">{selected.body}</p>}{Array.from({length:selected?.parameterCount??0},(_,i)=><label key={i} className="block text-sm">Variável {i+1}<input required maxLength={500} name={`p${i}`} className={fieldClass}/></label>)}
  <label className="flex gap-2 text-sm"><input type="checkbox" name="authorized" required/>O destinatário autorizou este teste e estou ciente dos possíveis custos da Meta.</label>{error&&<p role="alert" className="text-sm text-danger">{error}</p>}{resource.error&&<p role="alert" className="text-sm text-danger">{resource.error}</p>}<button disabled={busy||!connected||!selected} className={buttonClass}>{busy?"Enfileirando…":"Enviar teste"}</button>
 </form></section>;
}
