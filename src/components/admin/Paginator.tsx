/**
 * @file Paginator.tsx
 * @description Componente de paginación para la tabla de clientes.
 * Componente reutilizable que permite la navegación entre páginas de datos.
 */

const Paginator = ({
  currentPage, // Página actual
  totalPages, // Total de páginas
  onPageChange, // Función para manejar el cambio de página
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void; 
}) => {
  return (
    <div className="flex justify-center gap-2 mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-teal-500 text-white rounded disabled:opacity-50"
      >
        Anterior
      </button>
      <span className="text-gray-700 font-bold">
        Página {currentPage} de {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-teal-500 text-white rounded disabled:opacity-50"
      >
        Siguiente
      </button>
    </div>
  );
};

export default Paginator;
