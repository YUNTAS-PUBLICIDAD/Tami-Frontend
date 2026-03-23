/**
 * @file AddUpdateModal.tsx
 * @description Este componente es un modal que se utiliza para añadir o editar usuarios.
 * Muestra un formulario con campos para el nombre, teléfono y correo electrónico.
 */

import useUsuariosForm from "../../../hooks/admin/usuarios/useUsuariosForm.ts";
import type Usuario from "../../../models/Users.ts";
import React from "react";
import { IoMdCloseCircle } from "react-icons/io";

{
  /* Interfaz de modals, Typescript */
}
interface AddDataModalProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  Usuario: Usuario | null; // Usuario a editar o null para añadir uno nuevo
  onRefetch: () => void; // Función para actualizar la lista después de agregar o editar
}

const AddUpdateDataModal = ({ isOpen, setIsOpen, Usuario, onRefetch }: AddDataModalProps) => {
  const { formData, handleChange, handleSubmit, resetForm } = useUsuariosForm(
    Usuario,
    () => {
      onRefetch();
      setIsOpen(false);
    },
    isOpen
  );

  const handleClose = () => {
    setIsOpen(false);
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog w-full max-w-md md:max-w-xl !pt-0">
        <div className="dialog-header sticky top-0 z-10 flex items-center justify-between !mt-0">
          <h4 className="dialog-title flex-1 text-center">
            {Usuario ? "Editar Usuario" : "Añadir Usuario"}
          </h4>
          <button
            className="text-white hover:text-red-400 transition-all duration-300 hover:cursor-pointer text-3xl md:text-4xl ml-2"
            onClick={handleClose}
            aria-label="Cerrar"
            type="button"
          >
            <IoMdCloseCircle />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="card !bg-white dark:!bg-gray-900/40 !border-gray-200 dark:!border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
              <div className="form-input">
                <label htmlFor="name">Nombres:</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="dark:!bg-gray-800"
                  placeholder="Ej. María Gómez"
                />
              </div>

              <div className="form-input">
                <label htmlFor="celular">Teléfono:</label>
                <input
                  id="celular"
                  type="text"
                  name="celular"
                  value={formData.celular}
                  onChange={handleChange}
                  required
                  className="dark:!bg-gray-800"
                  placeholder="Ej. 912345678"
                />
              </div>

              <div className="form-input md:col-span-2">
                <label htmlFor="email">Gmail:</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="dark:!bg-gray-800"
                  placeholder="Ej. usuario@gmail.com"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              className="admin-act-btn w-full sm:w-auto !text-base !px-6 !py-2"
            >
              {Usuario ? "Guardar Cambios" : "Añadir Usuario"}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="neutral-btn w-full sm:w-auto !text-base !px-6 !py-2 !bg-amber-100 !text-amber-900 !border-amber-300 hover:!bg-amber-200 hover:!text-amber-950 dark:!bg-gray-700 dark:!text-gray-100 dark:!border-gray-500 dark:hover:!bg-gray-600"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUpdateDataModal;
