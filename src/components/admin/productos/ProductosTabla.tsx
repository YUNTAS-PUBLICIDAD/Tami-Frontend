import React, { useEffect, useState } from "react";
import EditProduct from "./EditProduct";
import { deleteProduct, getProducts } from "src/hooks/admin/productos/productos";
import type Product from "src/models/Product";
import { FaTrash, FaSearch, FaSyncAlt, FaPlus, FaTags, FaWhatsapp } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import AddProduct from "./AddProduct";
import Swal from "sweetalert2";
import { config } from "config";
import LoadingComponent from "src/components/admin/ui/LoadingComponent";
import { SearchInput } from "src/components/admin/ui/SearchInput";
import { TablePagination } from "src/components/admin/ui/TablePagination.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "src/components/admin/ui/Table";
import GenericModal from "src/components/admin/ui/GenericModal";

const EmptyState = ({ term }: { term: string }) => (
    <TableRow>
        <TableCell colSpan={5} className="text-center py-16 text-gray-500">
            <div className="flex flex-col items-center justify-center gap-2">
                <div className="bg-teal-50 p-6 rounded-full">
                    <FaTags className="h-10 w-10 text-teal-300" />
                </div>
                <p className="text-xl font-medium text-gray-600 mt-4">
                    {term ? "No se encontraron productos que coincidan con tu búsqueda" : "No hay productos registrados"}
                </p>
                <p className="text-gray-400 max-w-md mx-auto">
                    {term ? "Intenta con otros términos de búsqueda" : "Comienza agregando productos a tu catálogo con el botón 'Agregar Producto'"}
                </p>
            </div>
        </TableCell>
    </TableRow>
);
import WhatsappFormWithTabs from "src/components/admin/whatsapp/WhatsappFormWithTabs";
import ExportMenu from "src/components/admin/ui/ExportMenu";

const getApiUrl = config.apiUrl;

const DEPLOY_TIMEOUT = 180; // 3 minutos
const isClient = typeof window !== "undefined";

