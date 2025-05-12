import { getApiUrl, config } from "config";
import type Usuarios from "../../../models/Users.ts";

const useUsuarioAcciones = () => {
  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No hay token de autenticación");
    return token;
  };

  // Cambiamos el tipo para aceptar datos parciales sin id
  const addUsuario = async (usuarioData: Omit<Partial<Usuarios>, "id">) => {
    try {
      const response = await fetch(getApiUrl(config.endpoints.users.create), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify(usuarioData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear usuario");
      }

      return await response.json();
    } catch (error) {
      console.error("Error en addUsuario:", error);
      throw error;
    }
  };

  // También cambiamos este para que acepte datos parciales
  const updateUsuario = async (id: number, data: Partial<Usuarios>) => {
    const response = await fetch(getApiUrl(config.endpoints.users.update(id)), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error("Error al actualizar usuario");
    return await response.json();
  };

  const deleteUsuario = async (id: number) => {
    const response = await fetch(getApiUrl(config.endpoints.users.delete(id)), {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${getToken()}`
      }
    });

    if (!response.ok) throw new Error("Error al eliminar usuario");
    return { success: true };
  };

  return { addUsuario, updateUsuario, deleteUsuario };
};

export default useUsuarioAcciones;