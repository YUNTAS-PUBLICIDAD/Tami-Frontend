/**
 * @file useUsuariosActions.ts
 * @description Este archivo contiene los hooks para las acciones de los Usuarios.
 */

import { getApiUrl, config } from "config"; // importa la configuración de la API
import type Usuario from "../../../models/Users"; // importa el modelo de Usuario

const useUsuarioAcciones = () => {

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
   * Funcion para añadir un Usuario
   */

  const addUsuario = async (
      UsuarioData: Partial<Usuario>
  ): Promise<Usuario> => {
    const token = getValidToken();
    const url = getApiUrl(config.endpoints.users.create);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(UsuarioData),
    });

    if (!response.ok) throw new Error("Error al agregar Usuario");

    const result: { data: Usuario } = await response.json();
    return result.data;
  };

  /**
   * Función para actualizar un Usuario, usando los tipos
   */

  const updateUsuario = async (
      id: number,
      updatedData: Partial<Usuario>
  ): Promise<Usuario> => {
    const token = getValidToken();
    const url = getApiUrl(config.endpoints.users.update(id));

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) throw new Error("Error al actualizar Usuario");

    const result: { data: Usuario } = await response.json();
    return result.data;
  };

  /**
   * Función para eliminar un Usuario, usando los tipos
   */

  const deleteUsuario = async (id: number): Promise<{ message: string }> => {
    const token = getValidToken();
    const url = getApiUrl(config.endpoints.users.delete(id));

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Error al eliminar Usuario");

    const result: { message: string } = await response.json();
    return result;
  };

  return {
    addUsuario,
    updateUsuario,
    deleteUsuario,
  };
};

export default useUsuarioAcciones;