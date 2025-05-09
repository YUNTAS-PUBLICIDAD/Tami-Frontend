import { useState } from "react";
import { FaTrash } from "react-icons/fa";
import { GrUpdate } from "react-icons/gr";
import AddDataModal from "../../admin/tables/modals/AddUpdateModal.tsx";
import DeleteClienteModal from "../../admin/tables/modals/DeleteModal.tsx";
import useClientes from "../../../hooks/admin/seguimiento/useClientes.ts";
import Paginator from "../../../components/admin/Paginator.tsx";

const DataTable = () => {
  const [refetchTrigger, setRefetchTrigger] = useState(false); // Estado para forzar la recarga de datos
  const [currentPage, setCurrentPage] = useState(1); // Estado para manejar la página actual
  const { clientes, totalPages, loading, error } = useClientes(
    refetchTrigger,
    currentPage
  ); // Hook para obtener la lista de clientes
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para manejar la apertura y cierre del modal
  const [selectedCliente, setSelectedCliente] = useState<any>(null); // Estado para manejar el cliente seleccionado
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Estado para manejar la apertura y cierre del modal de eliminación
  const [clienteIdToDelete, setClienteIdToDelete] = useState<number | null>(
    null
  ); // Estado para manejar el ID del cliente a eliminar

  /**
   * Manejo de errores en la solicitud y carga.
   */
  if (loading)
    return <p className="text-center text-gray-500">Cargando datos...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  /**
   * Función para forzar la recarga de datos.
   */
  const handleRefetch = () => setRefetchTrigger((prev) => !prev);

  /**
   * Función para abrir el modal de edición de cliente.
   */
  const openModalForEdit = (cliente: any) => {
    setSelectedCliente(cliente);
    setIsModalOpen(true);
  };

  /**
   * Función para abrir el modal de creacion de cliente.
   */
  const openModalForCreate = () => {
    setSelectedCliente(null);
    setIsModalOpen(true);
  };

  /**
   * Función para abrir el modal de eliminación de cliente.
   */
  const openDeleteModal = (id: number) => {
    setClienteIdToDelete(id);
    setIsDeleteModalOpen(true);
  };

  /**
   * Función para manejar el cierre del modal de eliminación.
   */
  const handleClienteFormSuccess = () => {
    handleRefetch(); // Recarga la lista de clientes
    setIsModalOpen(false); // Cierra el modal después de añadir o editar un cliente
  };

  return (
    <>
      <div className="mx-4 my-6 overflow-x-auto rounded-xl shadow-lg bg-white">

      <table className="w-full text-sm text-gray-700 rounded-xl shadow-md overflow-hidden">
        <thead className="bg-teal-600 text-white sticky top-0 z-10">
        <tr>
          {["ID", "NOMBRE", "GMAIL", "TELÉFONO", "SECCIÓN", "FECHA", "ACCIÓN"].map((header, index) => (
              <th key={index} className="px-4 py-3 text-left font-semibold tracking-wide">
                {header}
              </th>
          ))}
        </tr>
        </thead>
        <tbody>
        {clientes.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-6 text-gray-500">
                No hay clientes disponibles.
              </td>
            </tr>
        ) : (
            clientes.map((item, index) => (
                <tr
                    key={item.id}
                    className={`hover:bg-green-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                >
                  <td className="px-4 py-2 font-bold">{item.id}</td>
                  <td className="px-4 py-2 font-medium">{item.name}</td>
                  <td className="px-4 py-2">{item.email}</td>
                  <td className="px-4 py-2">{item.celular}</td>
                  <td className="px-4 py-2">{item.seccion || "N/A"}</td>
                  <td className="px-4 py-2">{item.created_at}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <button
                          className="rounded-full p-2 hover:bg-red-100 text-red-600 transition"
                          title="Eliminar"
                          onClick={() => openDeleteModal(item.id)}
                      >
                        <FaTrash size={18} />
                      </button>
                      <button
                          className="rounded-full p-2 hover:bg-green-100 text-green-600 transition"
                          title="Editar"
                          onClick={() => openModalForEdit(item)}
                      >
                        <GrUpdate size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
            ))
        )}
        </tbody>
      </table>
      </div>


      {/**
       * Botón para agregar un nuevo cliente.
       */}
      <button className="pagination-btn ml-2 mt-2" onClick={openModalForCreate}>
        Agregar Cliente
      </button>

      {/**
       * Modal para agregar o editar un cliente.
       */}
      <AddDataModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        cliente={selectedCliente}
        onRefetch={handleClienteFormSuccess}
      />

      {/**
       * Modal para eliminar un cliente.
       */}
      {clienteIdToDelete !== null && (
        <DeleteClienteModal
          isOpen={isDeleteModalOpen}
          setIsOpen={setIsDeleteModalOpen}
          clienteId={clienteIdToDelete}
          onRefetch={handleRefetch}
        />
      )}

      {/**
       * Componente de paginación para navegar entre las páginas de clientes.
       * Se muestra solo si hay más de una página.
       */}
      <Paginator
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </>
  );
};

export default DataTable;
