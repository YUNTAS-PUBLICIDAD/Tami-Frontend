import { useState, useEffect } from "react";
import { FaTrash, FaEdit } from "react-icons/fa";
import AddBlogModal from "../AddBlogModel";
import { config, getApiUrl } from "config";

// Definir el tipo de los datos
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
  // Estado para almacenar los datos de la API
  const [data, setData] = useState<Blog[]>([]);
  // Estado para la página actual
  const [currentPage, setCurrentPage] = useState<number>(1);
  // Número de elementos por página
  const itemsPerPage = 10;

  // Cargar datos desde la API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          getApiUrl(config.endpoints.blogs.list) // Cambia la URL según tu API
        );
        const result = await response.json();

        // Verifica que la API devuelve los datos correctamente
        console.log("Datos recibidos:", result);

        // Guarda los datos en el estado
        setData(result.data || []);
      } catch (error) {
        console.error("❌ Error al cargar datos:", error);
      }
    };

    fetchData();
  }, []);

  // Calcular los datos de la página actual
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  // Cambiar de página
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Total de páginas
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem("token");
    const confirmDelete = window.confirm(
      "¿Estás seguro de que deseas eliminar este elemento?"
    );
    if (confirmDelete) {
      try {
        const response = await fetch(
          getApiUrl(config.endpoints.blogs.delete(id)),
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          setData((prevData) => prevData.filter((item) => item.id !== id));
          alert("Blog eliminado exitosamente");
        } else {
          alert("Error al eliminar el Blog");
        }
      } catch (error) {
        console.error("Error al eliminar:", error);
        alert("Error al conectar con el servidor");
      }
    }
  };

  return (
    <>
      {/* Tabla con barra de desplazamiento horizontal */}
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-2">
          <thead>
            <tr className="bg-teal-600 text-white">
              <th className="px-4 py-2 rounded-xl">ID</th>
              <th className="px-4 py-2 rounded-xl">TÍTULO</th>
              <th className="px-4 py-2 rounded-xl">PÁRRAFO</th>
              <th className="px-4 py-2 rounded-xl">DESCRIPCIÓN</th>
              <th className="px-4 py-2 rounded-xl">IMAGEN</th>
              <th className="px-4 py-2 rounded-xl">ACCIÓN</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((item) => (
                <tr
                  key={item.id}
                  className={`text-center ${
                    item.id % 2 === 0 ? "bg-gray-100" : "bg-gray-300"
                  }`}
                >
                  <td className="px-4 font-bold rounded-xl">{item.id}</td>
                  <td className="px-4 font-bold rounded-xl">{item.titulo}</td>
                  <td className="px-4 rounded-xl">{item.parrafo}</td>
                  <td className="px-4 rounded-xl">{item.descripcion}</td>
                  <td className="px-4 rounded-xl">
                    <img
                      src={item.imagenPrincipal}
                      alt={item.titulo}
                      className="w-16 h-16 rounded-md mx-auto"
                    />
                  </td>
                  <td className="px-4 rounded-xl">
                    <div className="flex justify-center gap-2">
                      <button
                        className="p-2 text-red-600 hover:text-red-800 transition"
                        title="Eliminar"
                        onClick={() => handleDelete(item.id)}
                      >
                        <FaTrash size={18} />
                      </button>
                      <button
                        className="p-2 text-yellow-600 hover:text-yellow-800 transition"
                        title="Confirmar"
                      >
                        <FaEdit size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  Cargando datos...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-teal-600 text-white rounded-md disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="mx-4 self-center">{`Página ${currentPage} de ${totalPages}`}</span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-teal-600 text-white rounded-md disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>

      <AddBlogModal />
    </>
  );
};

export default BlogsTable;
