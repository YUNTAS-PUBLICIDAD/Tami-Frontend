import TableRow from "./tables/TableRow";
import Paginator from "./Paginator";

function setCurrentPage(page: number) {
  console.log("Current page:", page);
}
const formatKey = (key: string): string => {
  return key
    .replace(/([A-Z])/g, " $1") // Agrega un espacio antes de cada mayúscula
    .replace(/_/g, " ") // Reemplaza guiones bajos con espacios
    .toUpperCase(); // Convierte a mayúsculas
};

interface TableProps {
  data: Record<string, any>[];
}
const tableLayout: React.FC<TableProps> = ({ data }) => {
  return (
    <div className="h-full p-4 flex flex-col justify-between">
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-2">
          <thead>
            <tr className="bg-teal-600 text-white">
              {Object.keys(data[0]).map((key, index) => (
                <th
                  key={index}
                  className="px-4 py-2 rounded-xl whitespace-nowrap"
                >
                  {formatKey(key)}
                </th>
              ))}
              <th className="px-4 py-2 rounded-xl whitespace-nowrap">
                ACCIONES
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <TableRow key={item.id} item={item} index={index} />
            ))}
          </tbody>
        </table>
      </div>
      <div className="relative">
        <button className="absolute bottom-0 pagination-btn">
          Añadir Dato
        </button>
        {/* Paginación */}
        <Paginator
          currentPage={1}
          onPageChange={(page) => setCurrentPage(page)}
          totalPages={1}
        />
      </div>
    </div>
  );
};

export default tableLayout;
