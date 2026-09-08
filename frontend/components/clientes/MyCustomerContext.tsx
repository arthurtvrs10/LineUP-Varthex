"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
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
  loading: boolean;
  error?: string;
  reload: () => void;
};

const MyCustomerContext = createContext<MyCustomerState | undefined>(undefined);

export function MyCustomerProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<MeCustomerResponse>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    apiFetch<MeCustomerResponse>("/me/customer")
      .then((data) => {
        if (active) {
          setCustomer(data);
          setError(undefined);
        }
      })
      .catch((err) => {
        if (active) setError(err instanceof ApiError ? err.message : "Não foi possível carregar seus dados.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  return (
    <MyCustomerContext.Provider
      value={{ customer, loading, error, reload: () => setReloadKey((k) => k + 1) }}
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
