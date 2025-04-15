import { FaTrash, FaCheck, FaEdit } from "react-icons/fa";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { config, getApiUrl } from "config";

interface Producto {
  id: number | string;
  name: string;
  titulo: string;
  subtitulo: string;
  lema: string;
  descripcion: string;
  imagen_principal: string;
  stock: number;
  precioProducto: number;
  seccion: string;

  especificaciones: {
    color: string;
    material: string;
  };

  dimensiones: {
    alto: string;
    ancho: string;
    largo: string;
  };

  imagenes: string[]; // array de URLs o rutas de imágenes
  relacionados: number[]; // IDs de productos relacionados (pueden ser strings también si es necesario)
}

export default function DataTable() {
  const [productos, setProductos] = useState<Producto[]>([]);

  const [productoEnEdicion, setProductoEnEdicion] = useState<Producto | null>(
    null
  );

  const eliminarProducto = async (id: number | string) => {
    const confirmacion = await Swal.fire({
      title: "¿Estás seguro?",
      text: "No podrás revertir esto.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (confirmacion.isConfirmed) {
      const token = localStorage.getItem("token");
      const respuesta = await fetch(
        getApiUrl(config.endpoints.productos.delete(id)), // Cambia la URL según tu API
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (respuesta.ok) {
        Swal.fire(
          "Eliminado",
          "El producto fue eliminado correctamente",
          "success"
        );
        obtenerDatos(); // Recargar lista de productos
      } else {
        Swal.fire("Error", "No se pudo eliminar el producto", "error");
      }
    }
  };

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
      <div className="py-4 px-2">
        <BtnAñadirDatos
          productoEditar={productoEnEdicion}
          onGuardado={() => {
            obtenerDatos();
            setProductoEnEdicion(null);
          }}
          onCancelarEdicion={() => setProductoEnEdicion(null)} // << NUEVO
        />
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
                    className="p-2 text-red-600 hover:text-red-800 transition hover:cursor-pointer"
                    title="Eliminar"
                    onClick={() => eliminarProducto(item.id)}
                  >
                    <FaTrash size={18} />
                  </button>
                  <button
                    className="p-2 text-green-600 hover:text-green-800 transition hover:cursor-pointer"
                    title="Editar"
                    onClick={() => {
                      // Reseteamos el productoEnEdicion antes de asignarlo, esto asegura que el modal se pueda abrir de nuevo
                      setProductoEnEdicion(null);
                      setProductoEnEdicion(item); // Asignamos el producto para abrir el modal con los datos correctos
                    }}
                  >
                    <FaEdit size={18} />
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

const formularioInicial = {
  nombre: "",
  titulo: "",
  subtitulo: "",
  lema: "",
  descripcion: "",
  imagen_principal: "",
  imagenes: [] as string[],
  stock: 0 as number,
  precio: 0 as number,
  seccion: "",
  color: "",
  alto: "",
  ancho: "",
  largo: "",
  productos_relacionados: [] as (string | number)[],
  material: "",
};

const BtnAñadirDatos = ({
  productoEditar = null,
  onGuardado,
  onCancelarEdicion,
}: {
  productoEditar?: Producto | null;
  onGuardado?: () => void;
  onCancelarEdicion?: () => void; // << NUEVO
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const [formulario, setFormulario] = useState(formularioInicial);

  const enviarDatos = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    const url = productoEditar
      ? getApiUrl(config.endpoints.productos.update(productoEditar.id))
      : getApiUrl(config.endpoints.productos.create);

    const metodo = productoEditar ? "PUT" : "POST";

    try {
      const respuesta = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: formulario.nombre,
          titulo: formulario.titulo,
          subtitulo: formulario.subtitulo,
          lema: formulario.lema,
          descripcion: formulario.descripcion,
          imagen_principal: formulario.imagen_principal,
          stock: Number(formulario.stock),
          precio: Number(formulario.precio),
          seccion: formulario.seccion,
          especificaciones: {
            color: formulario.color,
            material: formulario.material || "aluminio",
          },
          dimensiones: {
            alto: formulario.alto,
            ancho: formulario.ancho,
            largo: formulario.largo,
          },
          imagenes: [
            formulario.imagenes,
            "https://placehold.co/100x150/blue/white?text=Product_Y",
          ],
          relacionados: [formulario.productos_relacionados, 2, 3],
        }),
      });

      const datos = await respuesta.json();

      if (respuesta.ok) {
        Swal.fire({
          title: productoEditar ? "Producto actualizado" : "Producto creado",
          text: datos.message,
          icon: "success",
        });

        setIsOpen(false);
        setFormulario(formularioInicial); // Limpia el formulario si es necesario

        if (onGuardado) onGuardado(); // Callback para recargar la lista
      } else {
        Swal.fire({
          title: "Error",
          text: datos.message || "Ocurrió un error inesperado.",
          icon: "error",
        });
      }
    } catch (error: any) {
      Swal.fire({
        title: "Error en la petición",
        text: error.message || "No se pudo conectar con el servidor.",
        icon: "error",
      });
    }
  };

  useEffect(() => {
    if (productoEditar) {
      setFormulario({
        nombre: productoEditar.name || "",
        titulo: productoEditar.titulo || "",
        subtitulo: productoEditar.subtitulo || "",
        lema: productoEditar.lema || "",
        descripcion: productoEditar.descripcion || "",
        imagen_principal: productoEditar.imagen_principal || "",
        imagenes: productoEditar.imagenes || [],
        stock: productoEditar.stock || 0,
        precio: productoEditar.precioProducto || 0,
        seccion: productoEditar.seccion || "",
        color: productoEditar.especificaciones?.color || "",
        material: productoEditar.especificaciones?.material || "aluminio",
        alto: productoEditar.dimensiones?.alto || "",
        ancho: productoEditar.dimensiones?.ancho || "",
        largo: productoEditar.dimensiones?.largo || "",
        productos_relacionados: productoEditar.relacionados || [],
      });
      setIsOpen(true); // Abre el modal automáticamente en edición
    } else {
      setFormulario(formularioInicial); // Limpia el formulario al cerrar el modal
    }
  }, [productoEditar]); // Esto asegura que el modal se actualiza solo cuando el producto cambia

  const cerrarModal = () => {
    setIsOpen(false);
    setFormulario(formularioInicial);
    if (onCancelarEdicion) onCancelarEdicion(); // Esto resetea el producto en edición en DataTable
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormulario({ ...formulario, [name]: value });
  };

  return (
    <>
      {/* Botón para abrir el modal */}
      <button onClick={() => setIsOpen(true)} className="pagination-btn w-full">
        Añadir Producto
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 flex items-start justify-center bg-black/50 overflow-y-auto py-10">
          <div className="bg-teal-600 text-white px-10 py-8 rounded-4xl w-3/5">
            <h2 className="text-2xl font-bold mb-4">
              {productoEditar ? "EDITAR PRODUCTO" : "AÑADIR PRODUCTO"}
            </h2>
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
                  value={formulario.nombre}
                  onChange={handleChange}
                  className="w-full bg-white outline-none p-2 rounded-md text-black"
                />
              </div>

              <div className="col-span-2">
                <label className="block">Título</label>
                <input
                  type="text"
                  name="titulo"
                  required
                  value={formulario.titulo}
                  onChange={handleChange}
                  className="w-full bg-white outline-none p-2 rounded-md text-black"
                />
              </div>

              <div className="col-span-2">
                <label className="block">Subtítulo</label>
                <input
                  type="text"
                  name="subtitulo"
                  required
                  value={formulario.subtitulo}
                  onChange={handleChange}
                  className="w-full bg-white p-2 outline-none rounded-md text-black"
                />
              </div>

              <div className="col-span-2">
                <label className="block">Lema</label>
                <input
                  type="text"
                  name="lema"
                  required
                  value={formulario.lema}
                  onChange={handleChange}
                  className="w-full bg-white p-2 outline-none rounded-md text-black"
                />
              </div>

              <div className="col-span-4">
                <label className="block">Descripción</label>
                <textarea
                  name="descripcion"
                  rows={1}
                  required
                  value={formulario.descripcion}
                  onChange={handleChange}
                  className="w-full bg-white p-2 outline-none rounded-md text-black"
                ></textarea>
              </div>

              <div className="col-span-2">
                <label className="block">Imagen principal</label>
                <input
                  type="text"
                  name="imagen_principal"
                  required
                  value={formulario.imagen_principal}
                  onChange={handleChange}
                  className="w-full bg-white p-2 outline-none rounded-md text-black"
                />
              </div>

              <div className="col-span-2">
                <label className="block">Imágenes</label>
                <input
                  type="text"
                  name="imagenes"
                  required
                  value={formulario.imagenes.join(", ")}
                  onChange={(e) =>
                    setFormulario({
                      ...formulario,
                      imagenes: e.target.value
                        .split(",")
                        .map((val) => val.trim()),
                    })
                  }
                  className="w-full bg-white p-2 outline-none rounded-md text-black"
                />
              </div>

              <div>
                <label className="block">Stock</label>
                <input
                  type="number"
                  name="stock"
                  required
                  value={formulario.stock}
                  onChange={handleChange}
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
                  value={formulario.precio}
                  onChange={handleChange}
                  className="w-full bg-white p-2 outline-none rounded-md text-black"
                />
              </div>

              <div>
                <label className="block">Sección</label>
                <input
                  type="text"
                  name="seccion"
                  required
                  value={formulario.seccion}
                  onChange={handleChange}
                  className="w-full bg-white p-2 outline-none rounded-md text-black"
                />
              </div>

              <div>
                <label className="block">Color (espec.)</label>
                <input
                  type="text"
                  name="color"
                  required
                  value={formulario.color}
                  onChange={handleChange}
                  className="w-full bg-white p-2 outline-none rounded-md text-black"
                />
              </div>

              <div>
                <label className="block">Alto</label>
                <input
                  type="text"
                  name="alto"
                  required
                  value={formulario.alto}
                  onChange={handleChange}
                  className="w-full bg-white p-2 outline-none rounded-md text-black"
                />
              </div>

              <div>
                <label className="block">Largo</label>
                <input
                  type="text"
                  name="largo"
                  required
                  value={formulario.largo}
                  onChange={handleChange}
                  className="w-full bg-white p-2 outline-none rounded-md text-black"
                />
              </div>

              <div>
                <label className="block">Ancho</label>
                <input
                  type="text"
                  name="ancho"
                  required
                  value={formulario.ancho}
                  onChange={handleChange}
                  className="w-full bg-white p-2 outline-none rounded-md text-black"
                />
              </div>

              <div>
                <label className="block">Productos relac.</label>
                <input
                  type="text"
                  name="productos_relacionados"
                  required
                  value={formulario.productos_relacionados.join(", ")} // mostrar
                  onChange={(e) =>
                    setFormulario({
                      ...formulario,
                      productos_relacionados: e.target.value
                        .split(",")
                        .map((val) => val.trim()),
                    })
                  }
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
                {productoEditar ? "Actualizar" : "Añadir"}
              </button>
              <button onClick={cerrarModal} className="cancel-btn">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
