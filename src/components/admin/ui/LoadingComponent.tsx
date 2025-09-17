
const LoadingComponent = ({ message = "Cargando..." } : { message?: string }) => (
  <div className="flex justify-center items-center py-24 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-16 w-16 border-t-3 border-b-3 border-teal-500"></div>
      <p className="text-teal-600 font-medium text-lg">{message}</p>
    </div>
  </div>
);

export default LoadingComponent;
