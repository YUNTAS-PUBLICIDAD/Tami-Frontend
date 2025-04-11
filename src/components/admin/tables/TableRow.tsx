import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

interface TableRowProps {
  item: Record<string, any>; // Objeto genérico con claves dinámicas
  index: number;
}

const TableRow: React.FC<TableRowProps> = ({ item, index }) => {
  return (
    <tr
      className={`text-center ${
        index % 2 === 0 ? "bg-gray-200" : "bg-slate-200"
      }`}
    >
      {Object.entries(item).map(([key, value], index) => (
        <td key={index} className="px-4 py-2 rounded-xl">
          {key.toLowerCase().includes("imagen") && typeof value === "string" ? (
            <img
              src={value}
              alt={key}
              className="w-16 h-16 rounded-md mx-auto"
            />
          ) : (
            value
          )}
        </td>
      ))}
      <td className="px-4 py-2 rounded-xl">
        <div className="flex justify-center gap-2">
          <button
            className="p-2 text-red-600 hover:text-red-800 transition"
            title="Eliminar"
          >
            <FaTrash size={18} />
          </button>
          <button
            className="p-2 text-green-600 hover:text-green-800 transition"
            title="Confirmar"
          >
            <FaEdit size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default TableRow;
