/**
 * @file useUsuarioForm.ts
 * @description Este hook maneja el formulario para añadir o editar Usuarios.
 * Maneja el estado del formulario, la validación de los campos y la lógica de envío.
 */

import { useState, useEffect } from "react";
import useUsuarioAcciones from "./useUsuariosActions";
import type Usuario from "../../../models/Users";
/**
 * Funcion para manejar el formulario de Usuario 
 */
const useUsuarioForm = (usuario?: Usuario | null, onSuccess?: () => void) => {
  type UsuarioFormData = Pick<Usuario, "name" | "celular" | "email" | "rol">;

  /**
   * Estado para manejar los datos del formulario.
   * Inicialmente se establece como un objeto vacío.
   */
  const [formData, setFormData] = useState<UsuarioFormData>({
    name: "",
    celular: "",
    email: "",
    rol: "USER", // Se establece un rol por defecto
  });

  const [isEditing, setIsEditing] = useState(false); // Estado para manejar si estamos editando o añadiendo un Usuario
  const { addUsuario, updateUsuario } = useUsuarioAcciones(); // Importamos las funciones de los fetch para añadir y actualizar Usuarios

  /**
   * Efecto para manejar la carga inicial del formulario.
   * Si se pasa un Usuario, se cargan sus datos en el formulario.
   */
  useEffect(() => {
    if (usuario) {
      
      /**
       * Si hay un Usuario, cargamos sus datos en el formulario.
       */
      setFormData({
        name: usuario.name,
        celular: usuario.celular,
        email: usuario.email,
        rol: usuario.rol,
      });
      setIsEditing(true);
    } else {
      /**
       * Si no hay Usuario, reiniciamos el formulario 
       * y establecemos el estado de edición en falso.
       */
      resetForm();
      setIsEditing(false);
    }
  }, [usuario]);

  /**
   * Función para manejar los cambios en los inputs del formulario.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * Función para manejar el envío del formulario.
   * Valida los campos y llama a las funciones de añadir o actualizar Usuario.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevenimos el comportamiento por defecto del formulario
    const { name, celular, email } = formData; // Desestructuramos los datos del formulario

    /**
     * Validación de los campos del formulario.
     */
    if (!name.trim() || !celular.trim() || !email.trim()) {
      alert("⚠️ Todos los campos son obligatorios.");
      return;
    }

    /**
     * Validación del formato del email.
     */
    if (!/^\d+$/.test(celular)) {
      alert("⚠️ El teléfono solo debe contener números.");
      return;
    }

    try {
      if (isEditing) {
        /**
         * Si estamos editando un Usuario, llamamos a la función de actualización.
         */
        await updateUsuario(usuario!.id, { name, celular, email });
        alert("✅ Usuario actualizado correctamente");
      } else {
        /**
         * Si estamos añadiendo un nuevo Usuario, llamamos a la función de añadir.
         */
        await addUsuario({ name, celular, email });
        alert("✅ Usuario registrado exitosamente");
      }

      onSuccess?.(); // Llamamos a la función de éxito si existe
      resetForm(); // Reiniciamos el formulario después de la operación

    /**
     * Manejo de errores en la operación de añadir o actualizar Usuario.
     */
    } catch (error: any) {
      console.error("❌ Error en la operación:", error);
      alert(`❌ Error: ${error.message || "Error desconocido"}`);
    }
  };

  /**
   * Función para reiniciar el formulario.
   * Limpia los datos del formulario y establece el estado de edición en falso.
   */
  const resetForm = () => {
    setFormData({ name: "", celular: "", email: "" , rol: "USER" });
    setIsEditing(false);
  };

  return {
    formData, // Retornamos los datos del formulario
    handleChange, // Retornamos la función para manejar los cambios en los inputs
    handleSubmit, // Retornamos la función para manejar el envío del formulario
  };
};

export default useUsuarioForm;
