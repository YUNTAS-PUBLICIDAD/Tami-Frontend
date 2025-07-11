import { config, getApiUrl } from "../../../../config.ts";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";

async function logout() {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: '¿Deseas cerrar sesión?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, cerrar sesión',
    cancelButtonText: 'Cancelar',
  });

  if (result.isConfirmed) {
    try {
      const response = await fetch(getApiUrl(config.endpoints.auth.logout), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.removeItem('token');
        await Swal.fire('¡Sesión cerrada!', 'Has cerrado sesión exitosamente.', 'success');
        window.location.href = '/';
      } else {
        console.error('Error en la respuesta del servidor:', data.message);
        Swal.fire('Error', data.message || 'Error al cerrar sesión', 'error');
      }
    } catch (error) {
      console.error('Error de conexión con el servidor:', error);
      Swal.fire('Error', 'Error de conexión con el servidor.', 'error');
    }
  }
}

const Sidebar = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [currentPath, setCurrentPath] = useState("");

  // Detectar la ruta actual de manera segura usando useEffect
  useEffect(() => {
    // Solo ejecutar en el cliente
    setCurrentPath(window.location.pathname);
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(newDarkMode));
  };

  const items = [
    { name: "Inicio", path: "/admin/inicio" },
    { name: "Seguimiento", path: "/admin/seguimiento" },
    { name: "Ventas", path: "/admin/ventas" },
    { name: "Usuarios", path: "/admin/usuarios" },
    { name: "Productos", path: "/admin/productos"},
    { name:"Blog", path:"/admin/blog"},
  ];

  return (
      <aside className="flex-1 fixed left-0 w-full row-start-2 bg-gray-200 dark:bg-gray-900 p-4 space-y-4 h-full text-gray-800 dark:text-gray-100 md:w-76 md:block">
        <nav className="mt-3">
          <ul className="space-y-2">
            {items.map((item, index) => {
              const isActive = currentPath === item.path;

              return (
                  <li key={index}>
                    <a
                        href={item.path}
                        className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 group relative ${
                            isActive
                                ? 'bg-teal-500 text-white'
                                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-teal-700 dark:hover:text-teal-300'
                        }`}
                    >
                      <svg
                          className={`w-6 h-6 fill-current ${isActive ? 'text-white' : 'text-teal-500'} mr-2`}
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
        <div className="flex items-center justify-between">
          <button
              onClick={toggleDarkMode}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-lg bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm hover:shadow px-4 transition-all duration-300"
          >
            {darkMode ? (
                <>
                  <span className="text-xl">🌙</span>
                  <span className="font-medium">Modo Oscuro</span>
                </>
            ) : (
                <>
                  <span className="text-xl">☀️</span>
                  <span className="font-medium">Modo Claro</span>
                </>
            )}
          </button>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-600 pt-6 text-center rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-4 bg-white dark:bg-gray-800">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-16 h-16 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xl shadow-md transform hover:scale-105 transition-transform duration-300">
              <span className="text-2xl">👤</span>
            </div>
            <p className="font-bold text-lg text-gray-800 dark:text-gray-100">Bienvenido</p>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Administrador</p>
            </div>
            <button
                onClick={logout}
                className="w-full bg-gradient-to-r my-2 from-teal-500 to-teal-600 text-white py-2 px-4 rounded-lg font-medium hover:from-teal-600 hover:to-teal-700 transition-all duration-300 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50">
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>
  );
};

export default Sidebar;