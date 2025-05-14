/**
 * @file AddUpdateModal.tsx
 * @description Este componente es un modal que se utiliza para añadir o editar clientes.
 * Muestra un formulario con campos para el nombre, teléfono y correo electrónico.
 */

import useUsuariosForm from "../../../../../hooks/admin/usuarios/useUsuariosForm";
import type Usuario from "../../../../../models/Users";
import React from "react";

{
  /* Interfaz de modals, Typescript */
}
interface AddDataModalProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  Usuario: Usuario | null; // Cliente a editar o null para añadir uno nuevo
  onRefetch: () => void; // Función para actualizar la lista después de agregar o editar
}

const AddUpdateDataModal = ({ isOpen, setIsOpen, Usuario, onRefetch }: AddDataModalProps) => {

  {
    /*
    * Hook para manejar el formulario de cliente, y la lógica de añadir o editar clientes
    */
  }
  const { formData, handleChange, handleSubmit } = useUsuariosForm(
      Usuario,
    () => {
      onRefetch(); // Llamar al callback para actualizar la lista de clientes
      setIsOpen(false); // Cerrar el modal después de guardar
    }
  );

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
        <div className="bg-teal-600 text-white w-full max-w-3xl rounded-2xl shadow-2xl px-6 sm:px-10 py-8 animate-scaleIn">
          <h2 className="text-2xl font-bold mb-6 text-center">
            {Usuario ? "EDITAR USUARIO" : "AÑADIR USUARIO"}
          </h2>

<<<<<<< HEAD
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-2 gap-4 gap-x-12"
        >
          <div>
            <label className="block">Nombres</label>
            <input
              type="text"
              name="name"
              placeholder="Ingrese los nombres"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full bg-white outline-none p-2 rounded-md text-black"
            />
          </div>

          <div>
            <label className="block">Teléfono</label>
            <input
              type="text"
              name="celular"
              placeholder="Ingrese el teléfono"
              value={formData.celular}
              onChange={handleChange}
              required
              className="w-full bg-white outline-none p-2 rounded-md text-black"
            />
          </div>

          <div className="col-span-2">
            <label className="block">Correo</label>
            <input
              type="email"
              name="email"
              placeholder="Ingrese el correo"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-white outline-none p-2 rounded-md text-black"
            />
          </div>

          {/*<div className="col-span-2">*/}
          {/*  <label className="block">Rol</label>*/}
          {/*  <select*/}
          {/*    name="rol"*/}
          {/*    value={formData.rol}*/}
          {/*    onChange={handleChange}*/}
          {/*    required*/}
          {/*    className="w-full bg-white outline-none p-2 rounded-md text-black"*/}
          {/*  >*/}
          {/*    <option value="ADMIN">ADMIN</option>*/}
          {/*    <option value="USER">USER</option>*/}
          {/*    <option value="MARK">MARK</option>*/}
          {/*    <option value="VENTAS">VENTAS</option>*/}
          {/*  </select>*/}
          {/*</div>*/}
=======
          <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            <div>
              <label className="block text-sm mb-1">Nombres</label>
              <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-white p-3 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-teal-400"
                  placeholder="Ej. María Gómez"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Teléfono</label>
              <input
                  type="text"
                  name="celular"
                  value={formData.celular}
                  onChange={handleChange}
                  required
                  className="w-full bg-white p-3 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-teal-400"
                  placeholder="Ej. 912345678"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm mb-1">Gmail</label>
              <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-white p-3 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-teal-400"
                  placeholder="Ej. usuario@gmail.com"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm mb-1">Rol</label>
              <select
                  name="rol"
                  value={formData.rol}
                  onChange={handleChange}
                  required
                  className="w-full bg-white p-3 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                <option value="ADMIN">ADMIN</option>
                <option value="USER">USER</option>
                <option value="MARK">MARK</option>
                <option value="VENTAS">VENTAS</option>
              </select>
            </div>
>>>>>>> Rodrigo

            <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:col-span-2 justify-end">
              <button
                  type="submit"
                  className="w-full sm:w-auto bg-teal-400 hover:bg-teal-500 text-white px-6 py-2 rounded-full text-lg transition shadow"
              >
                {Usuario ? "Guardar cambios" : "Añadir Usuario"}
              </button>
              <button
                  onClick={() => setIsOpen(false)}
                  type="button"
                  className="w-full sm:w-auto bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-full text-lg transition"
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
