import { useState, useEffect } from "react";
import { FaTrash, FaCheck } from "react-icons/fa";
import type Blog from "src/models/Blog.ts";
import TableRow from "./TableLayout.tsx"; // Importa el componente TableRow
import Paginator from "./Paginator.tsx"; // Importa el paginador
import { config, getApiUrl } from "config.ts";
import AddBlogModel from "./AddBlogModel.tsx";

const formatKey = (key: string): string => {
  return key
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .toUpperCase();
};

const DataTable = () => {
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
        const response = await fetch(getApiUrl(config.endpoints.blogs.list));
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

  // Total de páginas
  const totalPages = Math.ceil(data.length / itemsPerPage);

  return (
      <>
        {/* Modelo para añadir blogs */}
        <AddBlogModel />

        {/* Tabla con layout modificado */}
        <div className="overflow-x-auto p-4">
          <table className="w-full border-separate border-spacing-2">
            <thead>
            <tr className="bg-teal-600 text-white">
              {data.length > 0 &&
                  Object.keys(data[0]).map((key, index) => (
                      <th
                          key={index}
                          className="px-4 py-2 rounded-xl whitespace-nowrap"
                      >
                        {formatKey(key)}
                      </th>
                  ))}
              <th className="px-4 py-2 rounded-xl whitespace-nowrap">ACCIÓN</th>
            </tr>
            </thead>
            <tbody>
            {currentItems.map((item, index) => (
                <TableRow key={item.id} item={item} index={index} />
            ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <Paginator
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            totalPages={totalPages}
        />
      </>
  );
};

export default DataTable;
