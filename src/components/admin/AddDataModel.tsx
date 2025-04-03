import { useState } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";

const AddDataModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Botón para abrir el modal */}
      <button
        onClick={() => setIsOpen(true)}
        className="mt-4 bg-teal-500 hover:bg-teal-600 text-white text-lg px-10 py-1.5 rounded-full flex items-center gap-2"
      >
        Añadir dato
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-teal-600 text-white px-10 py-8 rounded-4xl w-3/5">
            <h2 className="text-2xl font-bold mb-4">AÑADIR DATOS</h2>

            {/* Formulario */}
            <form className="grid grid-cols-2 gap-4 gap-x-12">
              <div>
                <label className="block">Nombres</label>
                <input
                  type="text"
                  className="w-full bg-white outline-none p-2 rounded-md text-black"
                />
              </div>

              <div>
                <label className="block">Teléfono</label>
                <input
                  type="text"
                  className="w-full bg-white outline-none p-2 rounded-md text-black"
                />
              </div>

              <div className="col-span-2">
                <label className="block">Gmail</label>
                <input
                  type="email"
                  className="w-full bg-white outline-none p-2 rounded-md text-black"
                />
              </div>

              <div>
                <label className="block">Sección</label>
                <input
                  type="text"
                  className="w-full bg-white p-2 outline-none rounded-md text-black"
                />
              </div>

              <div>
                <label className="block">Fecha</label>
                <input
                  type="date"
                  className="w-full bg-white p-2 outline-none rounded-md text-black"
                />
              </div>
            </form>

              {/* Botones */}
              <div className="flex gap-2 mt-8">
                  <button className="px-10 bg-teal-400 py-1 rounded-full text-lg hover:bg-teal-500">
                      Añadir dato
                  </button>
                  <button
                      onClick={() => setIsOpen(false)}
                      className="px-10 bg-gray-400 py-1 rounded-full text-lg hover:bg-gray-500"
                  >
                      Cancelar
                  </button>
              </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddDataModal;
