import { config, getApiUrl } from "config";
import { useState } from "react";
import { FaRegFolder } from "react-icons/fa";

async function logout() {
  try {
    const response = await fetch(getApiUrl(config.endpoints.auth.logout), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    console.log("Respuesta recibida:", response);

    const data = await response.json();
    console.log("Datos del servidor:", data);

    if (response.ok) {
      localStorage.removeItem("token"); // Eliminar token
      window.location.href = "/"; // Redirigir al inicio
    } else {
      console.error("Error en la respuesta del servidor:", data.message);
      alert(data.message || "Error al cerrar sesión");
    }
  } catch (error) {
    console.error("Error de conexión con el servidor:", error);
    alert("Error de conexión con el servidor.");
  }
}

const Sidebar = () => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const items = [
    { name: "Inicio", path: "/admin/inicio" },
    { name: "Seguimiento", path: "/admin/seguimiento" },
    { name: "Ventas", path: "/admin/ventas" },
    { name: "Usuarios", path: "/admin/usuarios" },
    { name: "productos", path: "/admin/productos"},
    { name:"blog", path:"/admin/blog"},
  ];

  return (
    <aside className="flex-1 fixed top-24 left-0 row-start-2 bg-gray-200 w-64 p-4 space-y-4 h-full text-gray-800">
      <nav>
        <ul className="space-y-1">
          <li className="font-bold text-lg">★ Administracion</li>
          {items.map((item, index) => (
            <li key={index}>
              <a
                href={item.path}
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
              >
                <FaRegFolder className="text-gray-500" />
                {item.name}
              </a>
            </li>
          ))}
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
            className={`w-10 h-5 rounded-full transition-colors duration-300 ${
              darkMode ? "bg-gray-700" : "bg-gray-400"
            }`}
          >
            <div
              className={`absolute w-4 h-4 bg-white rounded-full shadow-md transition-transform translate-y-0.5 duration-300 ${
                darkMode ? "translate-x-5" : "translate-x-1"
              }`}
            ></div>
          </div>
        </label>
      </div>

      <div className="border-t border-gray-400 pt-4 text-center">
        <div className="flex flex-col items-center space-y-1">
          <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center text-white text-lg">
            👤
          </div>
          <p className="font-semibold">Bienvenido</p>
          <p className="text-sm text-gray-600">Administrador</p>
          <button
            onClick={logout}
            className="mt-2 w-full bg-teal-500 text-white py-2 rounded-full hover:bg-teal-600 transition"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
