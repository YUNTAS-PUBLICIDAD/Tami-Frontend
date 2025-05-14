import React, { useState, useEffect } from "react";
import useUsuarioAcciones from "./useUsuariosActions";
import type Usuarios from "../../../models/Users";
import Swal from "sweetalert2";

const useUsuarioForm = (usuario?: Usuarios | null, onSuccess?: () => void) => {
  type FormData = {
    name: string;
    celular: string;
    email: string;
    // rol: string;
  };
  const [formData, setFormData] = useState<FormData>({
    name: "",
    celular: "",
    email: "",
    // rol: "USER",
  });

  const [isEditing, setIsEditing] = useState(false);
  const { addUsuario, updateUsuario } = useUsuarioAcciones();

  useEffect(() => {
    if (usuario) {
      console.log("Cargando usuario para editar:", usuario);
      setFormData({
        name: usuario.name,
        celular: usuario.celular || "",
        email: usuario.email,
        // rol: usuario.rol || "USER",
      });
      setIsEditing(true);
    } else {
      resetForm();
      setIsEditing(false);
    }
  }, [usuario]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, celular, email} = formData;

    if (!name.trim() || !celular.trim() || !email.trim()) {
      alert("⚠️ Todos los campos son obligatorios.");
      return;
    }

    if (!/^\d+$/.test(celular)) {
      alert("⚠️ El teléfono solo debe contener números.");
      return;
    }

    try {
      if (isEditing && usuario) {
        const response = await updateUsuario(usuario.id, { name, celular, email });
        console.log("Respuesta de la API:", response);
        Swal.fire({
          icon: "success",
          title: "Usuario actualizado",
          text: "Los cambios se guardaron correctamente",
        });
        console.log("Enviando datos a la API:", { name, celular, email });
      } else {
        await addUsuario({ name, celular, email});
        Swal.fire({
          icon: "success",
          title: "Usuario creado",
          text: "El nuevo usuario fue registrado",
        });
      }

      // CRÍTICO: Asegúrate de llamar a onSuccess después de la operación exitosa
      if (typeof onSuccess === 'function') {
        console.log("Llamando a onSuccess para actualizar la lista"); // Debug log
        onSuccess();
      } else {
        console.warn("onSuccess no es una función o no está definida"); // Debug log
      }
      resetForm();
    } catch (error: any) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Ocurrió un error",
      });
    }
  };

  const resetForm = () => {
    setFormData({ name: "", celular: "", email: ""});
    setIsEditing(false);
  };

  return {
    formData,
    handleChange,
    handleSubmit,
  };
};

export default useUsuarioForm;