import { FaSyncAlt } from "react-icons/fa";

const ErrorComponent = ({ error, handleRefetch } : { error?: string, handleRefetch: ()=>void } ) => (
    <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
        <div className="bg-red-50 dark:bg-red-800/20 p-6 rounded-xl max-w-md mx-auto border border-red-100 dark:border-red-900">
            <p className="text-red-600 font-medium mb-4">Error al cargar los datos:</p>
            <p className="bg-white p-3 rounded-lg text-red-500 mb-6 border border-red-100">{error}</p>
            <button
                onClick={handleRefetch}
                className="px-5 py-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 flex items-center gap-2 mx-auto transition-all duration-300 shadow-md"
            >
                <FaSyncAlt /> Intentar nuevamente
            </button>
        </div>
    </div>
);

export default ErrorComponent;
