import React, { useEffect, useState } from "react";
import {FaTrash, FaEdit, FaPlus, FaSearch, FaSyncAlt, FaTags, FaUsers} from "react-icons/fa";
import AddDataModal from "./modals/AddUpdateModal.tsx"
import DeleteProductoModal from "./modals/DeleteModal.tsx";
import useProductos from "../../../hooks/admin/productos/useProductos.ts";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import Paginator from "../ui/Paginator.tsx";
import Swal from "sweetalert2";
import type Producto from "src/models/Product";

const ProductosTabla = () => {
  const [refetchTrigger, setRefetchTrigger] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { productos, totalPages, loading, error } = useProductos(refetchTrigger, currentPage);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productoIdToDelete, setProductoIdToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrar productos basado en el término de búsqueda
  const filteredProductos = productos.filter(producto =>
      producto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.id.toString().includes(searchTerm) ||
      producto.section.toString().includes(searchTerm)
  );

  const handleRefetch = () => setRefetchTrigger((prev) => !prev);

  const openModalForEdit = (producto: Producto) => {
    setSelectedProducto(producto);
    setIsModalOpen(true);
  };

  const openModalForCreate = () => {
    setSelectedProducto(null);
    setIsModalOpen(true);
  };

  const openDeleteModal = (id: number) => {
    setProductoIdToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleProductoFormSuccess = () => {
    setRefetchTrigger((prev) => !prev);
    setIsModalOpen(false);
    Swal.fire({
      icon: "success",
      title: "Operación exitosa",
      text: "El producto se ha guardado correctamente",
      confirmButtonColor: "#14b8a6", // teal-500
    });
  };

  if (loading) return (
      <div className="flex justify-center items-center py-24 bg-white rounded-2xl shadow-lg">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-3 border-b-3 border-teal-500"></div>
          <p className="text-teal-600 font-medium text-lg">Cargando productos...</p>
        </div>
      </div>
  );

  if (error) return (
      <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
        <div className="bg-red-50 p-6 rounded-xl max-w-md mx-auto border border-red-100">
          <p className="text-red-600 font-medium mb-4">Error al cargar los productos:</p>
          <p className="bg-white p-3 rounded-lg text-red-500 mb-6 border border-red-100">{error}</p>
          <button
              onClick={handleRefetch}
              className="px-5 py-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 flex items-center gap-2 mx-auto transition-all duration-300 shadow-md"
          >
            <FaSyncAlt /> Intentar nuevamente
          </button>
        </div>
      </div>
  );

  return (
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-8 py-6 rounded-t-2xl">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-extrabold flex items-center gap-3 text-white">
                  <FaTags />
                  <span>Gestión de Productos</span>
                </h2>
                <p className="text-teal-50 mt-2 text-lg">
                  Administra el catálogo de productos de tu empresa
                </p>
              </div>
              <button
                  onClick={openModalForCreate}
                  className="flex items-center gap-2 bg-white text-teal-600 hover:bg-teal-50 transition-all duration-300 px-5 py-3 rounded-full text-sm font-bold shadow-md hover:shadow-lg"
              >
                <FaPlus /> Agregar Producto
              </button>
              {/*<div className="flex-shrink-0">*/}
              {/*  <AddProduct onProductAdded={fetchData} />*/}
              {/*</div>*/}
            </div>
          </div>

          {/* Controles de búsqueda */}
          <div className="p-8 space-y-6 border-b border-gray-100 bg-white">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="relative w-full sm:w-80">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-teal-500" />
                <input
                    type="text"
                    placeholder="Buscar productos..."
                    className="pl-10 w-full rounded-full border-2 border-teal-100 py-3 px-5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-sm transition-all duration-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

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
                {filteredProductos.length}
              </span>
                {filteredProductos.length === 1 ? "producto" : "productos"} encontrados
              </div>
            </div>
          </div>

          {/* Tabla de productos */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-teal-50 text-teal-800">
              <tr>
                {["ID", "NOMBRE", "SECCIÓN", "IMAGEN", "ACCIÓN"].map((header, index) => (
                    <th key={index} className="px-6 py-4 text-left font-bold tracking-wide uppercase text-xs whitespace-nowrap">
                      {header}
                    </th>
                ))}
              </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
              {filteredProductos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16 text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="bg-teal-50 p-6 rounded-full">
                          <FaTags className="h-10 w-10 text-teal-300" />
                        </div>
                        <p className="text-xl font-medium text-gray-600 mt-4">
                          {searchTerm ? "No se encontraron productos que coincidan con tu búsqueda" : "No hay productos registrados"}
                        </p>
                        <p className="text-gray-400 max-w-md mx-auto">
                          {searchTerm ? "Intenta con otros términos de búsqueda" : "Comienza agregando productos a tu sistema con el botón 'Agregar Producto'"}
                        </p>
                      </div>
                    </td>
                  </tr>
              ) : (
                  // Filas de la tabla
                  filteredProductos.map((item) => (
                      <tr key={item.id} className="hover:bg-teal-50/50 transition-colors duration-200">
                        <td className="px-6 py-4 font-medium whitespace-nowrap text-teal-700">
                          #{item.id}
                        </td>
                        <td className="px-6 py-4 font-medium">{item.name}</td>
                        <td className="px-6 py-4">
                          <span className="bg-teal-100 text-teal-800 py-1 px-3 rounded-full text-xs capitalize font-medium">
                            {item.seccion.toLowerCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <img
                                src={item.image}
                                alt={item.name}
                                className="w-14 h-14 object-cover rounded-lg shadow-md border border-gray-200"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/50';
                                }}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
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
                        </td>
                      </tr>
                  ))
              )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {filteredProductos.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Mostrando {(currentPage - 1) * 5 + 1}-{Math.min(currentPage * 5, filteredProductos.length)} de {filteredProductos.length} productos
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
            producto={selectedProducto}
            onRefetch={handleProductoFormSuccess}
            productos={productos}
        />

        {productoIdToDelete !== null && (
            <DeleteProductoModal
                isOpen={isDeleteModalOpen}
                setIsOpen={setIsDeleteModalOpen}
                productoId={productoIdToDelete}
                onRefetch={handleRefetch}
            />
        )}
      </div>
  );
};

export default ProductosTabla;