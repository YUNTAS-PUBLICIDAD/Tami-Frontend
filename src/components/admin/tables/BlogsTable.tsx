import { useState, useEffect } from "react";
import { FaTrash, FaEdit } from "react-icons/fa";
import AddBlogModal from "../AddBlogModel";
import { config, getApiUrl } from "config";

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

const BlogsTable = () => {
  const [data, setData] = useState<Blog[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(getApiUrl(config.endpoints.blogs.list));
        const result = await response.json();
        console.log("Datos recibidos:", result);
        setData(result.data || []);
      } catch (error) {
        console.error("❌ Error al cargar datos:", error);
      }
    };
    fetchData();
  }, []);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem("token");
    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este blog?");
    if (confirmDelete) {
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
          alert("Blog eliminado exitosamente");
        } else {
          alert("Error al eliminar el blog");
        }
      } catch (error) {
        console.error("Error al eliminar:", error);
        alert("Error al conectar con el servidor");
      }
    }
  };

  return (
      <div className="container mx-auto my-6">
        <h2 className="text-2xl font-bold text-teal-700 mb-6">Listado de Blogs</h2>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full text-sm text-gray-800">
            <thead className="bg-teal-600 text-white">
            <tr>
              {["ID", "TÍTULO", "PÁRRAFO", "DESCRIPCIÓN", "IMAGEN", "ACCIÓN"].map((head, i) => (
                  <th key={i} className="px-4 py-3 text-left font-semibold tracking-wide">
                    {head}
                  </th>
              ))}
            </tr>
            </thead>
            <tbody>
            {currentItems.length > 0 ? (
                currentItems.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                      <td className="px-4 py-3 font-bold">{item.id}</td>
                      <td className="px-4 py-3 font-medium">{item.titulo}</td>
                      <td className="px-4 py-3">{item.parrafo}</td>
                      <td className="px-4 py-3">{item.descripcion}</td>
                      <td className="px-4 py-3">
                        <img src={item.imagenPrincipal} alt={item.titulo} className="w-14 h-14 rounded-md object-cover" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-3">
                          <button
                              className="p-2 rounded-full hover:bg-red-100 text-red-600"
                              title="Eliminar"
                              onClick={() => handleDelete(item.id)}
                          >
                            <FaTrash size={16} />
                          </button>
                          <button
                              className="p-2 rounded-full hover:bg-yellow-100 text-yellow-600"
                              title="Editar"
                          >
                            <FaEdit size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                ))
            ) : (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-500">
                    Cargando datos...
                  </td>
                </tr>
            )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex justify-center gap-4 mt-6">
          <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="self-center text-gray-700">{`Página ${currentPage} de ${totalPages}`}</span>
          <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>

        <AddBlogModal />
      </div>
  );
};

export default BlogsTable;
