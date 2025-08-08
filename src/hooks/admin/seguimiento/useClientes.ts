/**
 * @file useClientes.ts
 * @description Hook personalizado para obtener la lista paginada de clientes desde la API.
 */

import { useState, useEffect } from "react";
import { getApiUrl, config } from "config";
import type Cliente from "../../../models/Clients";

const useClientes = (trigger: boolean, page: number = 1, limit: number = 5) => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClientes = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No se encontró el token de autenticación");

        // 🔹 Enviamos también el límite al backend
        const url = `${getApiUrl(config.endpoints.clientes.list)}?page=${page}&limit=${limit}`;
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

        //Estructura flexible para adaptarse al backend
        const clientesArray: Cliente[] = Array.isArray(data.data)
            ? data.data
            : data.data?.data || [];

        // Calcular páginas totales basado en el total y el límite de 5
        const totalPages = data.data?.total
            ? Math.ceil(data.data.total / limit)
            : 1;

        setClientes(clientesArray);
        setTotalPages(totalPages);

        //console.table(clientesArray);
      } catch (err) {
        console.error("Error en fetchClientes:", err);
        setError(
            err instanceof Error ? err.message : "Ocurrió un error desconocido"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchClientes();
  }, [trigger, page, limit]);

  return {
    clientes,
    totalPages,
    loading,
    error,
  };
};

export default useClientes;