import React, { useState, useEffect, useRef } from "react";
import { FaTrash, FaEdit, FaPlus, FaEye, FaBookOpen, FaSyncAlt, FaDownload, FaChevronDown, FaFilePdf, FaFileExcel, FaFileCsv } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import AddBlogModal from "./AddBlogModel.tsx";
import { config, getApiUrl } from "config";
import Swal from "sweetalert2";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import LoadingComponent from "src/components/admin/ui/LoadingComponent";
import { SearchInput } from "src/components/admin/ui/SearchInput";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "src/components/admin/ui/Table";

interface Blog {
  id: number;
  titulo: string;
  subtitulo1: string;
  subtitulo2: string;
  subtitulo3: string;
  imagenes: { ruta_imagen: string }[];
  video_id?: string;
  video_titulo?: string;
  created_at?: string | null;
  parrafos: { parrafo: string }[];
  nombre_producto?: string;
}

interface BlogPreviewProps {
  blog: Blog | null;
  onClose: () => void;
}

const BlogsTable = () => {
  const [data, setData] = useState<Blog[]>([]);
  const [filteredData, setFilteredData] = useState<Blog[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingDeleteId, setLoadingDeleteId] = useState<number | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [editBlog, setEditBlog] = useState<Blog | null>(null);
  const itemsPerPage = 5;

  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const exportToCSV = () => {
    const ws = XLSX.utils.json_to_sheet(data.map(blog => ({
      ID: blog.id,
      Titulo: blog.titulo,
      Subtitulo: blog.subtitulo1,
      Fecha: blog.created_at ? new Date(blog.created_at).toLocaleDateString() : 'N/A'
    })));
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "blogs_reporte.csv";
    link.click();
    setIsExportOpen(false);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data.map(blog => ({
      ID: blog.id,
      Titulo: blog.titulo,
      Subtitulo: blog.subtitulo1,
      Fecha: blog.created_at ? new Date(blog.created_at).toLocaleDateString() : 'N/A'
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Blogs");
    XLSX.writeFile(workbook, "blogs_reporte.xlsx");
    setIsExportOpen(false);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Reporte de Blogs", 14, 15);

    const tableColumn = ["ID", "Titulo", "Subtitulo", "Fecha"];
    const tableRows = data.map(blog => [
      blog.id,
      blog.titulo,
      blog.subtitulo1,
      blog.created_at ? new Date(blog.created_at).toLocaleDateString() : 'N/A'
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    doc.save("blogs_reporte.pdf");
    setIsExportOpen(false);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(getApiUrl(config.endpoints.blogs.list));
      const result = await response.json();

      if (Array.isArray(result?.data)) {
        setData(result.data);
        setFilteredData(result.data);
      } else {
        console.warn("⚠️ 'data' no es un array válido:", result?.data);
        setData([]);
        setFilteredData([]);
      }
    } catch (error) {
      console.error("❌ Error al cargar datos:", error);
      setData([]);
      setFilteredData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredData(data);
      setCurrentPage(1);
    } else {
      const filtered = data.filter((blog) =>
        (blog.titulo ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (blog.subtitulo2 ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.id.toString().includes(searchTerm)
      );
      setFilteredData(filtered);
      setCurrentPage(1);
    }
  }, [searchTerm, data]);

  const handleBlogAdded = () => {
    fetchData();
    setIsAddModalOpen(false);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem("token");
    const confirmResult = await Swal.fire({
      title: "¿Estás seguro de que deseas eliminar este blog?",
      text: "¡No podrás revertir esta acción!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#14b8a6",
      cancelButtonColor: "#ef4444",
    });

    if (confirmResult.isConfirmed) {
      setLoadingDeleteId(id);
      try {
        const response = await fetch(getApiUrl(config.endpoints.blogs.delete(id)), {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          setData((prev) => prev.filter((item) => item.id !== id));
          await Swal.fire({
            title: "Eliminado",
            text: "Blog eliminado exitosamente",
            icon: "success",
            confirmButtonColor: "#14b8a6",
          });
        } else {
          await Swal.fire({
            title: "Error",
            text: "Error al eliminar el blog",
            icon: "error",
            confirmButtonColor: "#14b8a6",
          });
        }
      } catch (error) {
        console.error("Error al eliminar:", error);
        await Swal.fire({
          title: "Error",
          text: "Error al conectar con el servidor",
          icon: "error",
          confirmButtonColor: "#14b8a6",
        });
      } finally {
        setLoadingDeleteId(null);
      }
    }
  };

  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  const openEditModal = (blog: Blog) => {
    setEditBlog(blog);
    setIsAddModalOpen(true);
  };

  const handlePreview = (blog: Blog) => {
    setSelectedBlog(blog);
  };

  const closePreview = () => {
    setSelectedBlog(null);
  };

  const BlogPreview: React.FC<BlogPreviewProps> = ({ blog, onClose }) => {
    if (!blog) return null;

    // Helper para formatear la fecha
    const formatDate = (dateString?: string | null) => {
      if (!dateString) return "FECHA / HORA DE PUBLICACIÓN";
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${day}-${month}-${year} / ${hours}:${minutes}`;
    };

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-8">
        <div className="relative w-full max-w-6xl max-h-[95vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden bg-gradient-to-b from-[#041019] to-[#003E56]">
          {/* Header/Close button area */}
          <div className="flex justify-between items-center p-4 border-b border-gray-700/50 bg-black/30">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <FaEye className="text-teal-400" />
              Vista Previa Web
            </h3>
            <button
              onClick={onClose}
              className="text-white hover:text-red-400 transition-colors bg-gray-800 hover:bg-gray-700 rounded-full p-2"
              title="Cerrar vista previa"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          {/* Scrollable content simulating the website */}
          <div className="overflow-y-auto flex-1 p-4 md:p-10 custom-scrollbar space-y-10">
            
            {/* --- Vista Previa del Artículo Completo --- */}
            <div>
              <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-gray-200 p-6 md:p-12 relative mx-auto max-w-5xl">
              
              {/* Title & Subtitle */}
              <div className="mb-6 md:mb-10 text-center md:text-left">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-[#00B6FF] mb-3 break-words font-garet">
                  {blog.titulo.toUpperCase()}
                </h2>
                {blog.subtitulo1 && (
                  <h3 className="text-lg md:text-xl font-bold text-black mb-3 break-words">
                    {blog.subtitulo1.toUpperCase()}
                  </h3>
                )}
                {blog.subtitulo2 && (
                   <p className="text-base md:text-lg font-semibold text-black break-words">
                     {blog.subtitulo2}
                   </p>
                )}
              </div>

              {/* Date */}
              <div className="flex justify-center md:justify-start mb-8 md:mb-12">
                <div className="inline-block px-4 md:px-6 py-2 bg-[#00B6FF] text-white text-sm md:text-base font-semibold rounded-full shadow-md">
                  {formatDate(blog.created_at)}
                </div>
              </div>

              {/* Content Sections */}
              <div className="space-y-8 md:space-y-16">
                {blog.parrafos?.map((p, i) => (
                  <section key={i} className="mb-8 md:mb-12">
                    <div className={`flex flex-col md:flex-row ${i % 2 === 1 ? "md:flex-row-reverse" : ""} gap-4 md:gap-8 items-center`}>
                      <div className="w-full md:w-1/2 flex flex-col justify-center">
                        <article className="prose prose-sm md:prose-base lg:prose-lg text-gray-700 text-justify leading-relaxed break-words">
                          <p className="text-sm md:text-base whitespace-pre-line break-words">{p.parrafo}</p>
                        </article>
                      </div>
                      
                      {blog.imagenes?.[i]?.ruta_imagen && (
                        <div className="relative w-full md:w-1/2 h-48 md:h-72 lg:h-96 overflow-hidden rounded-lg md:rounded-xl shadow-md flex justify-center items-center bg-gray-50">
                          <img 
                            src={`${getApiUrl("")}${blog.imagenes[i].ruta_imagen}`} 
                            alt={blog.titulo}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                        </div>
                      )}
                    </div>
                  </section>
                ))}

                {blog.video_id?.trim() && (
                  <section className="rounded-lg md:rounded-xl shadow-md py-4 md:py-8 px-4 md:px-12 bg-gray-50 mt-12 border border-gray-100">
                    <h1 className="text-lg md:text-xl lg:text-2xl text-[#00B6FF] font-bold mb-4 md:mb-6 text-center md:text-left break-words">
                      {blog.video_titulo || 'Video relacionado'}
                    </h1>
                    <div className="relative w-full h-48 md:h-64 lg:h-[30rem] rounded-lg overflow-hidden">
                      <iframe
                        src={`https://www.youtube.com/embed/${blog.video_id.trim()}`}
                        className="w-full h-full"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </section>
                )}
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) return <LoadingComponent message="cargando blogs" />

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-teal-500 to-emerald-600 px-8 py-6 rounded-t-2xl">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-extrabold flex items-center gap-2 text-white">
                <FaBookOpen />
                <span>Gestión de Blog</span>
              </h2>
              <p className="text-teal-50 mt-2 text-lg">
                Administra todas las publicaciones del blog de tu empresa
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-center">
              {/* Dropdown Exportar */}
              <div className="relative inline-block text-left" ref={exportMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsExportOpen(!isExportOpen)}
                  className="flex items-center gap-2 bg-teal-50 dark:bg-white text-teal-700 dark:text-teal-600 hover:bg-teal-100 dark:hover:bg-teal-50 transition-all duration-300 px-4 py-2 rounded-lg text-sm font-bold shadow-sm border border-teal-200 dark:border-white cursor-pointer"
                >
                  <FaDownload className="h-4 w-4" />
                  <span>Exportar</span>
                  <FaChevronDown className={`h-3 w-3 transition-transform ${isExportOpen ? "rotate-180" : ""}`} />
                </button>

                {isExportOpen && (
                  <div className="absolute right-0 mt-2 w-48 origin-top-right bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700 rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-fade-in-down">
                    <div className="py-1">
                      <button
                        onClick={exportToPDF}
                        className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-teal-50 dark:hover:bg-gray-700 hover:text-teal-700 dark:hover:text-teal-400 cursor-pointer"
                      >
                        <FaFilePdf className="mr-3 h-5 w-5 text-red-500" />
                        PDF
                      </button>
                      <button
                        onClick={exportToExcel}
                        className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-teal-50 dark:hover:bg-gray-700 hover:text-teal-700 dark:hover:text-teal-400 cursor-pointer"
                      >
                        <FaFileExcel className="mr-3 h-5 w-5 text-green-600" />
                        Excel
                      </button>
                      <button
                        onClick={exportToCSV}
                        className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-teal-50 dark:hover:bg-gray-700 hover:text-teal-700 dark:hover:text-teal-400 cursor-pointer"
                      >
                        <FaFileCsv className="mr-3 h-5 w-5 text-blue-500" />
                        CSV
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Botón Añadir Blog */}
              <div className="flex-shrink-0">
                <button
                  type="button"
                  onClick={openAddModal}
                  className="flex items-center gap-2 bg-teal-600 text-white hover:bg-teal-700 transition-all duration-300 px-5 py-3 rounded-lg text-sm font-bold shadow-lg hover:shadow-xl cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Añadir Blog
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <SearchInput placeholder="Buscar blogs..." value={searchTerm} onChange={setSearchTerm} />
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={fetchData}
                disabled={isLoading}
                className="flex items-center gap-2 bg-white dark:bg-gray-700 text-teal-600 dark:text-teal-400 border-2 border-teal-500 dark:border-teal-600 hover:bg-teal-50 dark:hover:bg-gray-600 transition-all duration-300 px-5 py-3 rounded-full text-sm font-bold w-full sm:w-auto justify-center shadow-sm cursor-pointer"
              >
                <FaSyncAlt className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                {isLoading ? "Cargando..." : "Actualizar Catálogo"}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between bg-teal-50 dark:bg-gray-700 p-4 rounded-xl border border-teal-100 dark:border-gray-600 shadow-sm">
            <div className="text-sm font-medium text-teal-700 dark:text-teal-300 flex items-center gap-2">
              <span className="bg-teal-500 text-white text-sm font-bold py-1 px-3 rounded-full">
                {filteredData.length}
              </span>
              {filteredData.length === 1 ? "publicación" : "publicaciones"} encontradas
            </div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              {["ID", "TÍTULO", "SUBTÍTULO", "IMAGEN", "ACCIÓN"].map((head, i) => (
                <TableHead key={i} className="font-bold tracking-wide uppercase text-xs">
                  {head}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length > 0 ? (
              currentItems.map((blog) => (
                <TableRow key={blog.id}>
                  <TableCell className="whitespace-nowrap text-teal-700">
                    #{blog.id}
                  </TableCell>
                  <TableCell className="px-6 py-4 font-medium max-w-[250px] truncate">
                    <span title={blog.titulo}>{blog.titulo}</span>
                  </TableCell>
                  <TableCell className="px-6 py-4 max-w-[250px] truncate">
                    <div title={blog.subtitulo1}>
                      <span className="bg-teal-100 text-teal-800 py-1 px-3 rounded-full text-xs font-medium">
                        {blog.subtitulo1 ? blog.subtitulo1 : 'Sin subtítulo'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center">
                      {blog.imagenes?.[0]?.ruta_imagen ? (
                        <img
                          src={`${getApiUrl("")}${blog.imagenes[0].ruta_imagen}`}
                          alt={blog.titulo}
                          className="w-14 h-14 object-cover rounded-lg shadow-md border border-gray-200"
                        />
                      ) : (
                        <span className="text-sm text-gray-400 italic">Sin imagen</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-3 items-center">
                      <button
                        className="p-2 rounded-full hover:bg-teal-100 text-teal-500 transition-colors duration-200 border border-transparent hover:border-teal-200 cursor-pointer"
                        title="Ver Detalles"
                        onClick={() => handlePreview(blog)}
                      >
                        <FaEye size={18} />
                      </button>
                      <button
                        className="p-2 rounded-full hover:bg-yellow-100 text-yellow-500 transition-colors duration-200 border border-transparent hover:border-yellow-200 cursor-pointer"
                        title="Editar"
                        onClick={() => openEditModal(blog)}
                      >
                        <FaEdit size={18} />
                      </button>
                      <button
                        className="p-2 rounded-full hover:bg-red-100 text-red-500 transition-colors duration-200 border border-transparent hover:border-red-200 cursor-pointer"
                        title="Eliminar"
                        onClick={() => handleDelete(blog.id)}
                        disabled={loadingDeleteId === blog.id}
                      >
                        {loadingDeleteId === blog.id ? (
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
              <TableRow>
                <TableCell colSpan={5} className="text-center py-16 text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="bg-teal-50 p-6 rounded-full">
                      <FaBookOpen className="h-10 w-10 text-teal-300" />
                    </div>
                    <p className="text-xl font-medium text-gray-600 mt-4">
                      {searchTerm ? "No se encontraron blogs que coincidan con tu búsqueda" : "No hay blogs registrados"}
                    </p>
                    <p className="text-gray-400 max-w-md mx-auto">
                      {searchTerm ? "Intenta con otros términos de búsqueda" : "Comienza agregando publicaciones a tu blog con el botón 'Añadir Blog'"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Paginación */}
        {filteredData.length > 0 && (
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

      <AddBlogModal
        onBlogAdded={handleBlogAdded}
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditBlog(null);
        }}
        blogToEdit={editBlog}
      />
      {selectedBlog && <BlogPreview blog={selectedBlog} onClose={closePreview} />}
    </div>
  );
};

export default BlogsTable;