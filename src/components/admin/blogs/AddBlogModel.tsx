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
  subtitulo1: string; // Párrafo corto (100)
  subtitulo2: string; // Descripción (255)
  video_titulo: string; // 40
  video_url: string; // 255
  producto_id: number | string;
  miniatura: File | null;
  imagenes: ImagenAdicional[]; // parrafo_imagen sin límite estricto (usa textarea)
  etiqueta: {
    meta_titulo: string; // sugerido <= 60
    meta_descripcion: string; // sugerido <= 160
  };
}

interface AddBlogModalProps {
  onBlogAdded: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  blogToEdit?: any;
}

/* ====== Límites centralizados ====== */
const LENGTHS = {
  titulo: 120,
  parrafo: 100, // subtitulo1
  descripcion: 255, // subtitulo2
  videoTitulo: 125,
  videoUrl: 255,
  metaTitulo: 60, // recomendado (no bloqueante)
  metaDescripcion: 160, // recomendado (no bloqueante)
};

const MAX_IMAGE_MB = 2;
const ACCEPT_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

/* ===== utilidades ===== */
const isValidUrl = (value: string) => {
  try {
    const u = new URL(value);
    return !!u.protocol && !!u.host;
  } catch {
    return false;
  }
};

const bytesToMB = (bytes: number) => bytes / (1024 * 1024);

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

  useEffect(() => {
    if (propIsOpen !== undefined) setIsOpen(propIsOpen);
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
      const productoEncontrado = productos.find(
        (p) => p.nombre === blogToEdit.nombre_producto
      );
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, blogToEdit]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "link") {
      const sanitized = value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replaceAll(" ", "-");
      setFormData((prev) => ({ ...prev, link: sanitized }));
      return;
    }

    if (name === "producto_id") {
      setFormData((prev) => ({ ...prev, producto_id: value }));
      return;
    }

    // Enforce max lengths on write for text fields
    const next: Partial<BlogPOST> = {};
    switch (name) {
      case "titulo":
        next.titulo = value.slice(0, LENGTHS.titulo);
        break;
      case "subtitulo1":
        next.subtitulo1 = value.slice(0, LENGTHS.parrafo);
        break;
      case "subtitulo2":
        next.subtitulo2 = value.slice(0, LENGTHS.descripcion);
        break;
      case "video_titulo":
        next.video_titulo = value.slice(0, LENGTHS.videoTitulo);
        break;
      case "video_url":
        next.video_url = value.slice(0, LENGTHS.videoUrl);
        break;
      default:
        break;
    }
    setFormData((prev) => ({ ...prev, ...(next as any) }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!ACCEPT_IMAGE_TYPES.includes(f.type)) {
      Swal.fire("Formato no válido", "Solo JPG, JPEG, PNG o WEBP.", "warning");
      return;
    }
    if (bytesToMB(f.size) > MAX_IMAGE_MB) {
      Swal.fire("Imagen muy pesada", `Máximo ${MAX_IMAGE_MB} MB.`, "warning");
      return;
    }
    setFormData({ ...formData, miniatura: f });
  };

  const handleFileChangeAdicional = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!ACCEPT_IMAGE_TYPES.includes(f.type)) {
      Swal.fire("Formato no válido", "Solo JPG, JPEG, PNG o WEBP.", "warning");
      return;
    }
    if (bytesToMB(f.size) > MAX_IMAGE_MB) {
      Swal.fire("Imagen muy pesada", `Máximo ${MAX_IMAGE_MB} MB.`, "warning");
      return;
    }
    const nuevoArray = [...formData.imagenes];
    nuevoArray[index] = { ...nuevoArray[index], imagen: f };
    setFormData({ ...formData, imagenes: nuevoArray });
  };

  const handleParrafoChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    index: number
  ) => {
    const nuevoArray = [...formData.imagenes];
    nuevoArray[index] = { ...nuevoArray[index], parrafo: e.target.value };
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
        "Selecciona texto para enlazar.",
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
        "Selecciona texto para enlazar.",
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
      Swal.fire("ID de producto vacío", "Selecciona un producto.", "error");
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
    const linkedProductText = `<a href="${productUrl}" style="font-weight: bold;" title="${productoSeleccionado.link}">${selectedText}</a>`;
    const newValue = before + linkedProductText + after;

    const nuevosParrafos = [...formData.imagenes];
    nuevosParrafos[activeIndex] = {
      ...nuevosParrafos[activeIndex],
      parrafo: newValue,
    };

    setFormData((prev) => ({ ...prev, imagenes: nuevosParrafos }));
    setIsProductLinkModalOpen(false);
    setSelectedText("");
    setActiveIndex(null);
  };

  const handleAddLink = () => {
    if (activeIndex === null) return;
    if (!link.trim() || !isValidUrl(link.trim())) {
      Swal.fire(
        "Enlace inválido",
        "Ingresa una URL válida (https://...).",
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

    const linkedText = `<a href="${link.trim()}" style="font-weight: bold;" title="${selectedText}">${selectedText}</a>`;
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
    setActiveIndex(null);
  };

  const closeModal = () => {
    setIsOpen(false);
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
      etiqueta: { meta_titulo: "", meta_descripcion: "" },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // 🔹 Validaciones frontend (las que ya tenías)
    if (
      formData.titulo.length === 0 ||
      formData.titulo.length > LENGTHS.titulo
    ) {
      Swal.fire(
        "Error",
        `El título es obligatorio y máx. ${LENGTHS.titulo} caracteres.`,
        "error"
      );
      setIsSaving(false);
      return;
    }
    if (
      formData.subtitulo1.length === 0 ||
      formData.subtitulo1.length > LENGTHS.parrafo
    ) {
      Swal.fire(
        "Error",
        `El párrafo es obligatorio y máx. ${LENGTHS.parrafo} caracteres.`,
        "error"
      );
      setIsSaving(false);
      return;
    }
    if (
      formData.subtitulo2.length === 0 ||
      formData.subtitulo2.length > LENGTHS.descripcion
    ) {
      Swal.fire(
        "Error",
        `La descripción es obligatoria y máx. ${LENGTHS.descripcion} caracteres.`,
        "error"
      );
      setIsSaving(false);
      return;
    }
    if (
      formData.video_titulo.length === 0 ||
      formData.video_titulo.length > LENGTHS.videoTitulo
    ) {
      Swal.fire(
        "Error",
        `El título del video es obligatorio y máx. ${LENGTHS.videoTitulo} caracteres.`,
        "error"
      );
      setIsSaving(false);
      return;
    }
    if (
      formData.video_url.length === 0 ||
      formData.video_url.length > LENGTHS.videoUrl ||
      !isValidUrl(formData.video_url)
    ) {
      Swal.fire(
        "Error",
        `La URL del video es obligatoria, máx. ${LENGTHS.videoUrl} y debe ser válida.`,
        "error"
      );
      setIsSaving(false);
      return;
    }
    if (!formData.producto_id) {
      Swal.fire("Error", "Selecciona un producto.", "error");
      setIsSaving(false);
      return;
    }

    // miniatura obligatoria solo en creación
    if (!blogToEdit && !formData.miniatura) {
      Swal.fire("Error", "La miniatura es obligatoria.", "error");
      setIsSaving(false);
      return;
    }

    // Validación imágenes adicionales y párrafos
    if (
      formData.imagenes.some(
        (img) => (!blogToEdit && !img.imagen) || !img.parrafo
      )
    ) {
      Swal.fire(
        "Error",
        "Cada imagen adicional y su descripción son obligatorias.",
        "error"
      );
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
      formDataToSend.append("meta_titulo", formData.etiqueta.meta_titulo);
      formDataToSend.append(
        "meta_descripcion",
        formData.etiqueta.meta_descripcion
      );
      formDataToSend.append("producto_id", formData.producto_id.toString());

      if (formData.miniatura instanceof File) {
        formDataToSend.append("miniatura", formData.miniatura);
      }

      formData.imagenes.forEach((item) => {
        if (item.imagen) formDataToSend.append("imagenes[]", item.imagen);
        formDataToSend.append("parrafos[]", item.parrafo);
        formDataToSend.append("text_alt[]", "Sin descripción");
      });

      if (blogToEdit) formDataToSend.append("_method", "POST");

      const url = blogToEdit
        ? `${getApiUrl(config.endpoints.blogs.list)}/${blogToEdit.id}`
        : getApiUrl(config.endpoints.blogs.create);

      const response = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      });

      const data = await response.json();
      console.log("response", response);
      console.log("data", data);

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
        // 🔹 Mostrar errores detallados del backend
        if (data.errors) {
          const errores = Object.entries(data.errors)
            .map(
              ([campo, mensajes]) =>
                `- ${campo}: ${(mensajes as string[]).join(", ")}`
            )
            .join("\n");

          Swal.fire({
            icon: "error",
            title: "Errores de validación",
            text: errores,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: `❌ ${data.message || "Error al guardar blog"}`,
          });
        }
      }
    } catch (error: any) {
      console.error("Error al enviar los datos:", error);
      Swal.fire({ icon: "error", title: "Error", text: `❌ ${error}` });
    } finally {
      setIsSaving(false);
    }
  };

  // Cuenta palabras en un string
  function contarPalabras(texto: string): number {
    return texto.trim().length === 0 ? 0 : texto.trim().split(/\s+/).length;
  }
  // Utilidad para convertir números a palabras en español
  function numeroAPalabras(n: number): string {
    const unidades = [
      "cero",
      "uno",
      "dos",
      "tres",
      "cuatro",
      "cinco",
      "seis",
      "siete",
      "ocho",
      "nueve",
      "diez",
      "once",
      "doce",
      "trece",
      "catorce",
      "quince",
      "dieciséis",
      "diecisiete",
      "dieciocho",
      "diecinueve",
      "veinte",
    ];
    const decenas = [
      "",
      "diez",
      "veinte",
      "treinta",
      "cuarenta",
      "cincuenta",
      "sesenta",
      "setenta",
      "ochenta",
      "noventa",
    ];
    if (n <= 20) return unidades[n];
    if (n < 100) {
      const d = Math.floor(n / 10);
      const u = n % 10;
      if (u === 0) return decenas[d];
      if (d === 2) return "veinti" + unidades[u];
      return decenas[d] + " y " + unidades[u];
    }
    if (n === 100) return "cien";
    if (n < 200) return "ciento " + numeroAPalabras(n - 100);
    if (n < 1000) {
      const c = Math.floor(n / 100);
      const r = n % 100;
      let centena = c === 1 ? "ciento" : unidades[c] + "cientos";
      if (r === 0) return centena;
      return centena + " " + numeroAPalabras(r);
    }
    return n.toString();
  }

  return (
    <>
      {(isOpen || propIsOpen) && (
        <div className="dialog-overlay">
          <div className="max-h-[90vh] dialog">
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
              {/* Título */}
              <div className="form-input">
                <label className="font-medium">Título*</label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  maxLength={LENGTHS.titulo}
                  required
                />
              </div>

              {/* Link (slug) */}
              <div className="form-input">
                <label className="font-medium">Link*</label>
                <input
                  type="text"
                  name="link"
                  value={formData.link}
                  onChange={handleChange}
                  maxLength={LENGTHS.titulo} /* opcional: igual que título */
                  required
                />
              </div>

              {/* Meta título */}
              <div className="form-input">
                <label className="font-medium">Meta título</label>
                <input
                  type="text"
                  name="meta_titulo"
                  value={formData.etiqueta.meta_titulo}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      etiqueta: {
                        ...formData.etiqueta,
                        meta_titulo: e.target.value.slice(
                          0,
                          LENGTHS.metaTitulo
                        ),
                      },
                    })
                  }
                  maxLength={LENGTHS.metaTitulo}
                />
                <small className="text-gray-500">
                  Máximo 10 caracteres
                </small>
              </div>

              {/* Meta descripción */}
              <div className="form-input">
                <label className="font-medium">Meta descripción</label>
                <textarea
                  name="meta_descripcion"
                  value={formData.etiqueta.meta_descripcion}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      etiqueta: {
                        ...formData.etiqueta,
                        meta_descripcion: e.target.value.slice(
                          0,
                          LENGTHS.metaDescripcion
                        ),
                      },
                    })
                  }
                  maxLength={LENGTHS.metaDescripcion}
                  rows={3}
                />
                <small className="text-gray-500">
                  Máximo 40 caracteres
                </small>
              </div>

              {/* Párrafo (subtitulo1) */}
              <div className="form-input">
                <label className="font-medium">Párrafo*</label>
                <input
                  type="text"
                  name="subtitulo1"
                  value={formData.subtitulo1}
                  onChange={handleChange}
                  maxLength={LENGTHS.parrafo}
                  required
                />
              </div>

              {/* Descripción (subtitulo2) */}
              <div className="md:col-span-2 form-input">
                <label className="font-medium">Descripción*</label>
                <input
                  type="text"
                  name="subtitulo2"
                  value={formData.subtitulo2}
                  onChange={handleChange}
                  maxLength={LENGTHS.descripcion}
                  required
                />
              </div>

              {/* Título Video */}
              <div className="form-input">
                <label className="font-medium">Título Video*</label>
                <input
                  type="text"
                  name="video_titulo"
                  value={formData.video_titulo}
                  onChange={handleChange}
                  maxLength={LENGTHS.videoTitulo}
                  required
                />
              </div>

              {/* URL del Video */}
              <div className="form-input">
                <label className="font-medium">URL del Video*</label>
                <input
                  type="url"
                  name="video_url"
                  value={formData.video_url}
                  onChange={handleChange}
                  maxLength={LENGTHS.videoUrl}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>

              {/* Producto */}
              <div className="md:col-span-2 form-input">
                <label className="font-medium">Producto*</label>
                <select
                  name="producto_id"
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
                <small className="text-gray-500">
                  Selecciona el producto relacionado.
                </small>
              </div>

              {/* Miniatura */}
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Miniatura{!blogToEdit && "*"}
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
                  accept={ACCEPT_IMAGE_TYPES.join(",")}
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                />
                <small className="text-gray-500">
                  Formatos permitidos: JPG, JPEG, PNG, WEBP. Máx. {MAX_IMAGE_MB}{" "}
                  MB.
                </small>
              </div>

              {/* Imágenes adicionales + descripción larga */}
              {formData.imagenes.map((imagen, index) => (
                <div key={index} className="md:col-span-2 form-input">
                  <label className="font-medium">
                    Imagen Adicional {index + 1}
                    {!blogToEdit && "*"}
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
                          accept={ACCEPT_IMAGE_TYPES.join(",")}
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

                  <div className="md:col-span-2 form-input">
                    <label className="font-medium">Descripción Completa*</label>
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
                          {/* icono link */}
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
                          {/* icono carrito */}
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

              {/* Acciones */}
              <div className="md:col-span-2 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={onClose ? onClose : closeModal}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-800 dark:bg-gray-900 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 transition"
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

            {/* Modal enlace */}
            {isModalOpen && (
              <div className="dialog-overlay">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-sm">
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
                      className="px-4 py-2 bg-gray-300 dark:bg-gray-900 rounded"
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

            {/* Modal producto */}
            {isProductLinkModalOpen && (
              <div className="dialog-overlay">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto form-input">
                  <h3 className="text-xl font-bold mb-4">
                    Enlazar "{selectedText}" a producto:
                  </h3>
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
                  <div className="flex justify-end gap-2 p-6">
                    <button
                      onClick={() => setIsProductLinkModalOpen(false)}
                      className="px-4 py-2 bg-gray-300 dark:bg-gray-900 rounded"
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
