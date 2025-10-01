import { useState } from "react";
import { FaTrash, FaEdit, FaPlus, FaSearch, FaSyncAlt, FaUsers } from "react-icons/fa";
import AddDataModal from "./AddUpdateModalUsuario.tsx";
import DeleteUsuarioModal from "./DeleteModalUsuario.tsx";
import useUsuarios from "../../../hooks/admin/usuarios/useUsuarios.ts";
import Paginator from "../ui/Paginator.tsx";
import Swal from "sweetalert2";
import type Usuario from "../../../models/Users.ts";
import LoadingComponent from "src/components/admin/ui/LoadingComponent.tsx";
import ErrorComponent from "src/components/admin/ui/ErrorComponent.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "src/components/admin/ui/Table.tsx";
import { SearchInput } from "src/components/admin/ui/SearchInput.tsx";

const UsuariosTable = () => {
  const [refetchTrigger, setRefetchTrigger] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { usuarios, totalPages, loading, error } = useUsuarios(refetchTrigger, currentPage);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [usuarioIdToDelete, setUsuarioIdToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsuarios = usuarios.filter(usuario =>
    usuario.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.celular?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.id.toString().includes(searchTerm)
  );

  const handleRefetch = () => setRefetchTrigger((prev) => !prev);

  const openModalForEdit = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setIsModalOpen(true);
  };

  const openModalForCreate = () => {
    setSelectedUsuario(null);
    setIsModalOpen(true);
  };

  const openDeleteModal = (id: number) => {
    setUsuarioIdToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleUsuarioFormSuccess = () => {
    setRefetchTrigger((prev) => !prev);
    setIsModalOpen(false);
    Swal.fire({
      icon: "success",
      title: "Operación exitosa",
      text: "El usuario se ha guardado correctamente",
      confirmButtonColor: "#14b8a6",
    });
  };

  if (loading) return <LoadingComponent message="Cargando usuarios..." />

  if (error) return <ErrorComponent handleRefetch={handleRefetch} error={error} />

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden ">
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-8 py-6 rounded-t-2xl">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-extrabold flex items-center gap-3 text-white">
                <FaUsers />
                <span>Gestión de Usuarios</span>
              </h2>
              <p className="text-teal-50 mt-2 text-lg">
                Administra los usuarios registrados en el sistema
              </p>
            </div>
            <button
              onClick={openModalForCreate}
              className="flex items-center gap-2 bg-white text-teal-600 hover:bg-teal-50 transition-all duration-300 px-5 py-3 rounded-full text-sm font-bold shadow-md hover:shadow-lg"
            >
              <FaPlus /> Agregar Usuario
            </button>
          </div>
        </div>

        {/* Controles de búsqueda */}
        <div className="p-8 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <SearchInput value={searchTerm} placeholder="Buscar usuarios..." onChange={setSearchTerm} />

            <button
              onClick={handleRefetch}
              disabled={loading}
              className="flex items-center gap-2 bg-white text-teal-600 border-2 border-teal-500 hover:bg-teal-50 transition-all duration-300 px-5 py-3 rounded-full text-sm font-bold w-full sm:w-auto justify-center shadow-sm"
            >
              <FaSyncAlt className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Cargando..." : "Actualizar"}
            </button>
          </div>

          <div className="flex items-center justify-between bg-teal-50 p-4 rounded-xl border border-teal-100 shadow-sm">
            <div className="text-sm font-medium text-teal-700 flex items-center gap-2">
              <span className="bg-teal-500 text-white text-sm font-bold py-1 px-3 rounded-full">
                {filteredUsuarios.length}
              </span>
              {filteredUsuarios.length === 1 ? "usuario" : "usuarios"} encontrados
            </div>
          </div>
        </div>

        {/* Tabla de usuarios */}
        <Table>
          <TableHeader>
            <TableRow>
              {["ID", "NOMBRE", "EMAIL", "TELÉFONO", "FECHA REGISTRO", "ACCIÓN"].map((header, index) => (
                <TableHead key={index}>
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100">
            {filteredUsuarios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="bg-teal-50 p-6 rounded-full">
                      <FaUsers className="h-10 w-10 text-teal-300" />
                    </div>
                    <p className="text-xl font-medium text-gray-600 mt-4">
                      {searchTerm ? "No se encontraron usuarios que coincidan con tu búsqueda" : "No hay usuarios registrados"}
                    </p>
                    <p className="text-gray-400 max-w-md mx-auto">
                      {searchTerm ? "Intenta con otros términos de búsqueda" : "Comienza agregando usuarios a tu sistema con el botón 'Agregar Usuario'"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsuarios.map((item) => (
                <TableRow key={item.id} className="hover:bg-teal-50/50 transition-colors duration-200">
                  <TableCell className="text-teal-700">
                    #{item.id}
                  </TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>
                    {item.celular ||
                      <span className="text-gray-400 italic text-xs">No disponible</span>
                    }
                  </TableCell>
                  <TableCell>
                    <span className="bg-gray-100 py-1 px-3 rounded-full text-xs text-gray-700">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit"
                      }) : "Fecha no disponible"}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-3 items-center">
                      <button
                        className="p-2 rounded-full hover:bg-green-100 text-green-600 transition-colors duration-200 border border-transparent hover:border-green-200"
                        title="Editar"
                        onClick={() => openModalForEdit(item)}
                      >
                        <FaEdit size={18} />
                      </button>
                      <button
                        className="p-2 rounded-full text-red-500 border border-transparent transition-colors duration-200 hover:bg-red-100 hover:border-red-200"
                        title="Eliminar"
                        onClick={() => openDeleteModal(item.id)}
                      >
                        <FaTrash size={18} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Paginación */}
        {filteredUsuarios.length > 0 && (
          <div className="flex justify-center gap-2 mt-8 px-4 pb-6">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`${currentPage === 1 ? '' : 'cursor-pointer'} px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 text-sm text-gray-700 dark:text-gray-200`}
            >
              Anterior
            </button>

            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageToShow: number;
              if (totalPages <= 5) {
                pageToShow = i + 1;
              } else if (currentPage <= 3) {
                pageToShow = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageToShow = totalPages - 4 + i;
              } else {
                pageToShow = currentPage - 2 + i;
              }

              return (
                <button
                  key={i}
                  onClick={() => setCurrentPage(pageToShow)}
                  className={`px-3 py-1 border rounded-md text-sm cursor-pointer ${currentPage === pageToShow
                      ? "bg-teal-500 text-white border-teal-500"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                >
                  {pageToShow}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`${currentPage === totalPages ? '' : 'cursor-pointer'} px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 text-sm text-gray-700 dark:text-gray-200`}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {/* Modales */}
      <AddDataModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        Usuario={selectedUsuario}
        onRefetch={handleUsuarioFormSuccess}
      />

      {usuarioIdToDelete !== null && (
        <DeleteUsuarioModal
          isOpen={isDeleteModalOpen}
          setIsOpen={setIsDeleteModalOpen}
          usuarioId={usuarioIdToDelete}
          onRefetch={handleRefetch}
        />
      )}
    </div>
  );
};

export default UsuariosTable;