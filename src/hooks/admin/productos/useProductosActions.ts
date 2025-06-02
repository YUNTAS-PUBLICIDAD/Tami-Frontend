/**
 * @file useProductosActions.ts
 * @description Este archivo contiene los hooks para las acciones de los productos.
 */

import { getApiUrl, config } from "config"; // importa la configuración de la API
import type Producto from "../../../models/Product.ts"; // importa el modelo de producto

const useProductoAcciones = () => {

    /**
     * Obtiene el token de autenticación del localStorage y realiza la solicitud a la API.
     * Si no se encuentra el token, lanza un error.
     */

    const getValidToken = () => {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No se encontró el token");
        return token;
    };

    /**
     * Funcion para añadir un producto
     */

    const addProducto = async (
        productoData: Partial<Producto>
    ): Promise<Producto> => {
        const token = getValidToken();
        const url = getApiUrl(config.endpoints.productos.create);

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(productoData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error en la respuesta:", errorData);
            throw new Error("Error al agregar producto");
        }

        const result: { data: Producto } = await response.json();
        return result.data;
    };

    /**
     * Función para actualizar un producto, usando los tipos
     */

    const updateProducto = async (
        id: number,
        updatedData: Partial<Producto>
    ): Promise<Producto> => {
        const token = getValidToken();
        const url = getApiUrl(config.endpoints.productos.update(id));

        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updatedData),
        });

        if (!response.ok) throw new Error("Error al actualizar producto");

        const result: { data: Producto } = await response.json();
        return result.data;
    };

    /**
     * Función para eliminar un producto, usando los tipos
     */

    const deleteProducto = async (id: number): Promise<{ message: string }> => {
        const token = getValidToken();
        const url = getApiUrl(config.endpoints.productos.delete(id));

        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) throw new Error("Error al eliminar producto");

        const result: { message: string } = await response.json();
        return result;
    };

    return {
        addProducto,
        updateProducto,
        deleteProducto,
    };
};

export default useProductoAcciones;