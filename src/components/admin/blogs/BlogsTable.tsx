import React, { useState, useEffect } from "react";
import { FaTrash, FaEdit, FaPlus, FaSearch, FaEye } from "react-icons/fa";
import AddBlogModal from "./AddBlogModel.tsx";
import { config, getApiUrl } from "config";
import Swal from "sweetalert2";

interface Blog {
  id: number;
  titulo: string;
  parrafo: string;
  descripcion: string;
  imagenPrincipal: string;
  tituloBlog?: string;
  subTituloBlog?: string;
  videoBlog?: string;
  tituloVideoBlog?: string;
  created_at?: string | null;
}

interface BlogPreviewProps {
  blog: Blog | null;
  onClose: () => void;
}

const BlogsTable = () => {
  const [data, setData] = useState<Blog[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [editBlog, setEditBlog] = useState<Blog | null>(null);
  const itemsPerPage = 6;

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(getApiUrl(config.endpoints.blogs.list));
      const result = await response.json();
      setData(result.data || []);
    } catch (error) {
      console.error("❌ Error al cargar datos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBlogAdded = () => {
    fetchData(); // recarga la tabla
    setIsAddModalOpen(false); // opcional, si controlas el modal desde aquí
  };

  const filteredData = data.filter(blog =>
      blog.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem("token");
    const confirmResult = await Swal.fire({
      title: "¿Estás seguro de que deseas eliminar este blog?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (confirmResult.isConfirmed) {
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
          await Swal.fire("Eliminado", "Blog eliminado exitosamente", "success");
        } else {
          await Swal.fire("Error", "Error al eliminar el blog", "error");
        }
      } catch (error) {
        console.error("Error al eliminar:", error);
        await Swal.fire("Error", "Error al conectar con el servidor", "error");
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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="relative">
              <img
                  src={blog.imagenPrincipal}
                  alt={blog.titulo}
                  className="w-full h-64 object-cover rounded-t-xl"
              />
              <button
                  onClick={onClose}
                  className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <div className="p-6">
              <h2 className="text-3xl font-bold text-teal-700 mb-2">{blog.titulo}</h2>
              <p className="text-gray-500 mb-4">{blog.created_at ? new Date(blog.created_at).toLocaleDateString() : 'Fecha no disponible'}</p>

              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold text-teal-600 mb-2">{blog.tituloBlog || 'Sin título de blog'}</h3>
                <p className="text-gray-700 mb-4">{blog.parrafo}</p>

                <div className="my-6">
                  <h4 className="text-lg font-medium text-teal-600 mb-2">{blog.subTituloBlog || 'Acerca de este blog'}</h4>
                  <p className="text-gray-700">{blog.descripcion}</p>
                </div>

                {blog.videoBlog && (
                    <div className="my-6">
                      <h4 className="text-lg font-medium text-teal-600 mb-2">{blog.tituloVideoBlog || 'Video relacionado'}</h4>
                      <div className="aspect-w-16 aspect-h-9">
                        <iframe
                            src={blog.videoBlog}
                            className="w-full h-64 rounded-lg"
                            allowFullScreen
                        ></iframe>
                      </div>
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>
    );
  };

  return (
      <div className="bg-gray-50 min-h-screen pb-12 sm:pb-16 md:pb-20 lg:pb-24 xl:pb-28">
        <div className="bg-gradient-to-r from-teal-600 to-teal-400 text-white p-8 shadow-md">
          <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-2">Gestión de Blog</h1>
            <p className="text-teal-50">Administra todas las publicaciones del blog de tu empresa</p>
          </div>
        </div>

        <div className="container mx-auto px-4 -mt-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
              <div className="relative flex-grow max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                    type="text"
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Buscar blogs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <AddBlogModal 
                onBlogAdded={handleBlogAdded} 
                isOpen={isAddModalOpen} 
                onClose={() => { setIsAddModalOpen(false); setEditBlog(null); }} 
                blogToEdit={editBlog} 
              />
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
                </div>
            ) : currentItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentItems.map((blog) => (
                      <div key={blog.id} className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                        <div className="relative h-48">
                          <img
                              src={blog.imagenPrincipal}
                              alt={blog.titulo}
                              className="w-full h-full object-cover"
                          />
                          <div className="absolute top-0 right-0 m-2 flex space-x-1">
                            <button
                                onClick={() => handlePreview(blog)}
                                className="p-2 bg-white rounded-full hover:bg-teal-50 text-teal-600 shadow-md"
                                title="Vista previa"
                            >
                              <FaEye size={16} />
                            </button>
                            <button
                              className="p-2 bg-white rounded-full hover:bg-yellow-50 text-yellow-600 shadow-md"
                              title="Editar"
                              onClick={() => openEditModal(blog)}
                            >
                              <FaEdit size={16} />
                            </button>
                            <button
                                onClick={() => handleDelete(blog.id)}
                                className="p-2 bg-white rounded-full hover:bg-red-50 text-red-600 shadow-md"
                                title="Eliminar"
                            >
                              <FaTrash size={16} />
                            </button>
                          </div>
                        </div>

                        <div className="p-5 flex-grow flex flex-col">
                          <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">{blog.titulo}</h3>
                          <p className="text-gray-500 text-sm mb-3 line-clamp-2">{blog.descripcion}</p>
                          <div className="mt-auto pt-4 flex justify-between items-center">
                            <span className="text-xs text-gray-500">ID: {blog.id}</span>
                            <span className="px-3 py-1 bg-teal-50 text-teal-600 rounded-full text-xs font-medium">Blog</span>
                          </div>
                        </div>
                      </div>
                  ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No se encontraron blogs</h3>
                  <p className="mt-1 text-gray-500">Intenta con otra búsqueda o crea un nuevo blog.</p>
                </div>
            )}

            {/* Paginación */}
            {filteredData.length > 0 && (
                <div className="flex justify-center gap-2 mt-8">
                  <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 text-sm"
                  >
                    Anterior
                  </button>

                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    // Mostrar las páginas cercanas a la actual
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
                            className={`px-3 py-1 border rounded-md text-sm ${
                                currentPage === pageToShow
                                    ? 'bg-teal-500 text-white border-teal-500'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                          {pageToShow}
                        </button>
                    );
                  })}

                  <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 text-sm"
                  >
                    Siguiente
                  </button>
                </div>
            )}
          </div>

          {/*<div className="mt-6 bg-white rounded-xl shadow-lg p-6">*/}
          {/*  <h2 className="text-xl font-bold text-teal-700 mb-4">Estadísticas del Blog</h2>*/}
          {/*  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">*/}
          {/*    <div className="bg-teal-50 p-4 rounded-lg border border-teal-100">*/}
          {/*      <h3 className="text-teal-700 font-medium mb-1">Total de Blogs</h3>*/}
          {/*      <p className="text-3xl font-bold text-teal-800">{data.length}</p>*/}
          {/*    </div>*/}
          {/*    <div className="bg-teal-50 p-4 rounded-lg border border-teal-100">*/}
          {/*      <h3 className="text-teal-700 font-medium mb-1">Blogs este mes</h3>*/}
          {/*      <p className="text-3xl font-bold text-teal-800">*/}
          {/*        {data.filter(blog => {*/}
          {/*          if (!blog.created_at) return false;*/}
          {/*          const date = new Date(blog.created_at);*/}
          {/*          const now = new Date();*/}
          {/*          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();*/}
          {/*        }).length}*/}
          {/*      </p>*/}
          {/*    </div>*/}
          {/*    <div className="bg-teal-50 p-4 rounded-lg border border-teal-100">*/}
          {/*      <h3 className="text-teal-700 font-medium mb-1">Con video</h3>*/}
          {/*      <p className="text-3xl font-bold text-teal-800">*/}
          {/*        {data.filter(blog => blog.videoBlog).length}*/}
          {/*      </p>*/}
          {/*    </div>*/}
          {/*  </div>*/}
          {/*</div>*/}
        </div>
        {/* Vista previa del blog */}
        {selectedBlog && <BlogPreview blog={selectedBlog} onClose={closePreview} />}
      </div>
  );
};

export default BlogsTable;