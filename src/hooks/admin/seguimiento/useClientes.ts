/**
 * @file useClientes.ts
 * @description Hook personalizado para obtener la lista paginada de clientes desde la API.
 */

import { useState, useEffect } from "react";
import { config } from "config";
import apiClient from "../../../services/apiClient";
import type Cliente from "../../../models/Clients";
import type { GlobalTotals } from "../../../models/Clients";

const useClientes = (trigger: boolean) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [globalTotals, setGlobalTotals] = useState<GlobalTotals | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClientes = async () => {
      setLoading(true);
      setError(null);

      try {
        // Traemos todos los clientes usando el apiClient
        const response = await apiClient.get(config.endpoints.clientes.list);

        const data = response.data;

        // La estructura es: data.data.data.data para el array de clientes
        // data.data = { data: { current_page, data: [...], ... }, pagination, totals }
        const clientesArray: Cliente[] = data.data?.data?.data || [];
        const totals: GlobalTotals | null = data.data?.totals || null;

        setClientes(clientesArray);
        setGlobalTotals(totals);
      } catch (err) {
        console.error("Error en fetchClientes:", err);
        setError(err instanceof Error ? err.message : "Ocurrió un error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchClientes();
  }, [trigger]);

  return {
    clientes,
    globalTotals,
    loading,
    error,
  };
};

export default useClientes;