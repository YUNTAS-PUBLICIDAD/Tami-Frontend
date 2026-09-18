import { useState, useMemo, useCallback } from "react";
import { FaTrash, FaEdit, FaPlus, FaSyncAlt, FaUsers } from "react-icons/fa";
import AddDataModal from "./AddUpdateModalUsuario.tsx";
import DeleteUsuarioModal from "./DeleteModalUsuario.tsx";
import useUsuarios from "../../../hooks/admin/usuarios/useUsuarios.ts";
import Swal from "sweetalert2";
import type Usuario from "../../../models/Users.ts";
import LoadingComponent from "src/components/admin/ui/LoadingComponent.tsx";
import ErrorComponent from "src/components/admin/ui/ErrorComponent.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "src/components/admin/ui/Table.tsx";
import { SearchInput } from "src/components/admin/ui/SearchInput.tsx";
import { TablePagination } from "src/components/admin/ui/TablePagination.tsx";

const UsuariosTable = () => {
  const [refetchTrigger, setRefetchTrigger] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { usuarios, totalPages, loading, error } = useUsuarios(refetchTrigger, currentPage);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [usuarioIdToDelete, setUsuarioIdToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsuarios = useMemo(() => {
    if (!searchTerm) return usuarios;
    const lowerTerm = searchTerm.toLowerCase();

    return usuarios.filter(usuario =>
      usuario.name.toLowerCase().includes(lowerTerm) ||
      usuario.email.toLowerCase().includes(lowerTerm) ||
      usuario.celular?.toLowerCase().includes(lowerTerm) ||
      usuario.id.toString().includes(searchTerm)
    );
  }, [usuarios, searchTerm]);

  const handleRefetch = useCallback(() => setRefetchTrigger((prev) => !prev), []);

  const openModalForEdit = useCallback((usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setIsModalOpen(true);
  }, []);

  const openModalForCreate = useCallback(() => {
    setSelectedUsuario(null);
    setIsModalOpen(true);
  }, []);

  const openDeleteModal = useCallback((id: number) => {
    setUsuarioIdToDelete(id);
    setIsDeleteModalOpen(true);
  }, []);

  const handleUsuarioFormSuccess = useCallback(() => {
    setRefetchTrigger((prev) => !prev);
    setIsModalOpen(false);
    Swal.fire({
      icon: "success",
      title: "Operación exitosa",
      text: "El usuario se ha guardado correctamente",
      confirmButtonColor: "#14b8a6",
    });
  }, []);

  if (loading) return <LoadingComponent message="Cargando usuarios..." />

  if (error) return <ErrorComponent handleRefetch={handleRefetch} error={error} />

  return (
    <div className="container mx-auto p-4">

      <div className="mb-6">
        <p className="text-gray-500 text-sm mb-1 font-medium">
          Administración <span className="mx-1 font-normal">&gt;</span>{' '}
          <span className="font-semibold text-gray-800 dark:text-gray-200">Gestión de Usuarios</span>
        </p>
      </div>

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
              className="flex items-center gap-2 bg-white dark:bg-gray-700 text-teal-600 dark:text-teal-400 border-2 border-teal-500 hover:bg-teal-500 transition-all duration-300 px-5 py-3 rounded-full text-sm font-bold w-full sm:w-auto justify-center shadow-sm"
            >
              <FaSyncAlt className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Cargando..." : "Actualizar"}
            </button>
          </div>

          <div className="flex items-center justify-between bg-teal-50 dark:bg-gray-700 p-4 rounded-xl border border-teal-100 dark:border-gray-600 shadow-sm">
            <div className="text-sm font-medium text-teal-700 dark:text-teal-400 flex items-center gap-2">
              <span className="bg-teal-500 text-white text-sm font-bold py-1 px-3 rounded-full">
                {filteredUsuarios.length}
              </span>
              {filteredUsuarios.length === 1 ? "usuario" : "usuarios"} encontrados
            </div>
          </div>
        </div>

        {/* Vista desktop */}
        <div className="hidden md:block px-8 pb-6">
          <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700">
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
          </div>
        </div>

        {/* Vista mobile */}
        <div className="md:hidden px-4 sm:px-6 pb-4 space-y-4">
          {filteredUsuarios.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8">
              <div className="bg-teal-50 p-6 rounded-full">
                <FaUsers className="h-10 w-10 text-teal-300" />
              </div>
              <p className="text-lg font-medium text-gray-600 mt-2 text-center">
                {searchTerm ? "No se encontraron usuarios que coincidan con tu búsqueda" : "No hay usuarios registrados"}
              </p>
              <p className="text-gray-400 text-sm text-center max-w-xs">
                {searchTerm ? "Intenta con otros términos de búsqueda" : "Comienza agregando usuarios a tu sistema con el botón 'Agregar Usuario'"}
              </p>
            </div>
          ) : (
            filteredUsuarios.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 hover:border-teal-200 dark:hover:border-teal-700 min-w-0"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="text-xs text-teal-700 font-semibold">#{item.id}</span>
                    <p className="font-medium text-gray-800 dark:text-gray-100 truncate">{item.name}</p>
                    <p className="text-blue-500 text-sm truncate">{item.email}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
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
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-2 mt-3 text-sm min-w-0">
                  <div className="min-w-0">
                    <span className="block text-[11px] text-gray-400 uppercase tracking-wide">Teléfono</span>
                    <span className="break-words">
                      {item.celular || <span className="text-gray-400 italic text-xs">No disponible</span>}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[11px] text-gray-400 uppercase tracking-wide">Registro</span>
                    <span className="bg-gray-100 py-1 px-2 rounded-full text-xs text-gray-700 inline-block">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit"
                      }) : "Fecha no disponible"}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Paginación */}
        {filteredUsuarios.length > 0 && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
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