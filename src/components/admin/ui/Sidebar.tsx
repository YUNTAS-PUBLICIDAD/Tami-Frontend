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
    { 
      name: "Inicio", path: "/admin/inicio",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
    },
    { 
      name: "Seguimiento", path: "/admin/seguimiento",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M12 11h4"></path><path d="M12 16h4"></path><path d="M8 11h.01"></path><path d="M8 16h.01"></path></svg>
    },
    { 
      name: "Ventas", path: "/admin/ventas",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
    },
    { 
      name: "Usuarios", path: "/admin/usuarios",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
    },
    { 
      name: "Productos", path: "/admin/productos",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
    },
    { 
      name: "Blog", path: "/admin/blog",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
    },
    { 
      name: "Reclamaciones", path: "/admin/reclamaciones",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
    },
    { 
      name: "Pop-ups", path: "/admin/popups",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l18-5v12L3 14v-3z"></path><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path></svg>
    },
  ];

  return (
    <aside
      className={`h-full w-full p-4 flex flex-col overflow-y-auto space-y-4 ${darkMode ? "bg-[#1e1e2f] text-white" : "bg-white text-gray-800"
        }`}
    >
      <nav className="mt-1 flex-1">
        <ul className="space-y-3">
          {items.map((item, index) => {
            const isActive = currentPath === item.path;

            return (
              <li key={index}>
                <a
                  href={item.path}
                  className={`flex items-center px-4 py-2.5 rounded-xl transition-all duration-300 group relative ${isActive
                    ? "bg-[#E6F7F9] dark:bg-teal-900 text-[#0f2c59] dark:text-teal-100 font-bold shadow-sm"
                    : "text-[#0f2c59] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium"
                    }`}
                >
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-xl mr-4 transition-colors duration-300 ${isActive
                      ? "bg-[#A3E4D7] dark:bg-teal-700 text-[#0f2c59] dark:text-teal-50"
                      : "bg-gray-100 dark:bg-gray-700 text-[#30538a] dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-600"
                      }`}
                  >
                    {item.icon}
                  </div>
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
