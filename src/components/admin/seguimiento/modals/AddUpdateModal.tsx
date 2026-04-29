/**
 * @file AddUpdateModal.tsx
 * @description Este componente es un modal que se utiliza para añadir o editar clientes.
 * Muestra un formulario con campos para el nombre, teléfono y correo electrónico.
 */

import useClienteForm from "../../../../hooks/admin/seguimiento/useClienteForm.ts";
import type Cliente from "../../../../models/Clients.ts";
import React from "react";
import { IoMdCloseCircle } from "react-icons/io";

{
  /* Interfaz de modals, Typescript */
}
interface AddDataModalProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  cliente: Cliente | null; // Cliente a editar o null para añadir uno nuevo
  onRefetch: () => void; // Función para actualizar la lista después de agregar o editar
}

const AddUpdateDataModal = ({
                              isOpen,
                              setIsOpen,
                              cliente,
                              onRefetch,
                            }: AddDataModalProps) => {
  const { formData, handleChange, handleSubmit, errors,resetForm } = useClienteForm(
      cliente,
      () => {
        onRefetch();
        setIsOpen(false);
            },
            isOpen
  );

    const handleClose = () => {
        setIsOpen(false);
        resetForm();  // limpia el formulario
    };
  if (!isOpen) return null;

    return (
        <div className="dialog-overlay">
            <div className="dialog w-full max-w-md md:max-w-xl !pt-0">
                <div className="dialog-header sticky top-0 z-10 flex items-center justify-between !mt-0">
                    <h4 className="dialog-title flex-1 text-center">
                        {cliente ? "Editar Cliente" : "Añadir Cliente"}
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
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className={`dark:!bg-gray-800 ${errors.name ? "border-red-500 focus:ring-red-400" : ""}`}
                                    placeholder="Ej. Juan Pérez"
                                />
                                <p className="text-red-500 text-xs mt-1 min-h-[1rem]">
                                    {errors.name || "\u00A0"}
                                </p>
                            </div>

                            <div className="form-input">
                                <label htmlFor="celular">Teléfono:</label>
                                <input
                                    id="celular"
                                    name="celular"
                                    type="text"
                                    value={formData.celular}
                                    onChange={handleChange}
                                    required
                                    className={`dark:!bg-gray-800 ${errors.celular ? "border-red-500 focus:ring-red-400" : ""}`}
                                    placeholder="Ej. 987654321"
                                />
                                <p className="text-red-500 text-xs mt-1 min-h-[1rem]">
                                    {errors.celular || "\u00A0"}
                                </p>
                            </div>

                            <div className="form-input md:col-span-2">
                                <label htmlFor="email">Gmail:</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className={`dark:!bg-gray-800 ${errors.email ? "border-red-500 focus:ring-red-400" : ""}`}
                                    placeholder="Ej. cliente@gmail.com"
                                />
                                <p className="text-red-500 text-xs mt-1 min-h-[1rem]">
                                    {errors.email || "\u00A0"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="submit"
                            className="admin-act-btn w-full sm:w-auto !text-base !px-6 !py-2"
                        >
                            {cliente ? "Guardar Cambios" : "Añadir Cliente"}
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