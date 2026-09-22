"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
type Slot = {startAt:string;endAt:string};
export function useAvailableSlots(barberId:string, serviceId:string, day?:string) {
 const key = barberId && serviceId && day ? `/barbers/${barberId}/availability?${new URLSearchParams({date:day,serviceId})}` : null;
 const [result,setResult]=useState<{key:string;slots:Slot[];error?:string}>();
 useEffect(()=>{if(!key)return;const controller=new AbortController();apiFetch<Slot[]>(key,{signal:controller.signal}).then(slots=>{if(!controller.signal.aborted)setResult({key,slots});}).catch(error=>{if(!controller.signal.aborted)setResult({key,slots:[],error:error instanceof Error?error.message:'Não foi possível carregar os horários.'});});return()=>controller.abort();},[key]);
 return {slots:key&&result?.key===key?result.slots:[],loading:Boolean(key&&result?.key!==key),error:key&&result?.key===key?result.error:undefined};
}
