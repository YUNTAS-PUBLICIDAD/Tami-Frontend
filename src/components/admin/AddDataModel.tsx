import { config, getApiUrl } from "config";
import { useState } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";

const AddDataModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombres: "",
    telefono: "",
    gmail: "",
    // seccion: "",
    // fecha: "",
  });

  // Función para manejar el cambio en los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Función para enviar los datos a la API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombres || !formData.telefono || !formData.gmail) {
      alert("⚠️ Todos los campos son obligatorios.");
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
      console.log("Respuesta del servidor:", data); // Verifica la respuesta

      if (response.ok) {
        alert("✅ Usuario registrado exitosamente");
        setIsOpen(false); // Cerrar modal
      } else {
        alert(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error al enviar los datos:", error);
      alert("❌ Hubo un error en la conexión con la API.");
    }
  };

  return (
    <>
      {/* Botón para abrir el modal */}
      <button onClick={() => setIsOpen(true)} className="mt-4 admin-act-btn">
        Añadir dato
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/75">
          <div className="bg-teal-600 text-white px-10 py-8 rounded-4xl w-3/5">
            <h2 className="text-2xl font-bold mb-4">AÑADIR DATOS</h2>

            {/* Formulario */}
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-2 gap-4 gap-x-12"
            >
              <div>
                <label className="block">Nombres</label>
                <input
                  type="text"
                  name="nombres"
                  value={formData.nombres}
                  onChange={handleChange}
                  required
                  className="w-full bg-white outline-none p-2 rounded-md text-black"
                />
              </div>

              <div>
                <label className="block">Teléfono</label>
                <input
                  type="text"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  required
                  className="w-full bg-white outline-none p-2 rounded-md text-black"
                />
              </div>

              <div className="col-span-2">
                <label className="block">Gmail</label>
                <input
                  type="email"
                  name="gmail"
                  value={formData.gmail}
                  onChange={handleChange}
                  required
                  className="w-full bg-white outline-none p-2 rounded-md text-black"
                />
              </div>

              {/*<div>*/}
              {/*  <label className="block">Sección</label>*/}
              {/*    <input*/}
              {/*        type="text"*/}
              {/*        name="seccion"*/}
              {/*        value={formData.seccion}*/}
              {/*        onChange={handleChange}*/}
              {/*        required*/}
              {/*        className="w-full bg-white p-2 outline-none rounded-md text-black"*/}
              {/*    />*/}
              {/*</div>*/}

              {/*<div>*/}
              {/*  <label className="block">Fecha</label>*/}
              {/*    <input*/}
              {/*        type="date"*/}
              {/*        name="fecha"*/}
              {/*        value={formData.fecha}*/}
              {/*        onChange={handleChange}*/}
              {/*        required*/}
              {/*        className="w-full bg-white p-2 outline-none rounded-md text-black"*/}
              {/*    />*/}
              {/*</div>*/}

              {/* Botones */}
              <div className="w-full flex gap-2 mt-8 py-3">
                <button type="submit" className="border admin-act-btn">
                  Añadir dato
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  type="button"
                  className="cancel-btn"
                >
                  Cancelar
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
