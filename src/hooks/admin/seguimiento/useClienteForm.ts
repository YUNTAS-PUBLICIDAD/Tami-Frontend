import React, { useState, useEffect } from "react";
import useClienteAcciones from "./useClientesActions";
import type Cliente from "../../../models/Clients.ts";
import Swal from "sweetalert2";
import { origenCliente } from "@data/origenCliente";

const normalizePhoneDigits = (value: string) => {
  const onlyDigits = (value ?? "").replace(/\D/g, "");

  // Si viene con prefijo Perú (51) + 9 dígitos, lo quitamos para el formulario.
  if (onlyDigits.length === 11 && onlyDigits.startsWith("51")) {
    return onlyDigits.slice(2);
  }

  return onlyDigits;
};

const formatPhoneForStorage = (value: string) => {
  const localPhone = normalizePhoneDigits(value);

  if (localPhone.length !== 9) return null;

  return `+51 ${localPhone.slice(0, 3)} ${localPhone.slice(3, 6)} ${localPhone.slice(6)}`;
};

const useClienteForm = (
  cliente?: Cliente | null,
  onSuccess?: () => void,
  isOpen?: boolean
) => {
  type ClienteFormData = Pick<Cliente, "name" | "celular" | "email" | "source_id">;
  const [formData, setFormData] = useState<ClienteFormData>({
    name: "",
    celular: "",
    email: "",
  });

  // Estado para errores específicos por campo
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [isEditing, setIsEditing] = useState(false);
  const { addCliente, updateCliente } = useClienteAcciones();

  useEffect(() => {
    if (!isOpen) return;

    if (cliente) {
      setFormData({
        name: cliente.name,
        celular: normalizePhoneDigits(cliente.celular ?? ""),
        email: cliente.email,
      });
      setIsEditing(true);
      setErrors({});
    } else {
      resetForm();
    }
  }, [cliente, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === "celular") {
      const normalized = normalizePhoneDigits(e.target.value).slice(0, 9);
      setFormData({ ...formData, celular: normalized });
      setErrors({ ...errors, celular: "" });
      return;
    }

    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // Limpiar error al cambiar input
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({}); // Limpiar errores previos

    const { name, celular, email } = formData;

    if (!name.trim() || !celular.trim() || !email.trim()) {
      await Swal.fire({
        icon: "warning",
        title: "Campos obligatorios",
        text: "⚠️ Todos los campos son obligatorios.",
      });
      return;
    }

    const formattedPhone = formatPhoneForStorage(celular);

    if (!formattedPhone) {
      await Swal.fire({
        icon: "warning",
        title: "Teléfono inválido",
        text: "⚠️ Ingresa un celular válido de 9 dígitos. No necesitas escribir +51.",
      });
      return;
    }

    try {
      if (isEditing) {
        await updateCliente(cliente!.id, { name, celular: formattedPhone, email });
        await Swal.fire({
          icon: "success",
          title: "Cliente actualizado",
          text: "✅ Cliente actualizado correctamente",
        });
      } else {
        await addCliente({ name, celular: formattedPhone, email, source_id: origenCliente.ADMINISTRACION });
        await Swal.fire({
          icon: "success",
          title: "Cliente registrado",
          text: "✅ Cliente registrado exitosamente",
        });
      }

      onSuccess?.();
      resetForm();
    } catch (error: any) {
      console.error("❌ Error en la operación:", error);

      let parsedErrors: { [key: string]: string } = {};

      try {
        // Intenta parsear el mensaje JSON con detalles de error
        const errorData = JSON.parse(error.message);

        if (errorData.errors) {
          if (errorData.errors.name) parsedErrors.name = errorData.errors.name.join(" ");
          if (errorData.errors.celular) parsedErrors.celular = errorData.errors.celular.join(" ");
          if (errorData.errors.email) parsedErrors.email = errorData.errors.email.join(" ");
        } else if (errorData.message) {
          // Error general
          await Swal.fire({
            icon: "error",
            title: "Error",
            text: `❌ ${errorData.message}`,
          });
          return;
        } else {
          await Swal.fire({
            icon: "error",
            title: "Error",
            text: "❌ Error desconocido.",
          });
          return;
        }
      } catch {
        // No se pudo parsear JSON
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: `❌ ${error.message || "Error desconocido"}`,
        });
        return;
      }

      // Setear errores para mostrar inline en inputs
      setErrors({
        name: parsedErrors.name || "",
        celular: parsedErrors.celular || "",
        email: parsedErrors.email || "",
      });
    }
  };

  const resetForm = () => {
    setFormData({ name: "", celular: "", email: "" });
    setErrors({});
    setIsEditing(false);
  };

  return {
    formData,
    errors,       // Retornar errores para usar en UI
    handleChange,
    handleSubmit,
    resetForm
  };
};

export default useClienteForm;