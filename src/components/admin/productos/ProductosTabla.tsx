import { FaTrash, FaCheck } from "react-icons/fa";
import { useEffect, useState } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";
import { getApiUrl, config } from "config";

interface Producto {
  id: number | string;
  name: string;
  seccion: string;
  precioProducto: number;
}

export default function DataTable() {
  const [productos, setProductos] = useState<Producto[]>([]);

  const obtenerDatos = async () => {
    const respuesta = await fetch(getApiUrl(config.endpoints.productos.list), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const productosData = await respuesta.json();
    setProductos(productosData.data);
  };

  useEffect(() => {
    obtenerDatos();
  }, []);

  return (
    <>
      <div className="flex flex-row gap-4">
        <BtnAñadirDatos />
      </div>
      {/* Tabla */}
      <table className="w-full border-separate border-spacing-2">
        <thead>
          <tr className="bg-teal-600 text-white">
            <th className="px-4 py-2 rounded-xl">ID</th>
            <th className="px-4 py-2 rounded-xl">NOMBRE</th>
            <th className="px-4 py-2 rounded-xl">SECCION</th>
            <th className="px-4 py-2 rounded-xl">PRECIO</th>
            <th className="px-4 py-2 rounded-xl">ACCIÓN</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((item, index) => (
            <tr
              key={item.id}
              className={`text-center ${
                index % 2 === 0 ? "bg-gray-100" : "bg-gray-300"
              }`}
            >
              <td className="px-4 font-bold rounded-xl">{item.id}</td>
              <td className="px-4 font-bold rounded-xl">{item.name}</td>
              <td className="px-4 font-bold rounded-xl">{item.seccion}</td>
              <td className="px-4 font-bold rounded-xl">
                {item.precioProducto}
              </td>
              <td className="px-4 rounded-xl">
                {/* Contenedor de acciones con íconos */}
                <div className="flex justify-center gap-2 rounded-xl p-1">
                  <button
                    className="p-2 text-red-600 hover:text-red-800 transition"
                    title="Eliminar"
                  >
                    <FaTrash size={18} />
                  </button>
                  <button
                    className="p-2 text-green-600 hover:text-green-800 transition"
                    title="Confirmar"
                  >
                    <FaCheck size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

const BtnAñadirDatos = () => {
  const [isOpen, setIsOpen] = useState(false);

  const enviarDatos = async function (e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const data = new FormData(e.target);
      const respuesta = await fetch(
        getApiUrl(config.endpoints.productos.create),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nombre: data.get("nombre"),
            titulo: data.get("titulo"),
            subtitulo: data.get("subtitulo"),
            lema: data.get("lema"),
            descripcion: data.get("descripcion"),
            imagen_principal: data.get("imagen_principal"),
            stock: data.get("stock"),
            precio: data.get("precio"),
            seccion: data.get("seccion"),
            especificaciones: {
              color: data.get("color"),
              material: "aluminio",
            },
            dimensiones: {
              alto: data.get("alto"),
              ancho: data.get("ancho"),
              largo: data.get("largo"),
            },
            imagenes: [
              data.get("imagenes"),
              "https://placehold.co/100x150/blue/white?text=Product_Y",
            ],
            relacionados: [data.get("productos_relacionados"), 2, 3],
          }),
        }
      );
      const respuestaDatos = await respuesta.json();
      if (respuesta.ok) {
        Swal.fire({
          title: `${respuestaDatos.message}`,
          icon: "success",
        });
      } else {
        Swal.fire({
          title: `${respuestaDatos.message}`,
          icon: "error",
        });
      }
    } catch (error) {
      Swal.fire({
        title: `Hubo un error al insertar el producto`,
        icon: "error",
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Bloquea el scroll del fondo
      document.body.style.overflow = "hidden";
    } else {
      // Restaura el scroll del fondo
      document.body.style.overflow = "auto";
    }

    // Limpieza por si acaso el componente se desmonta
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  return (
    <>
      {/* Botón para abrir el modal */}
      <button
        onClick={() => setIsOpen(true)}
        className="mt-4 bg-teal-500 hover:bg-teal-600 text-white text-lg px-10 py-1.5 rounded-full flex items-center gap-2"
      >
        Añadir Producto
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 flex items-start justify-center bg-black/50 overflow-y-auto py-10">
          <div className="bg-teal-600 text-white px-10 py-8 rounded-4xl w-3/5">
            <h2 className="text-2xl font-bold mb-4">AÑADIR DATOS</h2>

            {/* Formulario */}
            <form
              id="eliminentechno3"
              onSubmit={enviarDatos}
              className="grid grid-cols-4 gap-4 gap-x-12"
            >
              <div className="col-span-2">
                <label className="block">Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  required
                  className="w-full bg-white outline-none p-2 rounded-md text-black"
                />
              </div>

              <div className="col-span-2">
                <label className="block">Título</label>
                <input
                  type="text"
                  name="titulo"
                  required
                  className="w-full bg-white outline-none p-2 rounded-md text-black"
                />
              </div>

              <div className="col-span-2">
                <label className="block">Subtítulo</label>
                <input
                  type="text"
                  name="subtitulo"
                  required
                  className="w-full bg-white p-2 outline-none rounded-md text-black"
                />
              </div>

              <div className="col-span-2">
                <label className="block">Lema</label>
                <input
                  type="text"
                  name="lema"
                  required
                  className="w-full bg-white p-2 outline-none rounded-md text-black"
                />
              </div>

              <div className="col-span-4">
                <label className="block">Descripción</label>
                <textarea
                  name="descripcion"
                  rows="1"
                  required
                  className="w-full bg-white p-2 outline-none rounded-md text-black"
                ></textarea>
              </div>

              <div className="col-span-2">
                <label className="block">Imagen principal</label>
                <input
                  type="text"
                  name="imagen_principal"
                  required
                  className="w-full bg-white p-2 outline-none rounded-md text-black"
                />
              </div>

              <div className="col-span-2">
                <label className="block">Imágenes</label>
                <input
                  type="text"
                  name="imagenes"
                  required
                  className="w-full bg-white p-2 outline-none rounded-md text-black"
                />
              </div>

              <div>
                <label className="block">Stock</label>
                <input
                  type="number"
                  name="stock"
                  required
                  className="w-full bg-white p-2 outline-none rounded-md text-black"
                />
              </div>

              <div>
                <label className="block">Precio</label>
                <input
                  type="number"
                  name="precio"
                  step="0.01"
                  required
                  className="w-full bg-white p-2 outline-none rounded-md text-black"
                />
              </div>

              <div>
                <label className="block">Sección</label>
                <input
                  type="text"
                  name="seccion"
                  required
                  className="w-full bg-white p-2 outline-none rounded-md text-black"
                />
              </div>

              <div>
                <label className="block">Color (espec.)</label>
                <input
                  type="text"
                  name="color"
                  required
                  className="w-full bg-white p-2 outline-none rounded-md text-black"
                />
              </div>

              <div>
                <label className="block">Alto</label>
                <input
                  type="text"
                  name="alto"
                  required
                  className="w-full bg-white p-2 outline-none rounded-md text-black"
                />
              </div>

              <div>
                <label className="block">Largo</label>
                <input
                  type="text"
                  name="largo"
                  required
                  className="w-full bg-white p-2 outline-none rounded-md text-black"
                />
              </div>

              <div>
                <label className="block">Ancho</label>
                <input
                  type="text"
                  name="ancho"
                  required
                  className="w-full bg-white p-2 outline-none rounded-md text-black"
                />
              </div>

              <div>
                <label className="block">Productos relac.</label>
                <input
                  type="text"
                  name="productos_relacionados"
                  required
                  className="w-full bg-white p-2 outline-none rounded-md text-black"
                />
              </div>
            </form>

            {/* Botones */}
            <div className="flex gap-2 mt-8">
              <button
                type="submit"
                form="eliminentechno3"
                className="admin-act-btn"
              >
                Añadir dato
              </button>
              <button onClick={() => setIsOpen(false)} className="cancel-btn">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
