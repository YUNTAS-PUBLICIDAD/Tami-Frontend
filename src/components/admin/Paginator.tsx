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
    <div className="flex justify-center items-center gap-2 mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="pagination-btn"
      >
        Anterior
      </button>
      <span className="text-gray-700 font-bold">
        Página {currentPage} de {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="pagination-btn"
      >
        Siguiente
      </button>
    </div>
  );
};

export default Paginator;
