import { useState, useRef, useEffect } from "react";
import { defaultValuesProduct, type ProductFormularioPOST } from "../../../models/Product.ts";
import type Product from "src/models/Product";
import { IoMdCloseCircle } from "react-icons/io";
import { FaEdit } from "react-icons/fa";
import { config } from "../../../../config.ts";
import apiClient from "../../../services/apiClient";
import { getProducts } from "../../../hooks/admin/productos/productos.ts";
import Swal from "sweetalert2";
import { slugify } from "../../../utils/slugify";
import RichTextEditor from "./RichTextEditor";
import type { ImagenForm, ImagenEditada } from "../../../models/Product";

interface EditProductProps {
  product: Product;
  onProductUpdated: () => Promise<void> | void;
}

const TABS = [
  { id: "general", label: "Datos Generales", icon: "ℹ️" },
  { id: "descripciones", label: "Descripciones", icon: "📝" },
  { id: "especificaciones", label: "Ficha Técnica", icon: "⚙️" },
  { id: "personalizacion", label: "Personalización UI", icon: "🎨" },
  { id: "galeria", label: "Galería de Imágenes", icon: "📸" },
  { id: "seo", label: "SEO y Metadatos", icon: "🔍" },
  { id: "relacionados", label: "Relacionados", icon: "🔗" }
];

