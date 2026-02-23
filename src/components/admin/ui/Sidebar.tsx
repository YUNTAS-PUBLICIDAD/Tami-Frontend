import { config } from "../../../../config.ts";
import apiClient from "../../../services/apiClient";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import { useDarkMode } from "../../../hooks/darkMode/useDarkMode.ts";

async function logout() {
  const result = await Swal.fire({
    title: "¿Estás seguro?",
    text: "¿Deseas cerrar sesión?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, cerrar sesión",
    cancelButtonText: "Cancelar",
  });

  if (result.isConfirmed) {
    try {
      const response = await apiClient.post(config.endpoints.auth.logout);

      if (response.status === 200) {
        localStorage.removeItem("token");
        localStorage.removeItem("userInfo");
        await Swal.fire(
          "¡Sesión cerrada!",
          "Has cerrado sesión exitosamente.",
          "success"
        );
        window.location.href = "/";
      } else {
        Swal.fire("Error", response.data.message || "Error al cerrar sesión", "error");
      }
    } catch (error: any) {
      console.error("Error de conexión con el servidor:", error);
      // even if error, clear local storage for security
      localStorage.removeItem("token");
      localStorage.removeItem("userInfo");
      Swal.fire("Error", "Error de conexión con el servidor. Se cerrará la sesión localmente.", "error").then(() => {
        window.location.href = "/";
      });
    }
  }
}

const Sidebar = () => {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [currentPath, setCurrentPath] = useState("");

  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  const items = [
    { name: "Inicio", path: "/admin/inicio" },
    { name: "Seguimiento", path: "/admin/seguimiento" },
    { name: "Ventas", path: "/admin/ventas" },
    { name: "Usuarios", path: "/admin/usuarios" },
    { name: "Productos", path: "/admin/productos" },
    { name: "Blog", path: "/admin/blog" },
    { name: "Reclamaciones", path: "/admin/reclamaciones" },
  ];

  return (
    <aside
      className={`h-full w-full p-4 space-y-4 ${darkMode ? "bg-[#1e1e2f] text-white" : "bg-gray-200 text-gray-800"
        }`}
    >
      <nav className="mt-3">
        <ul className="space-y-2">
          {items.map((item, index) => {
            const isActive = currentPath === item.path;

            return (
              <li key={index}>
                <a
                  href={item.path}
                  className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 group relative ${isActive
                    ? "text-gray-900  dark:text-teal-700 font-black hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-teal-700 dark:hover:text-teal-300"
                    : "text-gray-700 dark:text-teal-500  hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-teal-700 dark:hover:text-teal-300"
                    }`}
                >
                  <svg
                    className={`w-6 h-6 fill-current ${isActive ? "text-white" : "text-teal-500"
                      } mr-2`}
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"></path>
                  </svg>
                  {item.name}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Switch animado */}
      <div className="border-t border-gray-400 pt-4 flex items-center justify-between">
        <span className="text-sm font-medium">Dark Mode</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={darkMode}
            onChange={toggleDarkMode}
          />
          <div
            className={`w-10 h-5 rounded-full transition-colors duration-300 ${darkMode ? "bg-gray-700" : "bg-gray-400"
              }`}
          >
            <div
              className={`absolute w-4 h-4 rounded-full shadow-md transition-transform translate-y-0.5 duration-300 flex items-center justify-center ${darkMode ? "translate-x-5 bg-white" : "translate-x-1 bg-white"
                }`}
            >
              {!darkMode && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3 h-3 text-yellow-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </div>
          </div>
        </label>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-600 pt-6 text-center rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-4 bg-white dark:bg-gray-800">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xl shadow-md transform hover:scale-105 transition-transform duration-300">
            <span className="text-2xl">👤</span>
          </div>
          <p className="font-bold text-lg text-gray-800 dark:text-gray-100">
            Bienvenido
          </p>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              Administrador
            </p>
          </div>
          <button
            onClick={logout}
            className="w-full bg-gradient-to-r my-2 from-teal-500 to-teal-600 text-white py-2 px-4 rounded-lg font-medium hover:from-teal-600 hover:to-teal-700 transition-all duration-300 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
