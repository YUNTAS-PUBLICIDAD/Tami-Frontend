/**
 * @file useProductos.ts
 * @description Este archivo contiene el hook para obtener la lista de productos.
 * @returns {Object} Un objeto que contiene la lista de productos, un estado de carga y un mensaje de error.
 */

import { useState, useEffect } from "react";
import { getApiUrl, config } from "config";
import type Producto from "../../../models/Product.ts";

const useProductos = (trigger: boolean, page: number = 1) => {
    const [productos, setProductos] = useState<Producto[]>([]); // Cambia el tipo a Producto[] para reflejar la estructura de datos
    const [totalPages, setTotalPages] = useState<number>(1); // Número total de páginas
    const [loading, setLoading] = useState<boolean>(true); // Estado de carga
    const [error, setError] = useState<string | null>(null); // Mensaje de error

    useEffect(() => {
        /**
         * Función para obtener la lista de productos desde la API.
         * Maneja el estado de carga y errores.
         */
        const fetchProductos = async () => {
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
                 * Realiza la solicitud a la API para obtener la lista de productos.
                 */
                const url = `${getApiUrl(config.endpoints.productos.list)}?page=${page}`;
                const response = await fetch(url, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                });

                if (!response.ok)
                    throw new Error(`Error al obtener productos: ${response.statusText}`);

                /**
                 * Convierte la respuesta a JSON y maneja los datos.
                 */
                const data = await response.json();

                /**
                 * Extrae la lista de productos y el número total de páginas de la respuesta.
                 * Si no hay datos, establece un array vacío y una página total de 1.
                 */
                const productosArray = Array.isArray(data.data) ? data.data : data.data?.productos || [];
                const totalPages = Math.ceil(data.data?.total / 10) || 1;
                setProductos(productosArray);
                setTotalPages(totalPages);

            } catch (err) {
                console.error("🚨 Error en fetchProductos:", err);
                setError(
                    err instanceof Error ? err.message : "Ocurrió un error desconocido"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProductos();
    }, [trigger, page]);

    return {
        productos, // Lista de productos
        totalPages, // Número total de páginas
        loading, // Estado de carga
        error, // Mensaje de error
    };
};

export default useProductos;