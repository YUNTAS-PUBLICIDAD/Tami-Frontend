/**
 * @file useClientes.ts
 * @description Hook personalizado para obtener la lista paginada de clientes desde la API.
 */

import { useState, useEffect } from "react";
import { config } from "config";
import apiClient from "../../../services/apiClient";
import type Cliente from "../../../models/Clients";

const useClientes = (trigger: boolean) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
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

        const clientesArray: Cliente[] = Array.isArray(data.data)
          ? data.data
          : data.data?.data || [];

        setClientes(clientesArray);
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
    loading,
    error,
  };
};

export default useClientes;