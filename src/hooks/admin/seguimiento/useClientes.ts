/**
 * @file useClientes.ts
 * @description Hook personalizado para obtener la lista paginada de clientes desde la API.
 */

import { useState, useEffect } from "react";
import { getApiUrl, config } from "config";
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
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No se encontró el token de autenticación");

        // Traemos todos los clientes (sin paginar en el backend)
        const url = `${getApiUrl(config.endpoints.clientes.list)}`;
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error al obtener clientes: ${response.statusText}`);
        }

        const data = await response.json();

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