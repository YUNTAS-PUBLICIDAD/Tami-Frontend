import { config, getApiUrl } from "../../../../config.ts";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

interface ImagenAdicional {
  imagen: File | null;
  parrafo: string;
  url?: string;
}

interface BlogPOST {
  titulo: string;
  link: string;
  subtitulo1: string;
  subtitulo2: string;
  video_titulo: string;
  video_url: string;
  producto_id: number | string; // Changed from nombre_producto
  miniatura: File | null;
  imagenes: ImagenAdicional[];
  etiqueta: {
    meta_titulo: string;
    meta_descripcion: string;
  };
}

interface AddBlogModalProps {
  onBlogAdded: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  blogToEdit?: any;
}

const AddBlogModal: React.FC<AddBlogModalProps> = ({
  onBlogAdded,
  isOpen: propIsOpen,
  onClose,
  blogToEdit,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [productos, setProductos] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [link, setLink] = useState("");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isProductLinkModalOpen, setIsProductLinkModalOpen] = useState(false);

  const [formData, setFormData] = useState<BlogPOST>({
    titulo: "",
    link: "",
    subtitulo1: "",
    subtitulo2: "",
    video_url: "",
    video_titulo: "",
    producto_id: "", // Changed from nombre_producto
    miniatura: null,
    imagenes: [
      { imagen: null, parrafo: "" },
      { imagen: null, parrafo: "" },
    ],
    etiqueta: {
      meta_titulo: "",
      meta_descripcion: "",
    },
  });
  useEffect(() => {
    if (propIsOpen !== undefined) {
      setIsOpen(propIsOpen);
    }
  }, [propIsOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchProductos = async () => {
      try {
        const url = getApiUrl(config.endpoints.productos.list);
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            Accept: "application/json",
          },
        });
        const data = await res.json();

        let lista: any[] = [];
        if (Array.isArray(data)) lista = data;
        else if (Array.isArray(data?.data)) lista = data.data;
        else if (Array.isArray(data?.data?.productos))
          lista = data.data.productos;

        setProductos(lista);
      } catch (err) {
        console.error("🚫 Error en FETCH productos:", err);
        setProductos([]);
      }
    };

    fetchProductos();

    if (blogToEdit) {
      // Modo edición
      //console.log("blogToEdit.imagenes recibido del backend:", blogToEdit.imagenes);
      const productoEncontrado = productos.find(
        (p) => p.nombre === blogToEdit.nombre_producto
      );
      //console.log(productoEncontrado);
      setFormData({
        titulo: blogToEdit.titulo || "",
        link: blogToEdit.link || "",
        subtitulo1: blogToEdit.subtitulo1 || "",
        subtitulo2: blogToEdit.subtitulo2 || "",
        video_url: blogToEdit.video_url || "",
        video_titulo: blogToEdit.video_titulo || "",
        producto_id: productoEncontrado ? String(productoEncontrado.id) : "",
        miniatura: blogToEdit.miniatura || null,
        imagenes: blogToEdit.imagenes?.map((img: any, index: number) => {
          const raw = img.ruta_imagen || "";
          return {
            imagen: null,
            parrafo: blogToEdit.parrafos?.[index]?.parrafo || "",
            url: raw
              ? raw.startsWith("http")
                ? raw
                : `${import.meta.env.PUBLIC_API_URL}${raw}`
              : "",
          };
        }) || [
          { imagen: null, parrafo: "", url: "" },
          { imagen: null, parrafo: "", url: "" },
        ],
        etiqueta: {
          meta_titulo: blogToEdit.etiqueta?.meta_titulo || "",
          meta_descripcion: blogToEdit.etiqueta?.meta_descripcion || "",
        },
      });
    } else {
      // Modo crear → formulario vacío
      setFormData({
        titulo: "",
        link: "",
        subtitulo1: "",
        subtitulo2: "",
        video_url: "",
        video_titulo: "",
        producto_id: "",
        miniatura: null,
        imagenes: [
          { imagen: null, parrafo: "" },
          { imagen: null, parrafo: "" },
        ],
        etiqueta: {
          meta_titulo: "",
          meta_descripcion: "",
        },
      });
    }
  }, [isOpen, blogToEdit]);

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
    } else if (name === "producto_id") {
      // Handle product ID change
      setFormData((prev) => ({
        ...prev,
        producto_id: value,
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
      setFormData({ ...formData, miniatura: e.target.files[0] });
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

  const handleInsertLinkClick = (index: number) => {
    const textarea = document.getElementById(
      `crear_descripcion_antes_${index}`
    ) as HTMLTextAreaElement;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);

    if (!selected) {
      Swal.fire(
        "Selecciona texto",
        "Por favor selecciona el texto al que quieres agregar un enlace.",
        "warning"
      );
      return;
    }

    setActiveIndex(index);
    setSelectedText(selected);
    setIsModalOpen(true);
  };

  const handleProductLinkClick = (index: number) => {
    const textarea = document.getElementById(
      `crear_descripcion_antes_${index}`
    ) as HTMLTextAreaElement;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);

    if (!selected) {
      Swal.fire(
        "Selecciona texto",
        "Por favor selecciona una palabra o frase para enlazar a un producto.",
        "warning"
      );
      return;
    }

    setActiveIndex(index);
    setSelectedText(selected);
    setIsProductLinkModalOpen(true);
  };

  const handleAddProduct = () => {
    if (activeIndex === null) return;

    if (!formData.producto_id) {
      Swal.fire(
        "ID de producto vacío",
        "Debes ingresar un ID válido.",
        "error"
      );
      return;
    }

    const productoSeleccionado = productos.find(
      (p) => String(p.id) === String(formData.producto_id)
    );

    if (!productoSeleccionado?.link) {
      Swal.fire(
        "Producto no encontrado",
        "No se encontró el producto.",
        "error"
      );
      return;
    }

    const textarea = document.getElementById(
      `crear_descripcion_antes_${activeIndex}`
    ) as HTMLTextAreaElement;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const parrafoActual = formData.imagenes[activeIndex]?.parrafo || "";
    const before = parrafoActual.substring(0, start);
    const after = parrafoActual.substring(end);

    const productUrl = `/productos/detalle?link=${productoSeleccionado.link}`;
    const linkedProductText = `<a href="${productUrl}" style="text-decoration: underline;">${selectedText}</a>`;
    const newValue = before + linkedProductText + after;

    const nuevosParrafos = [...formData.imagenes];
    nuevosParrafos[activeIndex] = {
      ...nuevosParrafos[activeIndex],
      parrafo: newValue,
    };

    setFormData((prev) => ({ ...prev, imagenes: nuevosParrafos }));
    setIsProductLinkModalOpen(false);
    setSelectedText("");
    setActiveIndex(null); // Reseteamos
  };

  const handleAddLink = () => {
    if (activeIndex === null) return;

    if (!link.trim()) {
      Swal.fire("Enlace vacío", "Debes ingresar un enlace válido.", "error");
      return;
    }

    const textarea = document.getElementById(
      `crear_descripcion_antes_${activeIndex}`
    ) as HTMLTextAreaElement;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const parrafoActual = formData.imagenes[activeIndex]?.parrafo || "";
    const before = parrafoActual.substring(0, start);
    const after = parrafoActual.substring(end);

    const linkedText = `<a href="${link}" style="text-decoration: underline;">${selectedText}</a>`;
    const newValue = before + linkedText + after;

    const nuevosParrafos = [...formData.imagenes];
    nuevosParrafos[activeIndex] = {
      ...nuevosParrafos[activeIndex],
      parrafo: newValue,
    };

    setFormData((prev) => ({ ...prev, imagenes: nuevosParrafos }));
    setIsModalOpen(false);
    setLink("");
    setSelectedText("");
    setActiveIndex(null); // Reseteamos
  };

  const closeModal = () => {
    setIsOpen(false);
    setFormData({
      titulo: "",
      link: "",
      subtitulo1: "",
      subtitulo2: "",
      //subtitulo3: "",
      video_url: "",
      video_titulo: "",
      producto_id: "", // Changed from nombre_producto
      miniatura: null,
      imagenes: [
        { imagen: null, parrafo: "" },
        { imagen: null, parrafo: "" },
      ],
      etiqueta: {
        meta_titulo: "",
        meta_descripcion: "",
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Validación básica
    if (
      !formData.titulo ||
      !formData.link ||
      !formData.subtitulo1 ||
      !formData.subtitulo2 ||
      !formData.video_url ||
      !formData.video_titulo ||
      !formData.producto_id ||
      (!blogToEdit && !formData.miniatura) || // Solo obligatorio si es nuevo
      formData.imagenes.some(
        (img) => (!blogToEdit && !img.imagen) || !img.parrafo
      )
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

      formDataToSend.append("titulo", formData.titulo);
      formDataToSend.append("link", formData.link);
      formDataToSend.append("subtitulo1", formData.subtitulo1);
      formDataToSend.append("subtitulo2", formData.subtitulo2);
      formDataToSend.append("video_url", formData.video_url);
      formDataToSend.append("video_titulo", formData.video_titulo);
      formDataToSend.append("etiqueta[meta_titulo]", formData.etiqueta.meta_titulo);
      formDataToSend.append("etiqueta[meta_descripcion]", formData.etiqueta.meta_descripcion);
      formDataToSend.append("producto_id", formData.producto_id.toString()); // Changed to producto_id and converted to string
      // Solo si hay nueva imagen principal
      if (formData.miniatura instanceof File) {
        formDataToSend.append("miniatura", formData.miniatura);
      }

      formData.imagenes.forEach((item) => {
        if (item.imagen) {
          formDataToSend.append("imagenes[]", item.imagen);
        }
        formDataToSend.append("parrafos[]", item.parrafo);
        formDataToSend.append("text_alt[]", "Sin descripción");
      });
      formDataToSend.append(
        "etiqueta",
        JSON.stringify({
          meta_titulo: formData.etiqueta.meta_titulo,
          meta_descripcion: formData.etiqueta.meta_descripcion,
        })
      );

      // Si es edición, agrega _method=PUT
      if (blogToEdit) {
        formDataToSend.append("_method", "PUT");
      }

      const url = blogToEdit
        ? `${getApiUrl(config.endpoints.blogs.list)}/${blogToEdit.id}`
        : getApiUrl(config.endpoints.blogs.create);

      const response = await fetch(url, {
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
          title: blogToEdit
            ? "Blog actualizado exitosamente"
            : "Blog añadido exitosamente",
          showConfirmButton: true,
        });
        closeModal();
        onBlogAdded();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: `❌ Error: ${data.message || "Error al guardar blog"}`,
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
  };

  return (
    <>
      {(isOpen || propIsOpen) && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="max-h-[90vh] overflow-y-auto bg-white text-gray-800 p-8 rounded-xl w-full max-w-4xl shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-teal-600">
                {blogToEdit ? "Editar Blog" : "Añadir Nuevo Blog"}
              </h2>
              <button
                type="button"
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
                <label className="block text-sm font-medium text-gray-700">
                  Título*
                </label>
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
                <label className="block text-sm font-medium text-gray-700">
                  Link*
                </label>
                <input
                  type="text"
                  name="link"
                  value={formData.link}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Meta título
                </label>
                <input
                  type="text"
                  name="meta_titulo"
                  value={formData.etiqueta.meta_titulo}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      etiqueta: {
                        ...formData.etiqueta,
                        meta_titulo: e.target.value,
                      },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Meta descripción
                </label>
                <textarea
                  name="meta_descripcion"
                  value={formData.etiqueta.meta_descripcion}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      etiqueta: {
                        ...formData.etiqueta,
                        meta_descripcion: e.target.value,
                      },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Párrafo*
                </label>
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
                <label className="block text-sm font-medium text-gray-700">
                  Descripción*
                </label>
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
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Título Video*
                </label>
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
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  URL del Video*
                </label>
                <input
                  type="text"
                  name="video_url"
                  value={formData.video_url}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Producto*
                </label>
                <select
                  name="producto_id" // Changed name to producto_id
                  value={formData.producto_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                >
                  <option value="">Selecciona un producto</option>
                  {productos.map((producto) => (
                    <option key={producto.id} value={String(producto.id)}>
                      {producto.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Miniatura*
                </label>

                {formData.miniatura instanceof File ? (
                  <img
                    src={URL.createObjectURL(formData.miniatura)}
                    alt="Vista previa miniatura"
                    className="w-32 h-32 object-cover rounded-md border mb-2"
                  />
                ) : typeof formData.miniatura === "string" &&
                  formData.miniatura ? (
                  <img
                    src={
                      String(formData.miniatura).startsWith("http")
                        ? String(formData.miniatura)
                        : `${import.meta.env.PUBLIC_API_URL}${
                            formData.miniatura
                          }`
                    }
                    alt="Miniatura actual"
                    className="w-32 h-32 object-cover rounded-md border mb-2"
                  />
                ) : null}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                />
              </div>
              {formData.imagenes.map((imagen, index) => (
                <div key={index} className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Imagen Adicional {index + 1}*
                  </label>

                  {imagen.imagen instanceof File ? (
                    <img
                      src={URL.createObjectURL(imagen.imagen)}
                      alt={`Vista previa imagen ${index + 1}`}
                      className="w-32 h-32 object-cover rounded-md border mb-2"
                    />
                  ) : imagen.url ? (
                    <img
                      src={
                        imagen.url.startsWith("http")
                          ? imagen.url
                          : `${import.meta.env.PUBLIC_API_URL}${imagen.url}`
                      }
                      alt={`Imagen adicional ${index + 1}`}
                      className="w-32 h-32 object-cover rounded-md border mb-2"
                    />
                  ) : null}

                  <div className="flex items-center gap-4 mb-2">
                    <label className="flex-1 cursor-pointer">
                      <div className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-teal-500 transition">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChangeAdicional(e, index)}
                          className="hidden"
                        />
                        <p className="text-center text-gray-500">
                          {imagen.imagen instanceof File
                            ? imagen.imagen.name
                            : "Seleccionar archivo"}
                        </p>
                      </div>
                    </label>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Descripción Completa*
                    </label>
                    <div className="relative">
                      <textarea
                        name="descripcionAntes"
                        id={`crear_descripcion_antes_${index}`}
                        rows={5}
                        value={formData.imagenes[index]?.parrafo || ""}
                        onChange={(e) => handleParrafoChange(e, index)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition resize-none"
                        placeholder="Escribe aquí toda la descripción del blog..."
                        required
                      />
                      <div className="absolute top-2/3 right-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleInsertLinkClick(index)}
                          title="Insertar enlace"
                          className="bg-blue-500 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-all duration-200"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleProductLinkClick(index)}
                          title="Enlazar a producto"
                          className="bg-green-500 hover:bg-green-700 text-white p-2 rounded-full shadow-lg transition-all duration-200"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Selecciona texto y haz clic en:
                      <span className="mx-2">🔗 para enlace normal</span>
                      <span className="mx-2">🛒 para enlace a producto</span>
                    </p>
                  </div>
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
                          cx="12"
                          cy="12"
                          r="10"
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
                  ) : blogToEdit ? (
                    "Actualizar Blog"
                  ) : (
                    "Guardar Blog"
                  )}
                </button>
              </div>
            </form>
            {isModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
                  <h3 className="text-lg font-semibold mb-4">
                    Insertar enlace para "{selectedText}"
                  </h3>
                  <input
                    type="url"
                    placeholder="https://ejemplo.com"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded mb-4"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 bg-gray-300 rounded"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleAddLink}
                      className="px-4 py-2 bg-blue-600 text-white rounded"
                    >
                      Insertar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {isProductLinkModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                  <h3 className="text-xl font-bold mb-4">
                    Enlazar "{selectedText}" a producto:
                  </h3>
                  <select
                    name="producto_id" // Changed name to producto_id
                    value={formData.producto_id}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                  >
                    <option value="">Selecciona un producto</option>
                    {productos.map((producto) => (
                      <option key={producto.id} value={producto.id}>
                        {" "}
                        {/* Changed value to producto.id */}
                        {producto.nombre}
                      </option>
                    ))}
                  </select>
                  <div className="flex justify-end gap-2 p-6">
                    <button
                      onClick={() => setIsProductLinkModalOpen(false)}
                      className="px-4 py-2 bg-gray-300 rounded"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleAddProduct}
                      className="px-4 py-2 bg-blue-600 text-white rounded"
                    >
                      Insertar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AddBlogModal;