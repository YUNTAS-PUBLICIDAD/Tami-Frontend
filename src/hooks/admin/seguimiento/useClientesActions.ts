/**
 * @file useClientesActions.ts
 * @description Este archivo contiene los hooks para las acciones de los clientes.
 */

import { config } from "config"; // importa la configuración de la API
import apiClient from "../../../services/apiClient";
import type Clients from "../../../models/Clients.ts"; // importa el modelo de cliente

const useClienteAcciones = () => {
  /**
   * Funcion para añadir un cliente
   */
  const addCliente = async (
    clienteData: Partial<Clients>
  ): Promise<Clients> => {
    try {
      const response = await apiClient.post(config.endpoints.clientes.create, clienteData);
      return response.data.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new Error(JSON.stringify(error.response.data));
      }
      throw new Error("Error al agregar cliente");
    }
  };

  /**
   * Función para actualizar un cliente, usando los tipos
   */
  const updateCliente = async (
    id: number,
    updatedData: Partial<Clients>
  ): Promise<Clients> => {
    const response = await apiClient.put(config.endpoints.clientes.update(id), updatedData);
    return response.data.data;
  };

  /**
   * Función para eliminar un cliente, usando los tipos
   */
  const deleteCliente = async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete(config.endpoints.clientes.delete(id));
    return response.data;
  };

  return {
    addCliente,
    updateCliente,
    deleteCliente,
  };
};

export default useClienteAcciones;