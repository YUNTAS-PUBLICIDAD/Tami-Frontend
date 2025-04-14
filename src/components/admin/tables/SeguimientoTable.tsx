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
      <table className="w-full md:w-40 border-separate border-spacing-2">
        <thead>
          <tr className="bg-teal-600 text-white">
            <th className="px-4 py-2 rounded-xl">ID</th>
            <th className="px-4 py-2 rounded-xl">NOMBRE</th>
            <th className="px-4 py-2 rounded-xl">GMAIL</th>
            <th className="px-4 py-2 rounded-xl">TELÉFONO</th>
            <th className="px-4 py-2 rounded-xl">SECCIÓN</th>
            <th className="px-4 py-2 rounded-xl">FECHA</th>
            <th className="px-4 py-2 rounded-xl">ACCIÓN</th>
          </tr>
        </thead>
        <tbody>
          {clientes.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-4 text-gray-500">
                No hay clientes disponibles.
              </td>
            </tr>
          ) : (
            clientes.map((item, index) => (
              <tr
                key={item.id}
                className={`text-center ${
                  index % 2 === 0 ? "bg-gray-100" : "bg-gray-300"
                }`}
              >
                <td className="px-4 font-bold rounded-xl">{item.id}</td>
                <td className="px-4 font-bold rounded-xl">{item.name}</td>
                <td className="px-4 rounded-xl">{item.email}</td>
                <td className="px-4 font-bold rounded-xl">{item.celular}</td>
                <td className="px-4 font-bold rounded-xl">
                  {item.seccion || "N/A"}
                </td>
                <td className="px-4 font-bold rounded-xl">{item.created_at}</td>
                <td className="px-4 rounded-xl">
                  <div className="flex justify-center gap-2 rounded-xl p-1">
                    <button
                      className="p-2 text-red-600 hover:text-red-800 transition"
                      title="Eliminar"
                      onClick={() => openDeleteModal(item.id)}
                    >
                      <FaTrash size={18} />
                    </button>
                    <button
                      className="p-2 text-green-600 hover:text-green-800 transition"
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

      {
      /**
       * Botón para agregar un nuevo cliente.
       */
      }
      <button
        className="mt-4 ml-2 p-2 pl-4 bg-teal-600 text-white rounded-lg"
        onClick={openModalForCreate}
      >
        Agregar Cliente
      </button>

      {
      /**
       * Modal para agregar o editar un cliente.
       */
      }
      <AddDataModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        cliente={selectedCliente}
        onRefetch={handleClienteFormSuccess}
      />

      {
      /**
       * Modal para eliminar un cliente.
       */
      }
      {clienteIdToDelete !== null && (
        <DeleteClienteModal
          isOpen={isDeleteModalOpen}
          setIsOpen={setIsDeleteModalOpen}
          clienteId={clienteIdToDelete}
          onRefetch={handleRefetch}
        />
      )}

      {
      /**
       * Componente de paginación para navegar entre las páginas de clientes.
       * Se muestra solo si hay más de una página.
       */
      }
      <Paginator
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </>
  );
};

export default DataTable;
