import React, { useEffect, useState } from "react";
import EditProduct from "./EditProduct";
import { deleteProduct, getProducts } from "src/hooks/admin/productos/productos";
import type { Product } from "src/models/Product";
import { FaTrash, FaSearch, FaSyncAlt } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import AddProduct from "./AddProduct";
import Swal from "sweetalert2";

const ProductosTabla = () => {
  const [productos, setProductos] = useState<Product[]>([]);
  const [filteredProductos, setFilteredProductos] = useState<Product[]>([]);
  const [loadingDeleteId, setLoadingDeleteId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await getProducts();
      if (data) {
        setProductos(data);
        setFilteredProductos(data);
      }
    } catch (error) {
      console.error("Error al obtener productos:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un error al cargar los productos",
        confirmButtonColor: "#38a169", // Verde corporativo
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProductHandler = (id: number) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¡No podrás revertir esta acción!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#38a169", // Verde corporativo
      cancelButtonColor: "#e53e3e",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        setLoadingDeleteId(id);
        deleteProduct(id).then((response) => {
          if (response) {
            Swal.fire({
              icon: "success",
              title: "Eliminado",
              text: "El producto ha sido eliminado correctamente",
              confirmButtonColor: "#38a169", // Verde corporativo
            });
            setLoadingDeleteId(null);
            fetchData();
          }
        }).catch(error => {
          console.error("Error al eliminar producto:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Hubo un error al eliminar el producto",
            confirmButtonColor: "#38a169", // Verde corporativo
          });
          setLoadingDeleteId(null);
        });
      }
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtrado de productos
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredProductos(productos);
      setCurrentPage(1);
    } else {
      const filtered = productos.filter(product =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.seccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.id.toString().includes(searchTerm)
      );
      setFilteredProductos(filtered);
      setCurrentPage(1);
    }
  }, [searchTerm, productos]);

  // Lógica de paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProductos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProductos.length / itemsPerPage);

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          {/* Encabezado con título y botón de agregar */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-6 py-4 rounded-t-lg">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  Gestión de Productos
                </h2>
                <p className="text-white/80 mt-1">
                  Administra los productos disponibles en tu catálogo
                </p>
              </div>
              <div className="flex-shrink-0">
                <AddProduct onProductAdded={fetchData} />
              </div>
            </div>
          </div>

          {/* Controles de búsqueda y filtrado */}
          <div className="p-6 space-y-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
              <div className="relative w-full sm:w-64">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar productos..."
                    className="pl-9 w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <button
                  onClick={fetchData}
                  disabled={isLoading}
                  className="flex items-center gap-2 bg-white text-teal-600 border border-teal-600 hover:bg-teal-50 transition-colors px-4 py-2 rounded-md text-sm font-medium w-full sm:w-auto justify-center"
              >
                <FaSyncAlt className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                {isLoading ? "Cargando..." : "Actualizar"}
              </button>
            </div>

            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
              <div className="text-sm font-medium text-gray-600">
                {filteredProductos.length} {filteredProductos.length === 1 ? "producto" : "productos"} encontrados
              </div>
            </div>
          </div>

          {/* Tabla de productos */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-teal-50 text-teal-800">
              <tr>
                {["ID", "NOMBRE", "SECCIÓN", "IMAGEN", "ACCIÓN"].map((head, i) => (
                    <th key={i} className="px-6 py-3 text-left font-semibold tracking-wide">
                      {head}
                    </th>
                ))}
              </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8">
                      <div className="flex justify-center items-center gap-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-teal-600"></div>
                        <span className="text-teal-600">Cargando productos...</span>
                      </div>
                    </td>
                  </tr>
              ) : currentItems.length > 0 ? (
                  currentItems.map((item, index) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium whitespace-nowrap">{item.id}</td>
                        <td className="px-6 py-4">{item.name}</td>
                        <td className="px-6 py-4 capitalize">{item.seccion.toLowerCase()}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <img
                                src={item.image}
                                alt={item.name}
                                className="w-12 h-12 object-cover rounded-md shadow border border-gray-200"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/50';
                                }}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-3 items-center">
                            <EditProduct
                                product={item}
                                onProductUpdated={fetchData}
                            />
                            <button
                                className="p-2 rounded-full hover:bg-red-50 text-red-600 transition-colors"
                                title="Eliminar"
                                onClick={() => deleteProductHandler(item.id)}
                                disabled={loadingDeleteId === item.id}
                            >
                              {loadingDeleteId === item.id ? (
                                  <AiOutlineLoading3Quarters className="animate-spin" size={18} />
                              ) : (
                                  <FaTrash size={18} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                  ))
              ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      {searchTerm ? "No se encontraron productos que coincidan con tu búsqueda" : "No hay productos registrados"}
                    </td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {filteredProductos.length > itemsPerPage && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredProductos.length)} de {filteredProductos.length} productos
                </div>
                <div className="flex gap-2">
                  <button
                      onClick={handlePrev}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                          currentPage === 1
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                              : "bg-teal-600 text-white hover:bg-teal-700"
                      }`}
                  >
                    Anterior
                  </button>
                  <div className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium">
                    Página {currentPage} de {totalPages}
                  </div>
                  <button
                      onClick={handleNext}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                          currentPage === totalPages
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                              : "bg-teal-600 text-white hover:bg-teal-700"
                      }`}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
          )}
        </div>
      </div>
  );
};

export default ProductosTabla;