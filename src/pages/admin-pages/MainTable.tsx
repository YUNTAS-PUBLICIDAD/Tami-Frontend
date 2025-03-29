import { FaTrash, FaCheck } from "react-icons/fa";
import AddDataModal from "../../components/AdminDashboard/AddDataModel.tsx";
import '@styles/MainTable.css'
const DataTable = () => {
  const data = [
    { id: 1, nombre: "Kiara", gmail: "namelose@gmail.com", telefono: "941825478", seccion: "WAOS", fecha: "25/01/2025" },
    { id: 2, nombre: "Carlos", gmail: "carlos@email.com", telefono: "912345678", seccion: "MKT", fecha: "10/02/2025" },
    { id: 3, nombre: "Lucia", gmail: "lucia@email.com", telefono: "987654321", seccion: "IT", fecha: "03/03/2025" },
    { id: 4, nombre: "Miguel", gmail: "miguel@email.com", telefono: "945678321", seccion: "RRHH", fecha: "18/04/2025" },
  ];

  return (
    <div className="main-table">
      {/* Botones de acciones generales */}
      <div className="main-table__buttons">
        <button>PUBLICAR</button>
        <button>EXPORTAR A CVS</button>
        <button>EXPORTAR A EXCEL</button>
        <button>EXPORTAR A PDF</button>
        <button>IMPRIMIR</button>
      </div>
      {/* Tabla */}
      <div className="table-container">
        <table className="w-full border-separate border-spacing-2 text-sm lg:text-base">
          <thead>
            <tr className="table-container__header">
              <th>ID</th>
              <th>NOMBRE</th>
              <th>GMAIL</th>
              <th>TELÉFONO</th>
              <th>SECCIÓN</th>
              <th>FECHA</th>
              <th>ACCIÓN</th>
            </tr>
          </thead>
          <tbody className="table-container__body">
            {data.map((item, index) => (
              <tr key={item.id} className={`text-center ${index % 2 === 0 ? "bg-gray-100" : "bg-gray-300"}`}>
                <td className="px-2 lg:px-4 py-2 font-bold">{item.id}</td>
                <td className="px-2 lg:px-4 py-2 font-bold">{item.nombre}</td>
                <td className="px-2 lg:px-4 py-2">{item.gmail}</td>
                <td className="px-2 lg:px-4 py-2 font-bold">{item.telefono}</td>
                <td className="px-2 lg:px-4 py-2 font-bold">{item.seccion}</td>
                <td className="px-2 lg:px-4 py-2 font-bold">{item.fecha}</td>
                <td className="px-2 lg:px-4 py-2">
                  <div className="flex justify-center gap-2">
                    <button className="cursor-pointer p-2 text-red-600 hover:text-red-800 transition" title="Eliminar">
                      <FaTrash size={16} />
                    </button>
                    <button className="cursor-pointer p-2 text-green-600 hover:text-green-800 transition" title="Confirmar">
                      <FaCheck size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AddDataModal />
    </div>
  );
};

export default DataTable;