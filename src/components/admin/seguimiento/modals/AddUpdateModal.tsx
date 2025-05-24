/**
 * @file AddUpdateModal.tsx
 * @description Este componente es un modal que se utiliza para añadir o editar clientes.
 * Muestra un formulario con campos para el nombre, teléfono y correo electrónico.
 */

import useClienteForm from "../../../../hooks/admin/seguimiento/useClienteForm.ts";
import type Cliente from "../../../../models/Clients.ts";
import React from "react";

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
  const { formData, handleChange, handleSubmit } = useClienteForm(
      cliente,
      () => {
        onRefetch();
        setIsOpen(false);
      }
  );

  if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl px-6 sm:px-8 py-8 sm:py-10 animate-scaleIn">
                <h2 className="text-2xl font-bold text-teal-600 mb-6 text-center">
                    {cliente ? "Editar Cliente" : "Añadir Cliente"}
                </h2>

                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                >
                    <div className="flex flex-col">
                        <label htmlFor="name" className="text-sm font-medium text-teal-700 mb-1">
                            Nombres
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 placeholder:text-gray-400"
                            placeholder="Ej. Juan Pérez"
                        />
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="celular" className="text-sm font-medium text-teal-700 mb-1">
                            Teléfono
                        </label>
                        <input
                            id="celular"
                            name="celular"
                            type="text"
                            value={formData.celular}
                            onChange={handleChange}
                            required
                            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 placeholder:text-gray-400"
                            placeholder="Ej. 987654321"
                        />
                    </div>

                    <div className="flex flex-col sm:col-span-2">
                        <label htmlFor="email" className="text-sm font-medium text-teal-700 mb-1">
                            Gmail
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 placeholder:text-gray-400"
                            placeholder="Ej. cliente@gmail.com"
                        />
                    </div>

                    <div className="sm:col-span-2 flex flex-col sm:flex-row justify-end items-center gap-3 mt-4">
                        <button
                            type="submit"
                            className="w-full sm:w-auto bg-teal-600 text-white px-5 py-2 rounded-lg hover:bg-teal-700 transition shadow"
                        >
                            {cliente ? "Guardar Cambios" : "Añadir Cliente"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="w-full sm:w-auto bg-gray-100 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-200 transition"
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
