/**
 * @file useusuarios.ts
 * @description Este archivo contiene el hook para obtener la lista de usuarios.
 * @returns {Object} Un objeto que contiene la lista de usuarios, un estado de carga y un mensaje de error.
 */

import { useState, useEffect } from "react";
import { config } from "config";
import apiClient from "../../../services/apiClient";
import type Usuario from "../../../models/Users";

const useUsuarios = (trigger: boolean, page: number = 1) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]); // Cambia el tipo a usuario[] para reflejar la estructura de datos
  const [totalPages, setTotalPages] = useState<number>(1); // Número total de páginas
  const [loading, setLoading] = useState<boolean>(true); // Estado de carga
  const [error, setError] = useState<string | null>(null); // Mensaje de error

  useEffect(() => {
    /**
     * Función para obtener la lista de usuarios desde la API.
     * Maneja el estado de carga y errores.
     */
    const fetchUsuarios = async () => {
      setLoading(true);
      setError(null);

      try {
        /**
         * Realiza la solicitud a la API para obtener la lista de usuarios usando apiClient.
         */
        const response = await apiClient.get(`${config.endpoints.users.list}?page=${page}`);

        /**
         * Convierte la respuesta a JSON y maneja los datos.
         */
        const data = response.data;

        /**
         * Extrae la lista de usuarios y el número total de páginas de la respuesta.
         * Si no hay datos, establece un array vacío y una página total de 1.
         */
        const UsuariosArray = data.data?.data || [];
        const totalPages = Math.ceil(data.data?.total / 10) || 1;
        setUsuarios(UsuariosArray);
        setTotalPages(totalPages);

        /**
         * Manejo de errores en la solicitud y respuesta.
         */
      } catch (err) {
        console.error("🚨 Error en fetchusuarios:", err);
        setError(
          err instanceof Error ? err.message : "Ocurrió un error desconocido"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, [trigger, page]); //

  return {
    usuarios, // Lista de usuarios
    totalPages, // Número total de páginas
    loading, // Estado de carga
    error, // Mensaje de error
  };
};

export default useUsuarios;