const EditProduct: React.FC<EditProductProps> = ({ product, onProductUpdated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [productos, setProductos] = useState<Product[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLinkEdited, setIsLinkEdited] = useState(false);

  // Ficha técnica helper states
  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");

  // SEO Keywords helper state
  const [newKeyword, setNewKeyword] = useState("");

  const [formData, setFormData] = useState<ProductFormularioPOST>(defaultValuesProduct);

  const formContainerRef = useRef<HTMLDivElement>(null);
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});

  const getFullImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${config.apiUrl}${url}`;
  };

  const getImagePreview = (image: File | string | null): string => {
    if (!image) return "";
    if (typeof image === "string") {
      return getFullImageUrl(image);
    }
    return URL.createObjectURL(image);
  };

  useEffect(() => {
    if (showModal && product) {
      const refreshCache = Date.now();
      
      const imagenesTransformadas: ImagenForm[] = product.imagenes?.map((img) => ({
        id: img.id,
        url_imagen: `${getFullImageUrl(img.url_imagen)}?v=${refreshCache}`,
        texto_alt_SEO: img.texto_alt_SEO || "",
        original_path: img.url_imagen
      })) || [];
      
      while (imagenesTransformadas.length < 5) {
        imagenesTransformadas.push({
          url_imagen: "",
          texto_alt_SEO: ""
        });
      }

      const relacionadosIds = product.productos_relacionados?.map((rel: any) => rel.id) || [];
      const keywordsArray = product.etiqueta?.keywords 
        ? product.etiqueta.keywords.split(",").map(kw => kw.trim()).filter(k => k !== "")
        : [];

      const imagenPopup2 = product.producto_imagenes?.find((img) => {
        const tipo = (img.tipo || "").toLowerCase();
        return tipo === "popup2" || tipo === "popup_2";
      });

      const detalleTituloProducto = product as Product & {
        detalle_titulo_tamano?: string;
        detalle_titulo_color?: string;
        detalle_titulo_estilo?: string;
      };

      setIsLinkEdited(!!product.link);

      setFormData({
        ...defaultValuesProduct,
        nombre: product.nombre || "",
        porque_elegirnos: product.porque_elegirnos || "",
        titulo: product.titulo || "",
        subtitulo: product.subtitulo || "",
        link: product.link || "",
        descripcion: product.descripcion || "",
        etiqueta: {
          keywords: keywordsArray.length > 0 ? keywordsArray : [""],
          meta_titulo: product.etiqueta?.meta_titulo || "",
          meta_descripcion: product.etiqueta?.meta_descripcion || "",
          popup_estilo: product.etiqueta?.popup_estilo || "estilo1",
          titulo_popup_1: product.etiqueta?.titulo_popup_1 || "",
          titulo_popup_2: product.etiqueta?.titulo_popup_2 || "",
          titulo_popup_3: product.etiqueta?.titulo_popup_3 || "",
          titulo_detalle_producto_size: detalleTituloProducto.detalle_titulo_tamano || product.etiqueta?.titulo_detalle_producto_size || "24",
          titulo_detalle_producto_color: detalleTituloProducto.detalle_titulo_color || product.etiqueta?.titulo_detalle_producto_color || "#015f86",
          titulo_detalle_producto_style: detalleTituloProducto.detalle_titulo_estilo || product.etiqueta?.titulo_detalle_producto_style || "negrita",
          popup3_sin_fondo: product.etiqueta?.popup3_sin_fondo || false,
          popup_button_color: product.etiqueta?.popup_button_color || "#008B8B",
          popup_text_color: product.etiqueta?.popup_text_color || "#000000",
          popup_button_text: product.etiqueta?.popup_button_text || "¡COTIZA AHORA!",
        },
        stock: product.stock ?? 100,
        precio: product.precio ?? 0,
        seccion: product.seccion || "Negocio",
        especificaciones: Array.isArray(product.especificaciones)
          ? product.especificaciones.map((e: any) => e.valor)
          : [],
        relacionados: relacionadosIds,
        imagenes: imagenesTransformadas,
        dimensiones: {
          largo: product.dimensiones?.largo || "",
          alto: product.dimensiones?.alto || "",
          ancho: product.dimensiones?.ancho || "",
        },
        imagen_popup2: imagenPopup2 ? getFullImageUrl(imagenPopup2.url_imagen) : null,
        texto_alt_popup2: imagenPopup2?.texto_alt_SEO || "",
      });
    }
  }, [showModal, product]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const nuevoEstado = { ...prev };
      if (name === "nombre") {
        nuevoEstado.nombre = value;
        if (!isLinkEdited) {
          nuevoEstado.link = value
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replaceAll(" ", "-");
        }
      } else if (name === "link") {
        const sanitized = value
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .replaceAll(" ", "-");
        nuevoEstado.link = sanitized;
      } else {
        (nuevoEstado as any)[name] = value;
      }
      return nuevoEstado;
    });

    if (name === "link") {
      setIsLinkEdited(true);
    }

    setErrors(prev => {
      const next = { ...prev };
      if (next[name]) delete next[name];
      if (name === "nombre" && next.link) delete next.link;
      return next;
    });
  };

  const handleDimensionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      dimensiones: {
        ...prev.dimensiones,
        [name]: value
      }
    }));
    setErrors(prev => {
      if (prev[name]) {
        const next = { ...prev };
        delete next[name];
        return next;
      }
      return prev;
    });
  };

  const handleRelacionadosChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    id: number
  ) => {
    if (e.target.checked) {
      setFormData(prev => ({
        ...prev,
        relacionados: [...prev.relacionados, id]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        relacionados: prev.relacionados.filter(item => item !== id)
      }));
    }
  };

  const handleImagesChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes("webp") && !file.type.includes("image")) {
      Swal.fire({
        icon: "error",
        title: "Formato inválido",
        text: "❌ Solo se aceptan imágenes en formato WEBP o imágenes estándar.",
      });
      return;
    }

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      Swal.fire({
        icon: "error",
        title: "Archivo demasiado grande",
        text: `❌ El archivo no puede exceder 2MB. Tamaño actual: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
      });
      return;
    }

    setFormData(prev => {
      const nuevoArray = [...prev.imagenes];
      nuevoArray[index] = {
        ...nuevoArray[index],
        url_imagen: file,
      };
      return { ...prev, imagenes: nuevoArray };
    });
  };


  const handleImagesTituloChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    setFormData(prev => {
      const nuevoArray = [...prev.imagenes];
      nuevoArray[index] = {
        ...nuevoArray[index],
        imageTitle: e.target.value,
      };
      return { ...prev, imagenes: nuevoArray };
    });
  };


  const handleImagesTextoSEOChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    setFormData(prev => {
      const nuevoArray = [...prev.imagenes];
      nuevoArray[index] = {
        ...nuevoArray[index],
        texto_alt_SEO: e.target.value,
      };
      return { ...prev, imagenes: nuevoArray };
    });
  };

  const addNewSpecification = () => {
    if (specKey.trim() && specValue.trim()) {
      const fullSpec = `${specKey.trim()}: ${specValue.trim()}`;
      setFormData(prev => ({
        ...prev,
        especificaciones: [...prev.especificaciones, fullSpec]
      }));
      setSpecKey("");
      setSpecValue("");
      if (errors.especificaciones) {
        setErrors(prev => {
          const next = { ...prev };
          delete next.especificaciones;
          return next;
        });
      }
    }
  };

  const eliminarEspecificacion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      especificaciones: prev.especificaciones.filter((_, i) => i !== index)
    }));
  };

  const handleEspecificacionChange = (index: number, value: string) => {
    setFormData(prev => {
      const nuevas = [...prev.especificaciones];
      nuevas[index] = value;
      return { ...prev, especificaciones: nuevas };
    });
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !formData.etiqueta.keywords.includes(newKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        etiqueta: {
          ...prev.etiqueta,
          keywords: [...prev.etiqueta.keywords.filter(k => k.trim() !== ""), newKeyword.trim()]
        }
      }));
      setNewKeyword("");
      if (errors.keywords) {
        setErrors(prev => {
          const next = { ...prev };
          delete next.keywords;
          return next;
        });
      }
    }
  };

  const handleRemoveKeyword = (index: number) => {
    setFormData(prev => ({
      ...prev,
      etiqueta: {
        ...prev.etiqueta,
        keywords: prev.etiqueta.keywords.filter((_, i) => i !== index)
      }
    }));
  };

  const tabHasError = (tabId: string) => {
    if (tabId === "general") {
      return !!(errors.nombre || errors.link || errors.seccion || errors.subtitulo);
    }
    if (tabId === "descripciones") {
      return !!(errors.descripcion || errors.porque_elegirnos);
    }
    if (tabId === "especificaciones") {
      return !!(errors.alto || errors.ancho || errors.largo || errors.especificaciones);
    }
    if (tabId === "personalizacion") {
      return !!errors.titulo;
    }
    if (tabId === "galeria") {
      return !!(errors.gallery || errors.seo_0 || errors.seo_1 || errors.seo_2 || errors.seo_3 || errors.seo_4);
    }
    if (tabId === "seo") {
      return !!(errors.meta_titulo || errors.meta_descripcion || errors.keywords);
    }
    return false;
  };

  const validateAll = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Tab 1: General
    if (!formData.nombre?.trim()) newErrors.nombre = "El nombre es obligatorio.";
    if (!formData.link?.trim()) newErrors.link = "El link permanente es obligatorio.";
    if (!formData.subtitulo?.trim()) newErrors.subtitulo = "El subtítulo es obligatorio.";
    if (!formData.seccion?.trim()) newErrors.seccion = "Debes seleccionar una sección.";

    // Tab 2: Descripciones
    if (!formData.descripcion?.trim() || formData.descripcion === "<p></p>") {
      newErrors.descripcion = "La descripción es obligatoria.";
    }
    if (!formData.porque_elegirnos?.trim() || formData.porque_elegirnos === "<p></p>") {
      newErrors.porque_elegirnos = "La propuesta '¿Por qué elegirnos?' es obligatoria.";
    }

    // Tab 3: Ficha Técnica
    if (!formData.dimensiones?.alto?.toString().trim()) newErrors.alto = "El alto es obligatorio.";
    if (!formData.dimensiones?.ancho?.toString().trim()) newErrors.ancho = "El ancho es obligatorio.";
    if (!formData.dimensiones?.largo?.toString().trim()) newErrors.largo = "El largo es obligatorio.";
    if (formData.especificaciones.length === 0) {
      newErrors.especificaciones = "Debes añadir al menos una especificación.";
    }

    // Tab 4: Personalización
    if (!formData.titulo?.trim()) newErrors.titulo = "El título es obligatorio.";

    // Tab 5: Galería
    const validImages = formData.imagenes.filter(img => img.url_imagen);
    if (validImages.length < 4) {
      newErrors.gallery = `Debes subir al menos 4 imágenes para la galería (actualmente: ${validImages.length}).`;
    }
    formData.imagenes.forEach((img, index) => {
      if (img.url_imagen && !img.texto_alt_SEO?.trim()) {
        newErrors[`seo_${index}`] = `El texto SEO es obligatorio para la imagen ${index + 1}.`;
      }
    });

    // Tab 6: SEO / Metadatos
    if (!formData.etiqueta.meta_titulo?.trim()) {
      newErrors.meta_titulo = "El meta título es obligatorio.";
    } else if (formData.etiqueta.meta_titulo.trim().length < 10) {
      newErrors.meta_titulo = "El meta título debe tener al menos 10 caracteres.";
    }

    if (!formData.etiqueta.meta_descripcion?.trim()) {
      newErrors.meta_descripcion = "La meta descripción es obligatoria.";
    } else if (formData.etiqueta.meta_descripcion.trim().length < 40) {
      newErrors.meta_descripcion = `La meta descripción debe tener al menos 40 caracteres (actualmente: ${formData.etiqueta.meta_descripcion.trim().length}).`;
    }

    const cleanKeywords = formData.etiqueta.keywords.filter(k => k.trim() !== "");
    if (cleanKeywords.length === 0) {
      newErrors.keywords = "Debe ingresar al menos una palabra clave (keyword).";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      for (const tab of TABS) {
        if (
          (tab.id === "general" && (newErrors.nombre || newErrors.link || newErrors.seccion || newErrors.subtitulo)) ||
          (tab.id === "descripciones" && (newErrors.descripcion || newErrors.porque_elegirnos)) ||
          (tab.id === "especificaciones" && (newErrors.alto || newErrors.ancho || newErrors.largo || newErrors.especificaciones)) ||
          (tab.id === "personalizacion" && newErrors.titulo) ||
          (tab.id === "galeria" && (newErrors.gallery || newErrors.seo_0 || newErrors.seo_1 || newErrors.seo_2 || newErrors.seo_3 || newErrors.seo_4)) ||
          (tab.id === "seo" && (newErrors.meta_titulo || newErrors.meta_descripcion || newErrors.keywords))
        ) {
          setActiveTab(tab.id);
          break;
        }
      }
      return false;
    }
    return true;
  };

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setActiveTab("general");
    setShowModal(false);
    setFormData(defaultValuesProduct);
    setIsLinkEdited(false);
    setSpecKey("");
    setSpecValue("");
    setNewKeyword("");
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateAll()) {
      Swal.fire({
        icon: "warning",
        title: "Campos incorrectos",
        text: "⚠️ Hay errores de validación en el formulario. Por favor revisa las pestañas con indicación roja.",
      });
      setIsLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();

      formDataToSend.append("nombre", formData.nombre);
      formDataToSend.append("porque_elegirnos", formData.porque_elegirnos);
      formDataToSend.append("titulo", formData.titulo);
      formDataToSend.append("subtitulo", formData.subtitulo);
      const linkActual = formData.link.trim() || product.link || slugify(formData.nombre);
      formDataToSend.append("link", linkActual);
      formDataToSend.append("descripcion", formData.descripcion);
      formDataToSend.append("stock", formData.stock.toString());
      formDataToSend.append("precio", formData.precio.toString());
      formDataToSend.append("seccion", formData.seccion);
      formDataToSend.append("especificaciones", JSON.stringify(formData.especificaciones));
      
      formDataToSend.append("etiqueta[meta_titulo]", formData.etiqueta.meta_titulo);
      formDataToSend.append("etiqueta[meta_descripcion]", formData.etiqueta.meta_descripcion);
      
      formDataToSend.append("detalle_titulo_tamano", formData.etiqueta.titulo_detalle_producto_size || "24");
      formDataToSend.append("detalle_titulo_color", formData.etiqueta.titulo_detalle_producto_color || "#015f86");
      formDataToSend.append("detalle_titulo_estilo", formData.etiqueta.titulo_detalle_producto_style || "negrita");
      
      formDataToSend.append("etiqueta[popup_estilo]", formData.etiqueta.popup_estilo || "estilo1");
      formDataToSend.append("etiqueta[titulo_popup_1]", formData.etiqueta.titulo_popup_1 || "");
      formDataToSend.append("etiqueta[titulo_popup_2]", formData.etiqueta.titulo_popup_2 || "");
      formDataToSend.append("etiqueta[titulo_popup_3]", formData.etiqueta.titulo_popup_3 || "");
      formDataToSend.append("etiqueta[popup3_sin_fondo]", formData.etiqueta.popup3_sin_fondo ? "true" : "false");
      formDataToSend.append("etiqueta[popup_button_color]", formData.etiqueta.popup_button_color || "#008B8B");
      formDataToSend.append("etiqueta[popup_text_color]", formData.etiqueta.popup_text_color || "#000000");
      formDataToSend.append("etiqueta[popup_button_text]", formData.etiqueta.popup_button_text || "¡COTIZA AHORA!");
      
      const cleanKeywords = formData.etiqueta.keywords.filter(k => k.trim() !== "");
      formDataToSend.append("etiqueta[keywords]", JSON.stringify(cleanKeywords));
      formDataToSend.append("keywords", JSON.stringify(cleanKeywords));

      formDataToSend.append("dimensiones[alto]", formData.dimensiones.alto);
      formDataToSend.append("dimensiones[largo]", formData.dimensiones.largo);
      formDataToSend.append("dimensiones[ancho]", formData.dimensiones.ancho);

      // MANEJO DE IMÁGENES DE GALERÍA (Exactamente la lógica original de edición)
      const imagenesNuevas: File[] = [];
      const imagenesNuevasAlt: string[] = [];
      const imagenesNuevasTitulo: string[] = [];
      const imagenesEditadas: ImagenEditada[] = [];
      const imagenesExistentesData: Array<{ url: string; id?: number; alt: string; ttl?:string }> = [];

      formData.imagenes.forEach((imagen, index) => {
        if (!imagen.url_imagen) return;
        const altText = imagen.texto_alt_SEO?.trim() || `Imagen producto ${index + 1}`;
        const titulo = imagen.imageTitle?.trim() || `Imagen producto ${index + 1}`;

        if (imagen.url_imagen instanceof File) {
          if (imagen.id) {
            imagenesEditadas.push({
              id: imagen.id,
              file: imagen.url_imagen,
              alt: altText,
              ttl: titulo
            });
          } else {
            imagenesNuevas.push(imagen.url_imagen);
            imagenesNuevasAlt.push(altText);
            imagenesNuevasTitulo.push(titulo);
          }
        } else if (typeof imagen.url_imagen === "string" && imagen.url_imagen.trim() !== "") {
          let urlLimpia = "";
          if (imagen.original_path) {
            urlLimpia = imagen.original_path;
          } else {
            try {
              const urlObj = new URL(imagen.url_imagen, window.location.origin);
              urlLimpia = urlObj.pathname;
            } catch (error) {
              urlLimpia = imagen.url_imagen.split('?')[0].replace(config.apiUrl, '');
            }
          }
          urlLimpia = decodeURIComponent(urlLimpia.split('?')[0]);
          
          imagenesExistentesData.push({
            url: urlLimpia,
            id: imagen.id,
            alt: altText,
            ttl: titulo
          });
        }
      });

      // Añadir al FormData
      imagenesNuevas.forEach((file, idx) => {
        formDataToSend.append('imagenes_nuevas[]', file);
        formDataToSend.append('imagenes_nuevas_alt[]', imagenesNuevasAlt[idx]);
        formDataToSend.append(`imagenes_nuevas_titulo[]`, imagenesNuevasTitulo[idx])
      });

      imagenesEditadas.forEach((img, idx) => {
        formDataToSend.append(`imagenes_editadas[${idx}][id]`, img.id.toString());
        formDataToSend.append(`imagenes_editadas[${idx}][file]`, img.file);
        formDataToSend.append(`imagenes_editadas[${idx}][alt]`, img.alt);
        formDataToSend.append(`imagenes_editadas[${idx}][ttl]`, img.ttl);

      });

      imagenesExistentesData.forEach((img, idx) => {
        formDataToSend.append(`imagenes_existentes[${idx}][url]`, img.url);
        if (img.id) {
          formDataToSend.append(`imagenes_existentes[${idx}][id]`, img.id.toString());
        }
        formDataToSend.append(`imagenes_existentes[${idx}][alt]`, img.alt);
        formDataToSend.append(`imagenes_existentes[${idx}][ttl]`, img.ttl || `Imagen producto ${idx + 1}`)
      });

      formData.relacionados.forEach((item, index) => {
        formDataToSend.append(`relacionados[${index}]`, item.toString());
      });

      formDataToSend.append("_method", "PUT");

      const response = await apiClient.post(
        config.endpoints.productos.update(product.id),
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        Swal.fire({
          icon: "success",
          title: "Producto actualizado exitosamente",
          showConfirmButton: false,
          timer: 1500,
        });
        closeModal();
        await onProductUpdated?.();
        setIsLoading(false);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.data.message || "Error al actualizar el producto",
        });
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error("❌ Error al enviar los datos:", error);
      let errorMessage = "Ocurrió un error al procesar la solicitud.";
      if (error.response?.data?.errors) {
        const errs = error.response.data.errors;
        errorMessage = Object.keys(errs)
          .map(key => `${key}: ${errs[key].join(', ')}`)
          .join('\n');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else {
        errorMessage = error.message || String(error);
      }
      Swal.fire({
        icon: "error",
        title: "Error de Guardado",
        text: `❌ ${errorMessage}`,
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (showModal) {
      const fetchProductos = async () => {
        try {
          const data = await getProducts();
          setProductos(data);
        } catch (error) {
          console.error("Error al obtener productos:", error);
        }
      };
      fetchProductos();
    }
  }, [showModal]);

  return (
    <>
      <button
        className="p-2 text-green-600 hover:text-green-800 transition hover:cursor-pointer"
        title="Editar"
        onClick={openModal}
      >
        <FaEdit size={18} />
      </button>

      {showModal && (
        <div className="dialog-overlay">
          <div ref={formContainerRef} className="dialog w-full max-w-full md:max-w-4xl lg:max-w-5xl max-h-[90vh] flex flex-col !p-0 overflow-hidden">
            
            {/* Cabecera del Diálogo */}
            <div className="dialog-header sticky top-0 z-10 flex items-center justify-between !m-0 p-4 md:p-6 bg-teal-700 text-white flex-shrink-0">
              <h4 className="dialog-title text-lg md:text-xl font-bold flex-1 text-center">Editar Producto</h4>
              <button
                type="button"
                className="text-white hover:text-red-400 transition-all duration-300 cursor-pointer text-3xl"
                onClick={closeModal}
                aria-label="Cerrar"
              >
                <IoMdCloseCircle />
              </button>
            </div>

            {/* Contenedor del Formulario con Barra Lateral */}
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col md:flex-row overflow-hidden bg-white dark:bg-gray-800">
              
              {/* Barra Lateral de Pestañas */}
              <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible gap-1 md:w-64 flex-shrink-0 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 p-4 bg-gray-50/50 dark:bg-gray-900/10">
                {TABS.map(tab => {
                  const isActive = activeTab === tab.id;
                  const hasError = tabHasError(tab.id);
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left whitespace-nowrap cursor-pointer w-full ${
                        isActive
                          ? "bg-teal-600 text-white shadow-md"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      <span className="text-base">{tab.icon}</span>
                      <span className="flex-1">{tab.label}</span>
                      {hasError && (
                        <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Panel de Contenido de la Pestaña */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                
                {/* 1. DATOS GENERALES */}
                {activeTab === "general" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white border-b pb-2">ℹ️ Información General</h3>
                    
                    <div className="form-input flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nombre:</label>
                      <input
                        ref={el => { fieldRefs.current.nombre = el; }}
                        value={formData.nombre}
                        onChange={handleChange}
                        type="text"
                        name="nombre"
                        placeholder="Nombre del producto..."
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none dark:bg-slate-900 dark:text-white dark:border-gray-700 ${
                          errors.nombre ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-teal-500"
                        }`}
                      />
                      <p className="text-[10px] text-yellow-600 dark:text-yellow-400">
                        ⚠️ Mínimo 40 caracteres • Recomendado máx. 80 para evitar cortes.
                      </p>
                      {errors.nombre && <p className="text-red-500 text-xs mt-1">⚠️ {errors.nombre}</p>}
                    </div>

                    <div className="form-input flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Link Permanente:</label>
                      <input
                        ref={el => { fieldRefs.current.link = el; }}
                        value={formData.link}
                        onChange={handleChange}
                        type="text"
                        name="link"
                        placeholder="ej-nombre-producto"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none dark:bg-slate-900 dark:text-white dark:border-gray-700 ${
                          errors.link ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-teal-500"
                        }`}
                      />
                      {errors.link && <p className="text-red-500 text-xs mt-1">⚠️ {errors.link}</p>}
                    </div>

                    <div className="form-input flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Subtítulo:</label>
                      <input
                        ref={el => { fieldRefs.current.subtitulo = el; }}
                        value={formData.subtitulo}
                        onChange={handleChange}
                        type="text"
                        name="subtitulo"
                        placeholder="Subtitulo del producto..."
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none dark:bg-slate-900 dark:text-white dark:border-gray-700 ${
                          errors.subtitulo ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-teal-500"
                        }`}
                      />
                      {errors.subtitulo && <p className="text-red-500 text-xs mt-1">⚠️ {errors.subtitulo}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="form-input flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sección:</label>
                        <select
                          ref={el => { fieldRefs.current.seccion = el; }}
                          value={formData.seccion}
                          onChange={handleChange}
                          name="seccion"
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none dark:bg-slate-900 dark:text-white dark:border-gray-700 ${
                            errors.seccion ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-teal-500"
                          }`}
                        >
                          <option value="Decoración">Decoración</option>
                          <option value="Maquinaria">Maquinaria</option>
                          <option value="Negocio">Negocio</option>
                        </select>
                        {errors.seccion && <p className="text-red-500 text-xs mt-1">⚠️ {errors.seccion}</p>}
                      </div>

                      <div className="form-input flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Precio ($):</label>
                        <input
                          value={formData.precio}
                          onChange={handleChange}
                          type="number"
                          step="0.01"
                          name="precio"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                      </div>

                      <div className="form-input flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Stock:</label>
                        <input
                          value={formData.stock}
                          onChange={handleChange}
                          type="number"
                          name="stock"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. DESCRIPCIONES */}
                {activeTab === "descripciones" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white border-b pb-2">📝 Descripciones</h3>
                    
                    <div className="form-input flex flex-col gap-2">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Descripción del Producto:</label>
                      <div ref={el => { fieldRefs.current.descripcion = el; }}>
                        <RichTextEditor
                          value={formData.descripcion}
                          onChange={(html) => setFormData(prev => ({ ...prev, descripcion: html }))}
                        />
                      </div>
                      {errors.descripcion && <p className="text-red-500 text-xs mt-1">⚠️ {errors.descripcion}</p>}
                    </div>

                    <div className="form-input flex flex-col gap-2">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Propuesta "¿Por qué elegirnos?":</label>
                      <div ref={el => { fieldRefs.current.porque_elegirnos = el; }}>
                        <RichTextEditor
                          value={formData.porque_elegirnos}
                          onChange={(html) => setFormData(prev => ({ ...prev, porque_elegirnos: html }))}
                        />
                      </div>
                      {errors.porque_elegirnos && <p className="text-red-500 text-xs mt-1">⚠️ {errors.porque_elegirnos}</p>}
                    </div>
                  </div>
                )}

                {/* 3. FICHA TÉCNICA Y DIMENSIONES */}
                {activeTab === "especificaciones" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white border-b pb-2">⚙️ Ficha Técnica</h3>
                    
                    {/* Dimensiones */}
                    <div className="bg-gray-50 dark:bg-slate-900/60 p-4 rounded-xl border border-gray-150 dark:border-gray-700">
                      <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-1">
                        📦 Dimensiones (cm)
                      </h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="form-input flex flex-col">
                          <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Alto:</label>
                          <input
                            ref={el => { fieldRefs.current.alto = el; }}
                            value={formData.dimensiones.alto}
                            onChange={handleDimensionChange}
                            name="alto"
                            type="number"
                            placeholder="Ej: 80"
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none dark:bg-slate-900 dark:text-white dark:border-gray-700 ${
                              errors.alto ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-teal-500"
                            }`}
                          />
                          {errors.alto && <p className="text-red-500 text-[10px] mt-1">⚠️ {errors.alto}</p>}
                        </div>

                        <div className="form-input flex flex-col">
                          <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Ancho:</label>
                          <input
                            ref={el => { fieldRefs.current.ancho = el; }}
                            value={formData.dimensiones.ancho}
                            onChange={handleDimensionChange}
                            name="ancho"
                            type="number"
                            placeholder="Ej: 50"
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none dark:bg-slate-900 dark:text-white dark:border-gray-700 ${
                              errors.ancho ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-teal-500"
                            }`}
                          />
                          {errors.ancho && <p className="text-red-500 text-[10px] mt-1">⚠️ {errors.ancho}</p>}
                        </div>

                        <div className="form-input flex flex-col">
                          <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Largo:</label>
                          <input
                            ref={el => { fieldRefs.current.largo = el; }}
                            value={formData.dimensiones.largo}
                            onChange={handleDimensionChange}
                            name="largo"
                            type="number"
                            placeholder="Ej: 120"
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none dark:bg-slate-900 dark:text-white dark:border-gray-700 ${
                              errors.largo ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-teal-500"
                            }`}
                          />
                          {errors.largo && <p className="text-red-500 text-[10px] mt-1">⚠️ {errors.largo}</p>}
                        </div>
                      </div>
                    </div>

                    {/* Especificaciones */}
                    <div ref={el => { fieldRefs.current.especificaciones = el; }} className={`card border p-4 ${errors.especificaciones ? "border-red-500" : ""}`}>
                      <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-3">🛠️ Especificaciones Técnicas</h4>
                      
                      {/* Entradas Clave-Valor */}
                      <div className="flex flex-col sm:flex-row gap-3 mb-4 items-end bg-white dark:bg-slate-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex-1 flex flex-col gap-1">
                          <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Característica:</label>
                          <input
                            type="text"
                            value={specKey}
                            onChange={(e) => setSpecKey(e.target.value)}
                            placeholder="Ej: Producción, Peso, Voltaje"
                            className="w-full border border-gray-300 dark:border-gray-700 dark:bg-slate-900 dark:text-white rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        <div className="flex-1 flex flex-col gap-1">
                          <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Valor / Detalle:</label>
                          <input
                            type="text"
                            value={specValue}
                            onChange={(e) => setSpecValue(e.target.value)}
                            placeholder="Ej: 50 bolsas/min, 220V AC"
                            className="w-full border border-gray-300 dark:border-gray-700 dark:bg-slate-900 dark:text-white rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={addNewSpecification}
                          className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition h-10 w-full sm:w-auto cursor-pointer"
                        >
                          + Añadir
                        </button>
                      </div>

                      {/* Lista de Especificaciones */}
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {formData.especificaciones.map((espec, index) => {
                          const separatorIndex = espec.indexOf(':');
                          const k = separatorIndex !== -1 ? espec.substring(0, separatorIndex).trim() : espec;
                          const v = separatorIndex !== -1 ? espec.substring(separatorIndex + 1).trim() : '';

                          return (
                            <div key={index} className="flex items-center gap-3 bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-gray-150 dark:border-gray-700">
                              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 min-w-[120px]">{k}</span>
                              <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">{v}</span>
                              <button
                                type="button"
                                onClick={() => eliminarEspecificacion(index)}
                                className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          );
                        })}

                        {formData.especificaciones.length === 0 && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 italic text-center py-4 bg-white dark:bg-slate-800/40 rounded-lg">
                            Ninguna especificación añadida. Por favor, añada al menos una.
                          </p>
                        )}
                      </div>
                      {errors.especificaciones && <p className="text-red-500 text-xs mt-3">⚠️ {errors.especificaciones}</p>}
                    </div>
                  </div>
                )}

                {/* 4. PERSONALIZACIÓN UI */}
                {activeTab === "personalizacion" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white border-b pb-2">🎨 Personalización Visual</h3>
                    
                    <div className="form-input flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Título Visual del Hero:</label>
                      <input
                        ref={el => { fieldRefs.current.titulo = el; }}
                        value={formData.titulo}
                        onChange={handleChange}
                        type="text"
                        name="titulo"
                        placeholder="Ej: SELLADORA CONTINUA DE BOLSAS"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none dark:bg-slate-900 dark:text-white dark:border-gray-700 ${
                          errors.titulo ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-teal-500"
                        }`}
                      />
                      <p className="text-[10px] text-yellow-600 dark:text-yellow-400">
                        ⚠️ Nota: La segunda palabra en adelante se pintará con el color personalizado seleccionado.
                      </p>
                      {errors.titulo && <p className="text-red-500 text-xs mt-1">⚠️ {errors.titulo}</p>}
                    </div>

                    <div className="rounded-2xl border border-slate-700/30 bg-gradient-to-br from-slate-950 via-[#081829] to-[#003d56] p-5 shadow-xl text-white">
                      <h4 className="text-sm font-bold text-cyan-400 mb-2">Editor de Estilo de Título</h4>
                      
                      {/* Vista Previa */}
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-300">Vista previa en tiempo real</span>
                        </div>
                        <span
                          className="block leading-tight uppercase font-montserrat"
                          style={{
                            fontSize: `${Number(formData.etiqueta.titulo_detalle_producto_size || 24)}px`,
                            fontWeight: formData.etiqueta.titulo_detalle_producto_style === "negrita_cursiva" || formData.etiqueta.titulo_detalle_producto_style === "negrita" ? 800 : 600,
                            fontStyle: formData.etiqueta.titulo_detalle_producto_style === "cursiva" || formData.etiqueta.titulo_detalle_producto_style === "negrita_cursiva" ? "italic" : "normal",
                            textDecoration: formData.etiqueta.titulo_detalle_producto_style === "subrayado" ? "underline" : "none",
                            textDecorationColor: formData.etiqueta.titulo_detalle_producto_style === "subrayado" ? "white" : "transparent",
                            textDecorationThickness: "2px",
                            textUnderlineOffset: "4px"
                          }}
                        >
                          {(() => {
                            const titleParts = (formData.titulo || "Título Producto").trim().split(/\s+/).filter(Boolean);
                            const firstWord = titleParts[0] || "Título";
                            const restWords = titleParts.slice(1).join(" ");
                            return (
                              <>
                                <span className="block text-white">{firstWord}</span>
                                {restWords && (
                                  <span className="block" style={{ color: formData.etiqueta.titulo_detalle_producto_color || "#2DCCFF" }}>
                                    {restWords}
                                  </span>
                                )}
                              </>
                            );
                          })()}
                        </span>
                      </div>

                      {/* Controles de Configuración */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">Tamaño</label>
                          <select
                            value={formData.etiqueta.titulo_detalle_producto_size || "80"}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              etiqueta: { ...prev.etiqueta, titulo_detalle_producto_size: e.target.value }
                            }))}
                            className="w-full rounded-lg border border-white/20 bg-slate-900 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                          >
                            <option value="20">Pequeño</option>
                            <option value="80">Mediano</option>
                            <option value="130">Grande</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">Color Destacado</label>
                          <input
                            type="color"
                            value={formData.etiqueta.titulo_detalle_producto_color}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              etiqueta: { ...prev.etiqueta, titulo_detalle_producto_color: e.target.value }
                            }))}
                            className="cursor-pointer h-10 w-full rounded-lg border border-white/20 bg-slate-900 p-1"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">Estilos</label>
                          <div className="grid grid-cols-2 gap-1.5">
                            {[
                              { value: "normal", label: "Normal" },
                              { value: "negrita", label: "Negrita" },
                              { value: "cursiva", label: "Cursiva" },
                              { value: "negrita_cursiva", label: "Negrita + Cursiva" },
                              { value: "subrayado", label: "Subrayado" }
                            ].map(opt => {
                              const active = formData.etiqueta.titulo_detalle_producto_style === opt.value;
                              return (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() => setFormData(prev => ({
                                    ...prev,
                                    etiqueta: { ...prev.etiqueta, titulo_detalle_producto_style: opt.value }
                                  }))}
                                  className={`rounded px-2.5 py-1.5 text-xs font-semibold transition ${
                                    active
                                      ? "bg-teal-500 text-white shadow-md"
                                      : "bg-slate-800 text-gray-300 hover:bg-slate-700"
                                  }`}
                                >
                                  {opt.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. GALERÍA DE IMÁGENES */}
                {activeTab === "galeria" && (
                  <div className="space-y-6">
                    <div className="border-b pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white">📸 Galería del Producto</h3>
                      <span className="text-xs text-red-500 font-semibold">⚠️ Mínimo 4 imágenes obligatorias</span>
                    </div>

                    <div ref={el => { fieldRefs.current.gallery = el; }}>
                      {errors.gallery && <p className="bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 p-3 rounded-lg text-sm border border-red-200">⚠️ {errors.gallery}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {formData.imagenes.map((img, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-slate-900/40 border border-gray-200 dark:border-gray-700 p-4 rounded-2xl flex flex-col gap-3">
                          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Imagen {index + 1} {index < 4 ? "*" : "(Opcional)"}</span>
                          
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Titulo:</label>
                            <input
                              ref={el => { fieldRefs.current[`titulo_${index}`] = el; }}
                              type="text"
                              value={img.imageTitle}
                              onChange={(e) => handleImagesTituloChange(e, index)}
                              placeholder="Ej: Selladora industrial de bolsas de café"
                              className={`w-full px-3 py-1.5 border rounded-lg text-sm outline-none dark:bg-slate-950 dark:text-white dark:border-gray-700 ${
                                errors[`titulo_${index}`] ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-teal-500"
                              }`}
                            />
                            {errors[`titulo_${index}`] && <p className="text-red-500 text-[10px]">⚠️ {errors[`titulo_${index}`]}</p>}
                          </div>

                          <div className="border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 rounded-xl p-4 flex flex-col items-center justify-center min-h-[140px] relative overflow-hidden group">
                            {img.url_imagen ? (
                              <div className="w-full flex flex-col items-center gap-3">
                                <img
                                  src={getImagePreview(img.url_imagen)}
                                  alt={`Previa ${index + 1}`}
                                  className="h-28 object-contain rounded"
                                />
                                <label className="text-xs text-teal-600 hover:text-teal-800 underline font-bold cursor-pointer transition">
                                  Reemplazar archivo
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImagesChange(e, index)}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-2 text-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Subir archivo (WEBP recomendado)</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleImagesChange(e, index)}
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Texto SEO Alternativo:</label>
                            <input
                              ref={el => { fieldRefs.current[`seo_${index}`] = el; }}
                              type="text"
                              value={img.texto_alt_SEO}
                              onChange={(e) => handleImagesTextoSEOChange(e, index)}
                              placeholder="Ej: Selladora industrial de bolsas de café"
                              className={`w-full px-3 py-1.5 border rounded-lg text-sm outline-none dark:bg-slate-950 dark:text-white dark:border-gray-700 ${
                                errors[`seo_${index}`] ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-teal-500"
                              }`}
                            />
                            {errors[`seo_${index}`] && <p className="text-red-500 text-[10px]">⚠️ {errors[`seo_${index}`]}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. SEO Y METADATOS */}
                {activeTab === "seo" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white border-b pb-2">🔍 SEO y Metadatos de Búsqueda</h3>
                    
                    <div className="form-input flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Meta Título (SEO):</label>
                      <input
                        ref={el => { fieldRefs.current.meta_titulo = el; }}
                        type="text"
                        name="meta_titulo"
                        value={formData.etiqueta.meta_titulo}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            etiqueta: { ...prev.etiqueta, meta_titulo: e.target.value }
                          }));
                          if (errors.meta_titulo) {
                            setErrors(prev => {
                              const next = { ...prev };
                              delete next.meta_titulo;
                              return next;
                            });
                          }
                        }}
                        maxLength={70}
                        placeholder="Ej: Selladoras de Bolsas al Vacío de Alta Calidad | Tami Maquinarias"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none dark:bg-slate-900 dark:text-white dark:border-gray-700 ${
                          errors.meta_titulo ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-teal-500"
                        }`}
                      />
                      <div className="flex justify-between items-center text-[10px] text-gray-400">
                        <span>Recomendado: 50-60 caracteres.</span>
                        <span className={formData.etiqueta.meta_titulo.length >= 10 && formData.etiqueta.meta_titulo.length <= 60 ? "text-green-500 font-bold" : "text-yellow-500"}>
                          {formData.etiqueta.meta_titulo.length} / 70 caracteres
                        </span>
                      </div>
                      {errors.meta_titulo && <p className="text-red-500 text-xs mt-1">⚠️ {errors.meta_titulo}</p>}
                    </div>

                    <div className="form-input flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Meta Descripción (SEO):</label>
                      <textarea
                        ref={el => { fieldRefs.current.meta_description = el; }}
                        name="meta_description"
                        rows={3}
                        value={formData.etiqueta.meta_descripcion}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            etiqueta: { ...prev.etiqueta, meta_descripcion: e.target.value }
                          }));
                          if (errors.meta_descripcion) {
                            setErrors(prev => {
                              const next = { ...prev };
                              delete next.meta_description;
                              return next;
                            });
                          }
                        }}
                        maxLength={200}
                        placeholder="Ej: Descubra nuestra línea de selladoras de bolsas industriales de alta calidad. Ideales para granos, snacks y productos secos. Cotizaciones rápidas online."
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none dark:bg-slate-900 dark:text-white dark:border-gray-700 ${
                          errors.meta_descripcion ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-teal-500"
                        }`}
                      />
                      <div className="flex justify-between items-center text-[10px] text-gray-400">
                        <span>Recomendado: 120-160 caracteres.</span>
                        <span className={formData.etiqueta.meta_descripcion.length >= 40 && formData.etiqueta.meta_descripcion.length <= 160 ? "text-green-500 font-bold" : "text-yellow-500"}>
                          {formData.etiqueta.meta_descripcion.length} / 200 caracteres
                        </span>
                      </div>
                      {errors.meta_descripcion && <p className="text-red-500 text-xs mt-1">⚠️ {errors.meta_descripcion}</p>}
                    </div>

                    {/* Keywords en Tags */}
                    <div ref={el => { fieldRefs.current.keywords = el; }} className="bg-gray-50 dark:bg-slate-900/60 p-4 rounded-xl border border-gray-150 dark:border-gray-700">
                      <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-2">🏷️ Palabras Clave (Keywords):</h4>
                      
                      {/* Flex de etiquetas */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {formData.etiqueta.keywords.filter(k => k.trim() !== "").map((keyword, index) => (
                          <span key={index} className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 px-3 py-1 rounded-full text-xs font-semibold border border-teal-100">
                            {keyword}
                            <button
                              type="button"
                              onClick={() => handleRemoveKeyword(index)}
                              className="text-teal-500 hover:text-teal-700 font-bold ml-1 transition cursor-pointer"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>

                      {/* Entrada de palabra clave */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newKeyword}
                          onChange={(e) => setNewKeyword(e.target.value)}
                          placeholder="Ej: selladora, industrial, empaque"
                          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-slate-900 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                        />
                        <button
                          type="button"
                          onClick={handleAddKeyword}
                          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer"
                        >
                          Añadir
                        </button>
                      </div>
                      {errors.keywords && <p className="text-red-500 text-xs mt-2">⚠️ {errors.keywords}</p>}
                    </div>
                  </div>
                )}

                {/* 7. RELACIONADOS */}
                {activeTab === "relacionados" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white border-b pb-2">🔗 Productos Relacionados</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Seleccione otros productos relacionados para mostrarlos en el carrusel de la página de detalle.</p>

                    {productos.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto pr-1">
                        {productos.map(item => {
                          const isSelected = formData.relacionados.includes(item.id);
                          return (
                            <label key={item.id} className="cursor-pointer group flex flex-col items-center">
                              <input
                                type="checkbox"
                                className="peer absolute opacity-0"
                                value={item.id}
                                checked={isSelected}
                                onChange={(e) => handleRelacionadosChange(e, item.id)}
                              />
                              <div className="relative flex items-center justify-center bg-white dark:bg-slate-900 border rounded-xl overflow-hidden shadow-sm group-hover:shadow-md border-gray-200 dark:border-gray-700 p-2 transition-all w-full aspect-square">
                                {item.imagenes?.[0]?.url_imagen ? (
                                  <img
                                    src={getFullImageUrl(item.imagenes[0].url_imagen)}
                                    alt={item.nombre}
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <span className="text-xs text-gray-400 italic">Sin imagen</span>
                                )}
                                <div className={`absolute inset-0 bg-teal-600/10 flex items-center justify-center transition-all ${
                                  isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-30"
                                }`}>
                                  <div className="bg-teal-600 text-white rounded-full p-1 shadow">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                  </div>
                                </div>
                              </div>
                              <p className="text-[10px] text-center mt-2 text-gray-600 dark:text-gray-400 truncate w-full px-1">{item.nombre}</p>
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-48 bg-gray-50 dark:bg-slate-900 border rounded-xl">
                        <span className="text-sm text-gray-500 animate-pulse">Cargando catálogo...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </form>

            {/* Pie de Página del Diálogo */}
            <div className="dialog-footer bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-gray-700 p-4 flex justify-between gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={closeModal}
                className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 text-sm font-semibold transition cursor-pointer"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={isLoading}
                onClick={handleSubmit}
                className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-2.5 rounded-lg text-sm font-semibold shadow-md flex items-center gap-2 transition disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <span>Guardar Producto</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default EditProduct;