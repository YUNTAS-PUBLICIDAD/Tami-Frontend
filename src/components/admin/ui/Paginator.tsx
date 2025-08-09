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
            {/* Botón Primera */}
            <button
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
                className="pagination-btn"
            >
                Primera
            </button>

            {/* Botón Anterior */}
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

            {/* Botón Siguiente */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-btn"
            >
                Siguiente
            </button>

            {/* Botón Última */}
            <button
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="pagination-btn"
            >
                Última
            </button>
        </div>
    );
};

export default Paginator;