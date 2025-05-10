  /**
   * @file useusuarios.ts
   * @description Este archivo contiene el hook para obtener la lista de usuarios.
   * @returns {Object} Un objeto que contiene la lista de usuarios, un estado de carga y un mensaje de error.
   */

  import { useState, useEffect } from "react";
  import { getApiUrl, config } from "config";
  import type Usuario from "../../../models/Users";

  const useUsuarios = (trigger: boolean, page: number = 1) => {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]); // Cambia el tipo a usuario[] para reflejar la estructura de datos
    const [totalPages, setTotalPages] = useState<number>(1); // Número total de páginas
    const [loading, setLoading] = useState<boolean>(true); // Estado de carga
    const [error, setError] = useState<string | null>(null); // Mensaje de error

    useEffect(() => {
      console.log("Ejecutando fetchUsuarios, trigger:", trigger); // Debug log

      /**
       * Función para obtener la lista de usuarios desde la API.
       * Maneja el estado de carga y errores.
       */
      const fetchUsuarios = async () => {
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
           * Realiza la solicitud a la API para obtener la lista de usuarios.
           */
          const url = `${getApiUrl(config.endpoints.users.list)}?page=${page}`;
          console.log("Fetch URL:", url); // Debug log
          const response = await fetch(url, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok)
            throw new Error(`Error al obtener usuarios: ${response.statusText}`);

          /**
           * Convierte la respuesta a JSON y maneja los datos.
           */
          const data = await response.json();
          console.log("Datos recibidos:", data); // Debug log


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
    }, [trigger, page]);

    return {
      usuarios, // Lista de usuarios
      totalPages, // Número total de páginas
      loading, // Estado de carga
      error, // Mensaje de error
    };
  };

  export default useUsuarios;
