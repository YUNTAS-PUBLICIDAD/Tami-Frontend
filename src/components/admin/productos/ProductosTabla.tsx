import React, { useEffect, useState } from "react";
import EditProduct from "./EditProduct";
import { deleteProduct, getProducts } from "src/hooks/admin/productos/productos";
import type Product from "src/models/Product";
import { FaTrash, FaSearch, FaSyncAlt, FaPlus, FaTags } from "react-icons/fa";
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
                confirmButtonColor: "#14b8a6", // teal-500
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
            confirmButtonColor: "#14b8a6",
            cancelButtonColor: "#ef4444",
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
                            confirmButtonColor: "#14b8a6",
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
                        confirmButtonColor: "#14b8a6",
                    });
                    setLoadingDeleteId(null);
                });
            }
        });
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (searchTerm === "") {
            setFilteredProductos(productos);
            setCurrentPage(1);
        } else {
            const filtered = productos.filter(product =>
                product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.seccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.id.toString().includes(searchTerm)
            );
            setFilteredProductos(filtered);
            setCurrentPage(1);
        }
    }, [searchTerm, productos]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredProductos.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredProductos.length / itemsPerPage);

    const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
    const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-r from-teal-500 to-emerald-600 px-8 py-6 rounded-t-2xl">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-extrabold flex items-center gap-2 text-white">
                                <FaTags />
                                <span>Gestión de Productos</span>
                            </h2>
                            <p className="text-teal-50 mt-2 text-lg">
                                Administra el catálogo de productos de tu empresa
                            </p>
                        </div>

                        <div className="flex-shrink-0">
                            <AddProduct onProductAdded={fetchData} />
                        </div>
                    </div>
                </div>

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
                            onClick={fetchData}
                            disabled={isLoading}
                            className="flex items-center gap-2 bg-white text-teal-600 border-2 border-teal-500 hover:bg-teal-50 transition-all duration-300 px-5 py-3 rounded-full text-sm font-bold w-full sm:w-auto justify-center shadow-sm"
                        >
                            <FaSyncAlt className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                            {isLoading ? "Cargando..." : "Actualizar Catálogo"}
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

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-teal-50 text-teal-800">
                        <tr>
                            {["ID", "NOMBRE", "SECCIÓN", "IMAGEN", "ACCIÓN"].map((head, i) => (
                                <th key={i} className="px-6 py-4 text-left font-bold tracking-wide uppercase text-xs">
                                    {head}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-12">
                                        <div className="flex justify-center items-center gap-3">
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
                                            <span className="text-teal-500 font-medium">Cargando productos...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : currentItems.length > 0 ? (
                                currentItems.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-teal-50/50 transition-colors duration-200">
                                        <td className="px-6 py-4 font-medium whitespace-nowrap text-teal-700">
                                            #{item.id}
                                        </td>
                                        <td className="px-6 py-4 font-medium">{item.nombre}</td>
                                        <td className="px-6 py-4">
                                            <span className="bg-teal-100 text-teal-800 py-1 px-3 rounded-full text-xs capitalize font-medium">
                                                {item.seccion.toLowerCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                {item.imagenes?.[0]?.url_imagen ? (
                                                    <img
                                                        src={`https://apitami.tami-peru.com${item.imagenes[0].url_imagen}`}
                                                        alt={item.nombre}
                                                        className="w-14 h-14 object-cover rounded-lg shadow-md border border-gray-200"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/50';
                                                        }}
                                                    />
                                                ) : (
                                                    <span className="text-sm text-gray-400 italic">Sin imagen</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex gap-3 items-center">
                                                <EditProduct
                                                    product={item}
                                                    onProductUpdated={fetchData}
                                                />
                                                <button
                                                    className="p-2 rounded-full hover:bg-red-100 text-red-500 transition-colors duration-200 border border-transparent hover:border-red-200"
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
                                    <td colSpan={5} className="text-center py-16 text-gray-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="bg-teal-50 p-6 rounded-full">
                                                <FaTags className="h-10 w-10 text-teal-300" />
                                            </div>
                                            <p className="text-xl font-medium text-gray-600 mt-4">
                                                {searchTerm ? "No se encontraron productos que coincidan con tu búsqueda" : "No hay productos registrados"}
                                            </p>
                                            <p className="text-gray-400 max-w-md mx-auto">
                                                {searchTerm ? "Intenta con otros términos de búsqueda" : "Comienza agregando productos a tu catálogo con el botón 'Agregar Producto'"}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Paginación */}
                {filteredProductos.length > itemsPerPage && (
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-8 py-6 bg-teal-50/50 border-t border-teal-100">
                        <div className="text-sm text-teal-700 font-medium">
                            Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredProductos.length)} de {filteredProductos.length} productos
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handlePrev}
                                disabled={currentPage === 1}
                                className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                                    currentPage === 1
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-teal-500 text-white hover:bg-teal-600 shadow-md hover:shadow-lg"
                                }`}
                            >
                                Anterior
                            </button>
                            <div className="flex items-center justify-center px-4 py-2 bg-white border border-teal-200 rounded-full text-sm font-bold text-teal-700 shadow-sm">
                                {currentPage} de {totalPages}
                            </div>
                            <button
                                onClick={handleNext}
                                disabled={currentPage === totalPages}
                                className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                                    currentPage === totalPages
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-teal-500 text-white hover:bg-teal-600 shadow-md hover:shadow-lg"
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