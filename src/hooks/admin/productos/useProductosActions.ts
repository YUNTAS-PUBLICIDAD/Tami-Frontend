/**
 * @file useProductosActions.ts
 * @description Este archivo contiene los hooks para las acciones de los productos.
 */

import { config } from "config"; // importa la configuración de la API
import apiClient from "../../../services/apiClient";
import type Producto from "../../../models/Product.ts"; // importa el modelo de producto

const useProductoAcciones = () => {
  /**
   * Funcion para añadir un producto usando FormData
   */
  const addProducto = async (productoData: FormData): Promise<Producto> => {
    const response = await apiClient.post(config.endpoints.productos.create, productoData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data.data;
  };

  /**
   * Función para actualizar un producto usando FormData
   */
  const updateProducto = async (
    id: number,
    updatedData: FormData
  ): Promise<Producto> => {
    const response = await apiClient.post(config.endpoints.productos.update(id), updatedData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data.data;
  };

  /**
   * Función para eliminar un producto, usando los tipos
   */
  const deleteProducto = async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete(config.endpoints.productos.delete(id));
    return response.data;
  };

  return {
    addProducto,
    updateProducto,
    deleteProducto,
  };
};

export default useProductoAcciones;
