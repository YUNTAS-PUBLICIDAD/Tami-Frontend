/**
 * @file useUsuariosActions.ts
 * @description Este archivo contiene los hooks para las acciones de los Usuarios.
 */

import { config } from "config"; // importa la configuración de la API
import apiClient from "../../../services/apiClient";
import type Usuario from "../../../models/Users"; // importa el modelo de Usuario

const useUsuarioAcciones = () => {
  /**
   * Funcion para añadir un Usuario
   */
  const addUsuario = async (
    UsuarioData: Partial<Usuario>
  ): Promise<Usuario> => {
    const response = await apiClient.post(config.endpoints.users.create, UsuarioData);
    return response.data.data;
  };

  /**
   * Función para actualizar un Usuario, usando los tipos
   */
  const updateUsuario = async (
    id: number,
    updatedData: Partial<Usuario>
  ): Promise<Usuario> => {
    const response = await apiClient.put(config.endpoints.users.update(id), updatedData);
    return response.data.data;
  };

  /**
   * Función para eliminar un Usuario, usando los tipos
   */
  const deleteUsuario = async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete(config.endpoints.users.delete(id));
    return response.data;
  };

  return {
    addUsuario,
    updateUsuario,
    deleteUsuario,
  };
};

export default useUsuarioAcciones;