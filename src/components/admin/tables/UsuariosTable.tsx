import { useState } from "react";
import { FaTrash, FaEdit, FaPlus, FaSearch, FaSyncAlt } from "react-icons/fa";
import AddDataModal from "../../admin/tables/modals/usuarios/AddUpdateModalUsuario.tsx";
import DeleteUsuarioModal from "../../admin/tables/modals/usuarios/DeleteModalUsuario.tsx";
import useUsuarios from "../../../hooks/admin/usuarios/useUsuarios.ts";
import Paginator from "../../../components/admin/Paginator.tsx";
import Swal from "sweetalert2";
import type Usuario from "../../../models/Users";

const UsuariosTable = () => {
  const [refetchTrigger, setRefetchTrigger] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const {usuarios, totalPages, loading, error } = useUsuarios(refetchTrigger, currentPage);
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
      confirmButtonColor: "#38a169",
    });
  };

  if (loading) return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
        <p className="ml-4 text-teal-600">Cargando usuarios...</p>
      </div>
  );

  if (error) return (
      <div className="text-center py-10">
        <p className="text-red-500">Error al cargar los usuarios: {error}</p>
        <button
            onClick={handleRefetch}
            className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 flex items-center mx-auto"
        >
          <FaSyncAlt className="mr-2" /> Intentar nuevamente
        </button>
      </div>
  );

  return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-6 py-4 rounded-t-lg">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  Gestión de Usuarios
                </h2>
                <p className="text-white/80 mt-1">
                  Administra los usuarios registrados en el sistema
                </p>
              </div>
              <button
                  onClick={openModalForCreate}
                  className="flex items-center gap-2 bg-white text-teal-600 hover:bg-gray-100 transition-colors px-4 py-2 rounded-md text-sm font-medium"
              >
                <FaPlus /> Agregar Usuario
              </button>
            </div>
          </div>

          {/* Controles de búsqueda */}
          <div className="p-6 space-y-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
              <div className="relative w-full sm:w-64">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar usuarios..."
                    className="pl-9 w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <button
                  onClick={handleRefetch}
                  disabled={loading}
                  className="flex items-center gap-2 bg-white text-teal-600 border border-teal-600 hover:bg-teal-50 transition-colors px-4 py-2 rounded-md text-sm font-medium w-full sm:w-auto justify-center"
              >
                <FaSyncAlt className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                {loading ? "Cargando..." : "Actualizar"}
              </button>
            </div>

            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
              <div className="text-sm font-medium text-gray-600">
                {filteredUsuarios.length} {filteredUsuarios.length === 1 ? "usuario" : "usuarios"} encontrados
              </div>
            </div>
          </div>

          {/* Tabla de usuarios */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-teal-50 text-teal-800">
              <tr>
                {["ID", "NOMBRE", "EMAIL", "TELÉFONO", "FECHA REGISTRO", "ACCIÓN"].map((header, index) => (
                    <th key={index} className="px-6 py-3 text-left font-semibold tracking-wide whitespace-nowrap">
                      {header}
                    </th>
                ))}
              </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
              {filteredUsuarios.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      {searchTerm ? "No se encontraron usuarios que coincidan con tu búsqueda" : "No hay usuarios registrados"}
                    </td>
                  </tr>
              ) : (
                  filteredUsuarios.map((usuario) => (
                      <tr key={usuario.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium whitespace-nowrap">{usuario.id}</td>
                        <td className="px-6 py-4">{usuario.name}</td>
                        <td className="px-6 py-4">{usuario.email}</td>
                        <td className="px-6 py-4">{usuario.celular || "N/A"}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {usuario.created_at ? new Date(usuario.created_at).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-3 items-center">
                            <button
                                className="p-2 rounded-full hover:bg-red-50 text-red-600 transition-colors"
                                title="Eliminar"
                                onClick={() => openDeleteModal(usuario.id)}
                            >
                              <FaTrash size={18} />
                            </button>
                            <button
                                className="p-2 rounded-full hover:bg-green-50 text-green-600 transition-colors"
                                title="Editar"
                                onClick={() => openModalForEdit(usuario)}
                            >
                              <FaEdit size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                  ))
              )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {filteredUsuarios.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Mostrando {(currentPage - 1) * 5 + 1}-{Math.min(currentPage * 5, filteredUsuarios.length)} de {filteredUsuarios.length} usuarios
                </div>
                <Paginator
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => setCurrentPage(page)}
                />
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