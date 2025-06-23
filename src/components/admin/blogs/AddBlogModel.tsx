import { config, getApiUrl } from "../../../../config.ts";
import {useEffect, useState } from "react";
import Swal from "sweetalert2";
import {useEffect, useState } from "react";
import Swal from "sweetalert2";

interface ImagenAdicional {
  imagen: File | null;
  parrafo: string;
}

interface BlogPOST {
  titulo: string;
  link: string;
  subtitulo1: string;
  subtitulo2: string;
  subtitulo3: string;
  video_id: string;
  video_titulo: string;
  producto_id: number;
  imagenes: ImagenAdicional[];
}

interface AddBlogModalProps {
  onBlogAdded: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  blogToEdit?: any;
}


const AddBlogModal: React.FC<AddBlogModalProps> = ({ onBlogAdded, isOpen: propIsOpen, onClose, blogToEdit }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [productos, setProductos] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [formData, setFormData] = useState<BlogPOST>({
    titulo: "",
    link: "",
    subtitulo1: "",
    subtitulo2: "",
    subtitulo3: "",
    video_id: "",
    video_titulo: "",
    producto_id: 0,
    imagenes: [
      { imagen: null, parrafo: "" },
      { imagen: null, parrafo: "" },
    ],
  });

  useEffect(() => {
    if (isOpen) {
      fetch(getApiUrl(config.endpoints.blogs.list), {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "application/json",
        },
      })
          .then((res) => res.json())
          .then((data) => {
            const linksUsados = data?.data
                ?.map((b: any) => parseInt(b.link))
                .filter((n: number) => Number.isInteger(n) && n > 0);
          })
          .catch((err) => console.error("Error al obtener blogs:", err));
    }
  }, [isOpen]);
  useEffect(() => {
    if (isOpen) {
      fetch(getApiUrl(config.endpoints.productos.list), {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "application/json",
        },
      })
          .then((res) => res.json())
          .then((data) => {
            if (Array.isArray(data?.data)) {
              setProductos(data.data);
            } else {
              console.error("❌ El formato de productos no es un array:", data);
              setProductos([]); // fallback
            }
          })
          .catch((err) => console.error("Error al obtener productos:", err));
    }
  }, [isOpen]);
  const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "link") {
      const sanitized = value
          .normalize("NFD") // descompone letras acentuadas
          .replace(/[\u0300-\u036f]/g, "") // elimina las marcas diacríticas
          .toLowerCase()
          .replaceAll(" ", "-");

      setFormData((prev) => ({
        ...prev,
        link: sanitized,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };/*
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, imagenPrincipal: e.target.files[0] });
    }
  };*/

  const handleFileChangeAdicional = (
      e: React.ChangeEvent<HTMLInputElement>,
      index: number
  ) => {
    if (e.target.files && e.target.files[0]) {
      const nuevoArray = [...formData.imagenes];
      nuevoArray[index] = {
        ...nuevoArray[index],
        imagen: e.target.files[0],
      };
      setFormData({ ...formData, imagenes: nuevoArray });
    }
  };

  const handleParrafoChange = (
      e: React.ChangeEvent<HTMLTextAreaElement>,
      index: number
  ) => {
    const nuevoArray = [...formData.imagenes];
    nuevoArray[index] = {
      ...nuevoArray[index],
      parrafo: e.target.value,
    };
    setFormData({ ...formData, imagenes: nuevoArray });
  };

  const closeModal = () => {
    setIsOpen(false);
    setFormData({
      titulo: "",
      link: "",
      subtitulo1: "",
      subtitulo2: "",
      subtitulo3: "",
      video_id: "",
      video_titulo: "",
      producto_id: 0,
      imagenes: [
        { imagen: null, parrafo: "" },
        { imagen: null, parrafo: "" },
      ],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setIsSaving(true);

    // Validación básica
    if (
        !formData.titulo ||
        !formData.link ||
        !formData.subtitulo1 ||
        !formData.subtitulo2 ||
        !formData.subtitulo3 ||
        !formData.video_id ||
        !formData.video_titulo ||
        !formData.producto_id ||
        formData.imagenes.some((img) => !img.imagen || !img.parrafo)
    ) {
      Swal.fire({
        icon: "warning",
        title: "Campos obligatorios",
        text: "⚠️ Todos los campos son obligatorios.",
      });
      setIsSaving(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();

      // Campos normales
      formDataToSend.append("titulo", formData.titulo);
      formDataToSend.append("link", formData.link);
      formDataToSend.append("subtitulo1", formData.subtitulo1);
      formDataToSend.append("subtitulo2", formData.subtitulo2);
      formDataToSend.append("subtitulo3", formData.subtitulo3);
      formDataToSend.append("video_url", formData.video_id);
      formDataToSend.append("video_id", "placeholder");
      formDataToSend.append("video_titulo", formData.video_titulo);
      formDataToSend.append("producto_id", formData.producto_id.toString());

      // Imagen principal
      //formDataToSend.append("imagenPrincipal", formData.imagenPrincipal);

      // Imagenes adicionales
      formData.imagenes.forEach((item) => {
        formDataToSend.append("imagenes[]", item.imagen as File);
        formDataToSend.append("parrafos[]", item.parrafo);
        formDataToSend.append("text_alt[]", "Sin descripción");
      });

      // Petición
      const response = await fetch(getApiUrl(config.endpoints.blogs.create), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await response.json();
      console.log("Respuesta del servidor:", data);

      if (response.ok) {
        await Swal.fire({
          icon: "success",
          title: "Blog añadido exitosamente",
          showConfirmButton: true,
        });
        closeModal();
        onBlogAdded(); // notificar al padre
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: `❌ Error: ${data.message || "Error al crear blog"}`,
        });
      }
    } catch (error) {
      console.error("Error al enviar los datos:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `❌ ${error}`,
      });
    } finally {
      setIsSaving(false);
    }
    onBlogAdded(); // notificar al componente padre
  };

  return (
      <>
        {(!propIsOpen && <button
            onClick={() => setIsOpen(true)}
            className="mt-4 bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-6 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          Añadir Blog
        </button>)}
        {(isOpen || propIsOpen) && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
              <div className="max-h-[90vh] overflow-y-auto bg-white text-gray-800 p-8 rounded-xl w-full max-w-4xl shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold text-teal-600">{blogToEdit ? 'Editar Blog' : 'Añadir Nuevo Blog'}</h2>
                  <button
                      onClick={onClose ? onClose : closeModal}
                      className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    &times;
                  </button>
                </div>

                <form
                    encType="multipart/form-data"
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Título*</label>
                    <input
                        type="text"
                        name="titulo"
                        value={formData.titulo}
                        onChange={handleChange}
                        //required
                        //required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Link*</label>
                    <input
                        type="text"
                        name="link"
                        value={formData.link}
                        onChange={handleChange}

                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                    />
                  </div>


                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Link*</label>
                    <input
                        type="text"
                        name="link"
                        value={formData.link}
                        onChange={handleChange}

                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                    />
                  </div>


                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Párrafo*</label>
                    <input
                        type="text"
                        name="subtitulo1"
                        value={formData.subtitulo1}
                        onChange={handleChange}
                        //required
                        //required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Descripción*</label>
                    <input
                        type="text"
                        name="subtitulo2"
                        value={formData.subtitulo2}
                        onChange={handleChange}
                        //required
                        //required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Subtítulo Beneficio*</label>
                    <input
                        type="text"
                        name="subtitulo3"
                        value={formData.subtitulo3}
                        onChange={handleChange}
                        //required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Título Video*</label>
                    <input
                        type="text"
                        name="video_titulo"
                        value={formData.video_titulo}
                        onChange={handleChange}
                        //required
                        //required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-gray-700">URL del Video*</label>
                    <input
                        type="text"
                        name="video_id"
                        value={formData.video_id}
                        onChange={handleChange}
                        //required
                        //required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Producto*</label>
                    <select
                        name="producto_id"
                        value={formData.producto_id}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                    >
                      <option value="">Selecciona un producto</option>
                      {productos.map((producto) => (
                          <option key={producto.id} value={producto.id}>
                            {producto.nombre}
                          </option>
                      ))}
                    </select>
                  </div>


                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Producto*</label>
                    <select
                        name="producto_id"
                        value={formData.producto_id}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                    >
                      <option value="">Selecciona un producto</option>
                      {productos.map((producto) => (
                          <option key={producto.id} value={producto.id}>
                            {producto.nombre}
                          </option>
                      ))}
                    </select>
                  </div>
                  {formData.imagenes.map((imagen, index) => (
                      <div key={index} className="md:col-span-2 space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Imagen Adicional {index + 1}*
                        </label>
                        <div className="flex items-center gap-4 mb-2">
                          <label className="flex-1 cursor-pointer">
                            <div className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-teal-500 transition">
                              <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleFileChangeAdicional(e, index)}
                                  //required
                                  //required
                                  className="hidden"
                              />
                              <p className="text-center text-gray-500">
                                {imagen.imagen
                                    ? imagen.imagen.name
                                    : "Seleccionar archivo"}
                              </p>
                            </div>
                          </label>
                        </div>
                        <textarea
                            onChange={(e) => handleParrafoChange(e, index)}
                            value={imagen.parrafo}
                            //required
                            placeholder="Descripción de la imagen..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition min-h-24"
                        />
                      </div>
                  ))}

                  <div className="md:col-span-2 flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={onClose ? onClose : closeModal}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                    >
                      Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition shadow-md flex items-center justify-center gap-2 min-w-[140px]"
                        disabled={isSaving}
                    >
                      {isSaving ? (
                          <>
                            <svg
                                className="animate-spin h-4 w-4 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                              <circle
                                  className="opacity-25"
                                  cx="12" cy="12" r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                              />
                              <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8v8z"
                              />
                            </svg>
                            Guardando...
                          </>
                      ) : (
                          blogToEdit ? 'Actualizar Blog' : 'Guardar Blog'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}
      </>
  );
};

export default AddBlogModal;