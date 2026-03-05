import { config } from "../../../../config.ts";
import apiClient from "../../../services/apiClient";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

interface ImagenAdicional {
  imagen: File | null;
  parrafo: string;
  text_alt: string;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      { imagen: null, parrafo: "", text_alt: "" },
      { imagen: null, parrafo: "", text_alt: "" },
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
        const response = await apiClient.get(config.endpoints.productos.list);
        const data = response.data;

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
            text_alt: img.text_alt || "",
            url: raw
              ? raw.startsWith("http")
                ? raw
                : `${import.meta.env.PUBLIC_API_URL}${raw}`
              : "",
          };
        }) || [
            { imagen: null, parrafo: "", text_alt: "", url: "" },
            { imagen: null, parrafo: "", text_alt: "", url: "" },
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
          { imagen: null, parrafo: "", text_alt: "" },
          { imagen: null, parrafo: "", text_alt: "" },
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

  const handleAltTextChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const nuevoArray = [...formData.imagenes];
    nuevoArray[index] = { ...nuevoArray[index], text_alt: e.target.value };
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
        { imagen: null, parrafo: "", text_alt: "" },
        { imagen: null, parrafo: "", text_alt: "" },
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
      setIsSubmitting(true);

      const url = blogToEdit
        ? `${config.endpoints.blogs.list}/${blogToEdit.id}`
        : config.endpoints.blogs.create;

      const formDataToSend = new FormData();
      formDataToSend.append("titulo", formData.titulo);
      formDataToSend.append("link", formData.link);
      formDataToSend.append("subtitulo1", formData.subtitulo1);
      formDataToSend.append("subtitulo2", formData.subtitulo2);
      formDataToSend.append("video_url", formData.video_url || "");
      formDataToSend.append("video_titulo", formData.video_titulo || "");
      formDataToSend.append("meta_titulo", formData.etiqueta.meta_titulo);
      formDataToSend.append("meta_descripcion", formData.etiqueta.meta_descripcion);
      formDataToSend.append("producto_id", formData.producto_id.toString());

      if (formData.miniatura instanceof File) {
        formDataToSend.append("miniatura", formData.miniatura);
      }

      formData.imagenes.forEach((item) => {
        if (item.imagen instanceof File) {
          formDataToSend.append("imagenes[]", item.imagen);
        } else if (typeof item.imagen === "string") {
          formDataToSend.append("existing_images[]", item.imagen);
        }
        formDataToSend.append("parrafos[]", item.parrafo);
        formDataToSend.append("text_alt[]", item.text_alt);
      });

      if (blogToEdit) {
        formDataToSend.append("_method", "PUT");
      }

      const response = await apiClient.post(url, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200 || response.status === 201) {
        const data = response.data;
        await Swal.fire({
          icon: "success",
          title: blogToEdit
            ? "Blog actualizado con éxito"
            : "Blog creado con éxito",
          text: `El blog "${data.data.titulo}" ha sido ${blogToEdit ? "actualizado" : "creado"
            } correctamente.`,
          confirmButtonColor: "#3085d6",
        });
        closeModal();
        onBlogAdded();
      } else {
        const data = response.data;
        if (data.errors) {
          const errores = Object.entries(data.errors)
            .map(([key, value]) => `${key}: ${(value as string[]).join(", ")}`)
            .join("\n");
          throw new Error(`Errores de validación:\n${errores}`);
        }
        throw new Error(data.message || "Error al procesar el blog");
      }
    } catch (error: any) {
      console.error("Error al enviar el blog:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Ocurrió un error al procesar la solicitud",
        confirmButtonColor: "#d33",
      });
    } finally {
      setIsSubmitting(false);
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
              <div className="form-input">
                <label className="font-medium">Título para web*</label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  maxLength={LENGTHS.titulo}
                  required
                />
              </div>

              <div className="form-input">
                <label className="font-medium">Link*</label>
                <input
                  type="text"
                  name="link"
                  value={formData.link}
                  onChange={handleChange}
                  maxLength={LENGTHS.titulo}
                  required
                />
              </div>

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
                  Sugerido {LENGTHS.metaTitulo} caracteres
                </small>
              </div>

              <div className="form-input">
                <label className="font-medium">Meta descripción</label>
                <input
                  type="text"
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
                />
                <small className="text-gray-500">
                  Sugerido {LENGTHS.metaDescripcion} caracteres
                </small>
              </div>

              <div className="form-input">
                <label className="font-medium">Párrafo corto (100 palabras)*</label>
                <textarea
                  name="subtitulo1"
                  value={formData.subtitulo1}
                  onChange={handleChange}
                  maxLength={LENGTHS.parrafo}
                  required
                  rows={3}
                />
                <small className="text-gray-500 text-end block">
                  {contarPalabras(formData.subtitulo1)} palabras (Máx {LENGTHS.parrafo})
                </small>
              </div>

              <div className="form-input">
                <label className="font-medium">Descripción (255 palabras)*</label>
                <textarea
                  name="subtitulo2"
                  value={formData.subtitulo2}
                  onChange={handleChange}
                  maxLength={LENGTHS.descripcion}
                  required
                  rows={3}
                />
                <small className="text-gray-500 text-end block">
                  {contarPalabras(formData.subtitulo2)} palabras (Máx {LENGTHS.descripcion})
                </small>
              </div>

              <div className="form-input">
                <label className="font-medium">Título del video para YouTube*</label>
                <input
                  type="text"
                  name="video_titulo"
                  value={formData.video_titulo}
                  onChange={handleChange}
                  maxLength={LENGTHS.videoTitulo}
                  required
                />
              </div>

              <div className="form-input">
                <label className="font-medium">URL del video*</label>
                <input
                  type="text"
                  name="video_url"
                  value={formData.video_url}
                  onChange={handleChange}
                  maxLength={LENGTHS.videoUrl}
                  required
                />
              </div>

              <div className="form-input">
                <label className="font-medium">Relacionar con producto*</label>
                <select
                  name="producto_id"
                  value={formData.producto_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecciona un producto</option>
                  {productos.map((producto: any) => (
                    <option key={producto.id} value={producto.id}>
                      {producto.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-input">
                <label className="font-medium block mb-2">Miniatura del Blog*</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="miniatura-upload"
                />
                <label
                  htmlFor="miniatura-upload"
                  className="cursor-pointer border-2 border-dashed border-teal-300 p-4 rounded-lg block text-center hover:bg-teal-50 transition-colors"
                >
                  {formData.miniatura ? (
                    <span className="text-teal-600 font-medium">
                      {(formData.miniatura as any).name || "Imagen cargada"}
                    </span>
                  ) : (
                    <span className="text-gray-400">Click para subir miniatura</span>
                  )}
                </label>
              </div>

              <div className="col-span-1 md:col-span-2 mt-4">
                <h3 className="text-xl font-bold text-teal-600 mb-4">Contenido del Blog</h3>
                {formData.imagenes.map((imagen, index) => (
                  <div key={index} className="mb-6 p-4 border rounded-lg bg-gray-50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-teal-700">Sección {numeroAPalabras(index + 1)}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Imagen*</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChangeAdicional(e, index)}
                          className="w-full text-sm"
                        />
                        <div className="mt-2">
                          <label className="block text-xs font-medium text-gray-600 mb-1">Texto Alternativo (SEO)*</label>
                          <input
                            type="text"
                            value={imagen.text_alt}
                            onChange={(e) => handleAltTextChange(e, index)}
                            placeholder="Descripción de la imagen"
                            className="w-full border rounded p-1 text-xs"
                            required
                          />
                        </div>
                        {imagen.url && (
                          <div className="mt-2">
                            <img src={imagen.url} alt={`Sección ${index + 1}`} className="w-20 h-20 object-cover rounded" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-sm font-medium text-gray-700">Párrafo de la sección*</label>
                          <div className="space-x-2">
                            <button
                              type="button"
                              onClick={() => handleInsertLinkClick(index)}
                              className="text-xs text-teal-600 hover:text-teal-800 underline"
                            >
                              Insertar Link
                            </button>
                            <button
                              type="button"
                              onClick={() => handleProductLinkClick(index)}
                              className="text-xs text-teal-600 hover:text-teal-800 underline"
                            >
                              Link Producto
                            </button>
                          </div>
                        </div>
                        <textarea
                          id={`crear_descripcion_antes_${index}`}
                          value={imagen.parrafo}
                          onChange={(e) => handleParrafoChange(e, index)}
                          className="w-full border rounded p-2 text-sm"
                          rows={4}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="col-span-1 md:col-span-2 flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={onClose ? onClose : closeModal}
                  className="px-6 py-2 border rounded-full text-gray-600 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isSubmitting}
                  className="px-8 py-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 disabled:bg-gray-400 shadow-lg"
                >
                  {isSaving || isSubmitting ? "Guardando..." : "Guardar Blog"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para insertar enlace manual */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000]">
          <div className="bg-white p-6 rounded-xl w-96">
            <h3 className="text-xl font-bold mb-4">Insertar Enlace</h3>
            <p className="text-sm text-gray-600 mb-2">Enlace para: <strong>{selectedText}</strong></p>
            <input
              type="text"
              placeholder="https://..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full border p-2 rounded mb-4 focus:ring-2 focus:ring-teal-500"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-500">Cancelar</button>
              <button onClick={handleAddLink} className="px-4 py-2 bg-teal-600 text-white rounded">Insertar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para insertar enlace de producto */}
      {isProductLinkModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000]">
          <div className="bg-white p-6 rounded-xl w-96">
            <h3 className="text-xl font-bold mb-4">Enlace a Producto</h3>
            <p className="text-sm text-gray-600 mb-2">Enlace para: <strong>{selectedText}</strong></p>
            <select
              value={formData.producto_id}
              onChange={(e) => setFormData({ ...formData, producto_id: e.target.value })}
              className="w-full border p-2 rounded mb-4"
            >
              <option value="">Selecciona un producto</option>
              {productos.map((producto: any) => (
                <option key={producto.id} value={producto.id}>{producto.nombre}</option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsProductLinkModalOpen(false)} className="px-4 py-2 text-gray-500">Cancelar</button>
              <button onClick={handleAddProduct} className="px-4 py-2 bg-teal-600 text-white rounded">Insertar</button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .dialog-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex; justify-content: center; align-items: center;
          z-index: 999;
          padding: 20px;
        }
        .dialog {
          background: #fff;
          width: 100%;
          max-width: 900px;
          padding: 30px;
          border-radius: 20px;
          overflow-y: auto;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }
        .form-input {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .form-input input, .form-input select, .form-input textarea {
          border: 1px solid #ddd;
          padding: 10px;
          border-radius: 10px;
          outline: none;
          transition: border-color 0.2s;
        }
        .form-input input:focus, .form-input select:focus, .form-input textarea:focus {
          border-color: #0d9488;
        }
      `}} />
    </>
  );
};

export default AddBlogModal;
