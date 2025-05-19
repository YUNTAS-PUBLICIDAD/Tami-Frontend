/**
 * @file useClientes.ts
 * @description Este archivo contiene el hook para obtener la lista de clientes.
 * @returns {Object} Un objeto que contiene la lista de clientes, un estado de carga y un mensaje de error.
 */

import { useState, useEffect } from "react";
import { getApiUrl, config } from "config";
import type Cliente from "../../../models/Clients.ts";

const useClientes = (trigger: boolean, page: number = 1) => {
  const [clientes, setClientes] = useState<Cliente[]>([]); // Cambia el tipo a Cliente[] para reflejar la estructura de datos
  const [totalPages, setTotalPages] = useState<number>(1); // Número total de páginas
  const [loading, setLoading] = useState<boolean>(true); // Estado de carga
  const [error, setError] = useState<string | null>(null); // Mensaje de error

  useEffect(() => {
    /**
     * Función para obtener la lista de clientes desde la API.
     * Maneja el estado de carga y errores.
     */
    const fetchClientes = async () => {
      setLoading(true);
      setError(null);

      /**
       * Obtiene el token de autenticación del localStorage y realiza la solicitud a la API.
       * Si no se encuentra el token, lanza un error.
       */
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No se encontró el token de autenticación");

        /**
         * Realiza la solicitud a la API para obtener la lista de clientes.
         */
        const url = `${getApiUrl(config.endpoints.clientes.list)}?page=${page}`;
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok)
          throw new Error(`Error al obtener clientes: ${response.statusText}`);

        /**
         * Convierte la respuesta a JSON y maneja los datos.
         */
        const data = await response.json();

        /**
         * Extrae la lista de clientes y el número total de páginas de la respuesta.
         * Si no hay datos, establece un array vacío y una página total de 1.
         */
        const clientesArray = data.data?.data || [];
        const totalPages = Math.ceil(data.data?.total / 10) || 1;
        setClientes(clientesArray);
        setTotalPages(totalPages);

        /**
         * Manejo de errores en la solicitud y respuesta.
         */
      } catch (err) {
        console.error("🚨 Error en fetchClientes:", err);
        setError(
          err instanceof Error ? err.message : "Ocurrió un error desconocido"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchClientes();
  }, [trigger, page]); //

  return {
    clientes, // Lista de clientes
    totalPages, // Número total de páginas
    loading, // Estado de carga
    error, // Mensaje de error
  };
};

export default useClientes;
