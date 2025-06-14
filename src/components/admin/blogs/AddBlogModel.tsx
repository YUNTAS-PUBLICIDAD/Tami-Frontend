import { config, getApiUrl } from "../../../../config.ts";
import {useEffect, useState } from "react";
import Swal from "sweetalert2";

interface ImagenAdicional {
  url_imagen: File | null;
  parrafo_imagen: string;
}

interface BlogPOST {
  titulo: string;
  link: string;
  parrafo: string;
  descripcion: string;
  imagen_principal: File | null;
  titulo_blog: string;
  subtitulo_beneficio: string;
  url_video: string;
  producto_id: number;
  titulo_video: string;
  imagenes: ImagenAdicional[];
}

interface AddBlogModalProps {
  onBlogAdded: () => void;
}


const AddBlogModal: React.FC<AddBlogModalProps> = ({ onBlogAdded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [productos, setProductos] = useState<any[]>([]);
  const [formData, setFormData] = useState<BlogPOST>({
    titulo: "",
    link: "",
    parrafo: "",
    descripcion: "",
    imagen_principal: null,
    titulo_blog: "",
    subtitulo_beneficio: "",
    url_video: "",
    producto_id: 0,
    titulo_video: "",
    imagenes: [
      {
        url_imagen: null,
        parrafo_imagen: "",
      },
      {
        url_imagen: null,
        parrafo_imagen: "",
      },
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

            const linkLibre = obtenerPrimerNumeroLibre(linksUsados || []);
            setFormData((prev) => ({ ...prev, link: String(linkLibre) }));
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
            setProductos(data?.data || []);
          })
          .catch((err) => console.error("Error al obtener productos:", err));
    }
  }, [isOpen]);

  function obtenerPrimerNumeroLibre(numeros: number[]): number {
    const set = new Set(numeros);
    let i = 1;
    while (set.has(i)) {
      i++;
    }
    return i;
  }
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
  };



  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, imagen_principal: e.target.files[0] });
    }
  };

  const handleFileChangeAdicional = (
      e: React.ChangeEvent<HTMLInputElement>,
      index: number
  ) => {
    if (e.target.files && e.target.files[0]) {
      const nuevoArray = [...formData.imagenes];
      nuevoArray[index] = {
        ...nuevoArray[index],
        url_imagen: e.target.files[0],
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
      parrafo_imagen: e.target.value,
    };
    setFormData({ ...formData, imagenes: nuevoArray });
  };

  const closeModal = () => {
    setIsOpen(false);
    setFormData({
      titulo: "",
      link: "",
      parrafo: "",
      descripcion: "",
      imagen_principal: null,
      titulo_blog: "",
      subtitulo_beneficio: "",
      url_video: "",
      producto_id: 0,
      titulo_video: "",
      imagenes: [
        {
          url_imagen: null,
          parrafo_imagen: "",
        },
        {
          url_imagen: null,
          parrafo_imagen: "",
        },
      ],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true); // Mostrar mensaje "Guardando..."

    if (
        !formData.titulo ||
        !formData.link ||
        !formData.parrafo ||
        !formData.descripcion ||
        !formData.subtitulo_beneficio ||
        !formData.titulo_blog ||
        !formData.titulo_video ||
        !formData.url_video ||
        !formData.producto_id ||
        !formData.imagen_principal ||
        !formData.imagenes ||
        formData.imagenes.some((imagen) => !imagen.url_imagen)
    ) {
      Swal.fire({
        icon: "warning",
        title: "Campos obligatorios",
        text: "⚠️ Todos los campos son obligatorios.",
      });
      setIsSaving(false); // Ocultar mensaje si hay error de validación
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();

      formDataToSend.append("titulo", formData.titulo);
      formDataToSend.append("link", formData.link);
      formDataToSend.append("parrafo", formData.parrafo);
      formDataToSend.append("descripcion", formData.descripcion);
      formDataToSend.append(
          "subtitulo_beneficio",
          formData.subtitulo_beneficio
      );
      formDataToSend.append("titulo_blog", formData.titulo_blog);
      formDataToSend.append("titulo_video", formData.titulo_video);
      formDataToSend.append("url_video", formData.url_video);
      console.log("Producto ID a enviar:", formData.producto_id);
      if (formData.producto_id) {
        formDataToSend.append("producto_id", formData.producto_id.toString());
      } else {
        console.error("producto_id no está definido o es vacío");
      }
      formData.imagenes.forEach((item, index) => {
        if (item.url_imagen) {
          formDataToSend.append(
              `imagenes[${index}][imagen]`,
              item.url_imagen as File
          );
        }
        formDataToSend.append(
            `imagenes[${index}][parrafo_imagen]`,
            item.parrafo_imagen
        );
      });
      formDataToSend.append(
          "imagen_principal",
          formData.imagen_principal as File
      );
      //Dev
      /*for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}:`, value);
      }*/
      const response = await fetch(getApiUrl(config.endpoints.blogs.create), {
        method: "POST",
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
        title: "Error",
        text: `❌ Error: ${error}`,
      });
    } finally {
      setIsSaving(false); // Ocultar mensaje cuando termina
    }
    onBlogAdded(); // notificar al componente padre
  };

  return (
      <>
        <button
            onClick={() => setIsOpen(true)}
            className="mt-4 bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-6 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          Añadir Blog
        </button>

        {isOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
              <div className="max-h-[90vh] overflow-y-auto bg-white text-gray-800 p-8 rounded-xl w-full max-w-4xl shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold text-teal-600">Añadir Nuevo Blog</h2>
                  <button
                      onClick={closeModal}
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
                        name="parrafo"
                        value={formData.parrafo}
                        onChange={handleChange}
                        //required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Descripción*</label>
                    <input
                        type="text"
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleChange}
                        //required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Subtítulo Beneficio*</label>
                    <input
                        type="text"
                        name="subtitulo_beneficio"
                        value={formData.subtitulo_beneficio}
                        onChange={handleChange}
                        //required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Título Blog*</label>
                    <input
                        type="text"
                        name="titulo_blog"
                        value={formData.titulo_blog}
                        onChange={handleChange}
                        //required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Título Video*</label>
                    <input
                        type="text"
                        name="titulo_video"
                        value={formData.titulo_video}
                        onChange={handleChange}
                        //required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-gray-700">URL del Video*</label>
                    <input
                        type="text"
                        name="url_video"
                        value={formData.url_video}
                        onChange={handleChange}
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
                    <label className="block text-sm font-medium text-gray-700">Imagen Principal*</label>
                    <div className="flex items-center gap-4">
                      <label className="flex-1 cursor-pointer">
                        <div className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-teal-500 transition">
                          <input
                              type="file"
                              accept="image/png, image/jpeg, image/jpg"
                              name="imagen_principal"
                              onChange={handleFileChange}
                              //required
                              className="hidden"
                          />
                          <p className="text-center text-gray-500">
                            {formData.imagen_principal
                                ? formData.imagen_principal.name
                                : "Seleccionar archivo"}
                          </p>
                        </div>
                      </label>
                    </div>
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
                                  className="hidden"
                              />
                              <p className="text-center text-gray-500">
                                {imagen.url_imagen
                                    ? imagen.url_imagen.name
                                    : "Seleccionar archivo"}
                              </p>
                            </div>
                          </label>
                        </div>
                        <textarea
                            onChange={(e) => handleParrafoChange(e, index)}
                            value={imagen.parrafo_imagen}
                            //required
                            placeholder="Descripción de la imagen..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition min-h-24"
                        />
                      </div>
                  ))}

                  <div className="md:col-span-2 flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={closeModal}
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
                          'Guardar Blog'
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