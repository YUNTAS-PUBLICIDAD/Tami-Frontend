/**
 * @file AddUpdateModal.tsx
 * @description Este componente es un modal que se utiliza para añadir o editar clientes.
 * Muestra un formulario con campos para el nombre, teléfono y correo electrónico.
 */

import useUsuariosForm from "../../../hooks/admin/usuarios/useUsuariosForm.ts";
import type Usuario from "../../../models/Users.ts";
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
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-teal-600 text-white px-10 py-8 rounded-4xl w-3/5">
        <h2 className="text-2xl font-bold mb-4">
          {Usuario ? "EDITAR USUARIO" : "AÑADIR USUARIO"}
        </h2>

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

          <div className="flex gap-2 mt-8 col-span-2">
            <button
              type="submit"
              className="px-10 bg-teal-400 py-1 rounded-full text-lg hover:bg-teal-500"
            >
              {Usuario ? "Guardar cambios" : "Añadir Usuario"}
            </button>
            <button
              onClick={() => setIsOpen(false)} // Cerrar el modal
              type="button"
              className="px-10 bg-gray-400 py-1 rounded-full text-lg hover:bg-gray-500"
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
