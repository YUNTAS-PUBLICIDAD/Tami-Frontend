import { config, getApiUrl } from "config";
import { useState } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";

const AddDataModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombres: "",
    telefono: "",
    gmail: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Importa SweetAlert2

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombres || !formData.telefono || !formData.gmail) {
      Swal.fire({
        icon: "warning",
        title: "Campos obligatorios",
        text: "⚠️ Todos los campos son obligatorios.",
      });
      return;
    }

    try {
      const dataToSend = {
        name: formData.nombres,
        celular: formData.telefono,
        email: formData.gmail,
      };

      const response = await fetch(
        getApiUrl(config.endpoints.clientes.create),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(dataToSend),
        }
      );

      const data = await response.json();
      console.log("Respuesta del servidor:", data);

      if (response.ok) {
        await Swal.fire({
          icon: "success",
          title: "Usuario registrado",
          text: "✅ Usuario registrado exitosamente",
        });
        setIsOpen(false);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: `❌ Error: ${data.message}`,
        });
      }
    } catch (error) {
      console.error("Error al enviar los datos:", error);
      Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "❌ Hubo un error en la conexión con la API.",
      });
    }
  };

  return (
      <>
        {/* Botón para abrir el modal */}
        <button
            onClick={() => setIsOpen(true)}
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg shadow-md transition-colors duration-300 flex items-center gap-2"
        >
          <FaPlus className="text-sm" />
          Añadir dato
        </button>

        {/* Modal */}
        {isOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Encabezado */}
                <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">Añadir Nuevo Cliente</h2>
                  <button
                      onClick={() => setIsOpen(false)}
                      className="text-white hover:text-indigo-200 transition-colors"
                  >
                    <FaTimes className="text-lg" />
                  </button>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Nombres*
                    </label>
                    <input
                        type="text"
                        name="nombres"
                        value={formData.nombres}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        placeholder="Ingrese nombres completos"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Teléfono*
                    </label>
                    <input
                        type="text"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        placeholder="Ingrese número telefónico"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Correo Electrónico*
                    </label>
                    <input
                        type="email"
                        name="gmail"
                        value={formData.gmail}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        placeholder="Ingrese dirección de correo"
                    />
                  </div>

                  {/* Botones */}
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
                    >
                      <FaPlus />
                      Añadir Cliente
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}
      </>
  );
};

export default AddDataModal;