"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { selectShop, clearSelectedShop, type BookingShop } from "@/lib/client-barbershop";
import { apiFetch, ApiError } from "@/lib/api";

export type MeCustomerResponse = {
  customerId: string;
  tenantId: string;
  tenantName: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  status: "ACTIVE" | "ARCHIVED";
};

type MyCustomerState = {
  customer?: MeCustomerResponse;
  shop?: BookingShop;
  loading: boolean;
  error?: string;
  reload: () => void;
};

const MyCustomerContext = createContext<MyCustomerState | undefined>(undefined);

export function MyCustomerProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const email = session?.user?.email;
  const [shop, setShop] = useState<BookingShop>();
  const [customer, setCustomer] = useState<MeCustomerResponse>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (status !== "authenticated" || !email) return;
    let active = true;
    async function load() {
      setLoading(true);
      setCustomer(undefined);
      setError(undefined);
      setShop(undefined);
      try {
        const selected = await apiFetch<BookingShop | undefined>("/me/barbershop-selection");
        if (!active) return;
        if (!selected) { clearSelectedShop(email); return; }
        selectShop(email!, selected);
        setShop(selected);
        if (pathname === "/clientes/barbearias" || pathname === "/clientes/configuracoes/barbearia" || pathname === "/clientes/ajuda") return;
        const data = await apiFetch<MeCustomerResponse>("/me/customer");
        if (active) setCustomer(data);
      } catch (err) {
        // No membership yet is expected; booking remains available.
        if (active && !(err instanceof ApiError && err.status === 404))
          setError(err instanceof ApiError ? err.message : "Não foi possível carregar seus dados.");
      } finally { if (active) setLoading(false); }
    }
    void load();
    return () => { active = false; };
  }, [reloadKey, email, status, pathname]);

  return (
    <MyCustomerContext.Provider
      value={{ customer, shop, loading, error, reload: () => { setLoading(true); setReloadKey((k) => k + 1); } }}
    >
      {children}
    </MyCustomerContext.Provider>
  );
}

export function useMyCustomer() {
  const ctx = useContext(MyCustomerContext);
  if (!ctx) throw new Error("useMyCustomer precisa estar dentro de MyCustomerProvider");
  return ctx;
}