const ProductosTabla = () => {
    //  Todos los useState dentro del componente
    const [deployInProgress, setDeployInProgress] = useState(false);
    const [deployRemaining, setDeployRemaining] = useState<number | null>(null);
    const [productos, setProductos] = useState<Product[]>([]);
    const [filteredProductos, setFilteredProductos] = useState<Product[]>([]);
    const [loadingDeleteId, setLoadingDeleteId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [isWhatsappModalOpen, setIsWhatsappModalOpen] = useState(false);
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


    //  Inicializar el estado del deploy desde localStorage al montar
    useEffect(() => {
        const stored = localStorage.getItem("deployCooldownUntil");
        if (stored) {
            const cooldownEnd = Number(stored);
            const now = Date.now();
            const diff = Math.floor((cooldownEnd - now) / 1000);

            if (diff > 0) {
                setDeployInProgress(true);
                setDeployRemaining(diff);
            } else {
                localStorage.removeItem("deployCooldownUntil");
            }
        }
    }, []);


    //  Contador que sincroniza con localStorage cada segundo
    useEffect(() => {
        if (!deployInProgress || deployRemaining === null || deployRemaining <= 0) {
            if (deployRemaining !== null && deployRemaining <= 0) {
                setDeployInProgress(false);
                setDeployRemaining(null);
                localStorage.removeItem("deployCooldownUntil");

                Swal.fire({
                    icon: "success",
                    title: "✅ Despliegue completado",
                    text: "Ya puedes volver a desplegar cambios.",
                    confirmButtonColor: "#14b8a6",
                    timer: 3000,
                    timerProgressBar: true,
                });
            }
            return;
        }

        const timer = setInterval(() => {
            const stored = localStorage.getItem("deployCooldownUntil");
            if (!stored) {
                setDeployInProgress(false);
                setDeployRemaining(null);
                return;
            }

            const diff = Math.floor((Number(stored) - Date.now()) / 1000);

            if (diff <= 0) {
                setDeployInProgress(false);
                setDeployRemaining(null);
                localStorage.removeItem("deployCooldownUntil");

                Swal.fire({
                    icon: "success",
                    title: "✅ Actualización completada",
                    text: "Ya puedes volver a actualizar cambios.",
                    confirmButtonColor: "#14b8a6",
                    timer: 3000,
                    timerProgressBar: true,
                });
            } else {
                setDeployRemaining(diff);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [deployInProgress, deployRemaining]);










    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredProductos.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredProductos.length / itemsPerPage);

    const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
    const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

    if (isLoading) return <LoadingComponent message="cargando productos" />

    const handleDeploy = async () => {
        if (deployInProgress) {
            Swal.fire({
                icon: "info",
                title: "⏳ Despliegue en curso",
                html: `Podrás volver a desplegar en <b>${deployRemaining}</b> segundos`,
                confirmButtonColor: "#14b8a6",
                timer: 2000,
                timerProgressBar: true,
            });
            return;
        }

        const result = await Swal.fire({
            title: "¿Actualizar cambios?",
            text: "Esta acción actualizará el frontend con los últimos datos.",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#14b8a6",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Sí, actualizar",
            cancelButtonText: "Cancelar",
        });

        if (!result.isConfirmed) return;

        try {
            // ✅ Verificar que el token exista
            const token = localStorage.getItem("token");

            if (!token) {
                Swal.fire({
                    icon: "error",
                    title: "❌ Error de autenticación",
                    text: "No se encontró el token de sesión. Por favor, inicia sesión nuevamente.",
                    confirmButtonColor: "#14b8a6",
                });
                return;
            }

            setDeployInProgress(true);
            setDeployRemaining(DEPLOY_TIMEOUT);

            if (typeof window !== "undefined") {
                localStorage.setItem(
                    "deployCooldownUntil",
                    String(Date.now() + DEPLOY_TIMEOUT * 1000)
                );
            }

            Swal.fire({
                title: "🚀 Despliegue iniciado",
                html: "El despliegue está en curso. Puedes seguir navegando.",
                icon: "success",
                confirmButtonColor: "#14b8a6",
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
            });

            const res = await fetch(
                `${config.apiUrl}/api/v1/frontend/deploy`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                }
            );

            // ✅ Manejar diferentes tipos de error
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ message: "Error desconocido" }));

                if (res.status === 401) {
                    throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
                } else if (res.status === 403) {
                    throw new Error("No tienes permisos para realizar esta acción.");
                } else {
                    throw new Error(errorData.message || "Error al iniciar el despliegue");
                }
            }

            const data = await res.json();
            console.log("Deploy exitoso:", data);

        } catch (e) {
            console.error("Error en deploy:", e);

            setDeployInProgress(false);
            setDeployRemaining(null);

            if (typeof window !== "undefined") {
                localStorage.removeItem("deployCooldownUntil");
            }

            Swal.fire({
                icon: "error",
                title: "❌ Error",
                text: e instanceof Error ? e.message : "No se pudo iniciar el despliegue.",
                confirmButtonColor: "#14b8a6",
            });
        }
    };



return (
    <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
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

                    <div className="flex flex-col sm:flex-row gap-3 items-center">


                        {/* Botón de Exportar */}
                        <ExportMenu data={filteredProductos} fileName="Reporte_Productos_Tami" />

                        {/* Botón de Agregar */}
                        <div className="flex-shrink-0">
                            <AddProduct onProductAdded={fetchData} />
                        </div>

                    </div>

                </div>
            </div>

            <div className="p-8 space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <SearchInput placeholder="Buscar productos..." value={searchTerm} onChange={setSearchTerm} />
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">

                        <button
                            onClick={handleDeploy}
                            disabled={deployInProgress}
                            className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold w-full sm:w-auto justify-center shadow-md transition-all
    ${deployInProgress
                                    ? "bg-gray-400 cursor-not-allowed text-white"
                                    : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                                }`}
                        >
                            <FaSyncAlt className={`h-4 w-4 ${deployInProgress ? "animate-spin" : ""}`} />
                            {deployInProgress
                                ? `Actualizando (${deployRemaining}s)`
                                : "Actualizar Cambios"}
                        </button>

                        <button
                            onClick={() => setIsWhatsappModalOpen(true)}
                            className="flex items-center gap-2 bg-white text-green-600 border-2 border-green-500 hover:bg-green-50 transition-all duration-300 px-5 py-3 rounded-full text-sm font-bold w-full sm:w-auto justify-center shadow-sm"
                        >
                            <FaWhatsapp className="h-5 w-5" />
                            Conexión WhatsApp
                        </button>

                        <button
                            onClick={fetchData}
                            disabled={isLoading}
                            className="flex items-center gap-2 bg-white text-teal-600 border-2 border-teal-500 hover:bg-teal-50 transition-all duration-300 px-5 py-3 rounded-full text-sm font-bold w-full sm:w-auto justify-center shadow-sm"
                        >
                            <FaSyncAlt className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                            {isLoading ? "Cargando..." : "Actualizar Catálogo"}
                        </button>
                    </div>
                </div>

                <GenericModal
                    isOpen={isWhatsappModalOpen}
                    onClose={() => setIsWhatsappModalOpen(false)}
                    title="Canal de Comunicación WhatsApp"
                >
                    <WhatsappFormWithTabs
                        onClose={() => setIsWhatsappModalOpen(false)}
                    />
                </GenericModal>

                <div className="flex items-center justify-between bg-teal-50 p-4 rounded-xl border border-teal-100 shadow-sm">
                    <div className="text-sm font-medium text-teal-700 flex items-center gap-2">
                        <span className="bg-teal-500 text-white text-sm font-bold py-1 px-3 rounded-full">
                            {filteredProductos.length}
                        </span>
                        {filteredProductos.length === 1 ? "producto" : "productos"} encontrados
                    </div>
                </div>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        {["ID", "NOMBRE", "SECCIÓN", "IMAGEN", "ACCIÓN"].map((head, i) => (
                            <TableHead key={i} className="font-bold tracking-wide uppercase text-xs">
                                {head}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {currentItems.length > 0 ? (
                        currentItems.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="whitespace-nowrap text-teal-700">
                                    #{item.id}
                                </TableCell>
                                <TableCell className="px-6 py-4 font-medium">{item.nombre}</TableCell>
                                <TableCell className="px-6 py-4">
                                    <span className="bg-teal-100 text-teal-800 py-1 px-3 rounded-full text-xs capitalize font-medium">
                                        {item.seccion ? item.seccion.toLowerCase() : 'sin sección'}
                                    </span>
                                </TableCell>
                                <TableCell className="px-6 py-4">
                                    <div className="flex items-center">
                                        {item.imagenes?.[0]?.url_imagen ? (
                                            <img
                                                src={item.imagenes[0].url_imagen.startsWith("http")
                                                    ? item.imagenes[0].url_imagen
                                                    : `${getApiUrl}${item.imagenes[0].url_imagen}`}
                                                alt={item.nombre}
                                                className="w-14 h-14 object-cover rounded-lg shadow-md border border-gray-200"
                                            // onError={(e) => {
                                            //     (e.target as HTMLImageElement).src = 'https://via.placeholder.com/50';
                                            // }}
                                            />
                                        ) : (
                                            <span className="text-sm text-gray-400 italic">Sin imagen</span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-4 whitespace-nowrap">
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
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <EmptyState term={searchTerm} />
                    )}
                </TableBody>
            </Table>

            {/* Paginación */}
            {filteredProductos.length > 0 && (
                <TablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    setCurrentPage={setCurrentPage}
                />
            )}

        </div>
    </div>
);
};

export default ProductosTabla;