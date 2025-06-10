import { useState, useRef, useEffect, type FC } from "react";
import type { ProductApiPOST, ProductFormularioPOST } from "../../../models/Product.ts";
import type Product from "../../../models/Product.ts";
import { IoMdCloseCircle } from "react-icons/io";
import { config, getApiUrl } from "../../../../config.ts";
import { getProducts } from "../../../hooks/admin/productos/productos.ts";
import Swal from "sweetalert2";
type Props = {
  onProductAdded?: () => void;
};

const AddProduct = ({ onProductAdded }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formPage, setFormPage] = useState(1);
  const [isExiting, setIsExiting] = useState(false);
  const [productos, setProductos] = useState<Product[]>([]);
  const [formData, setFormData] = useState<ProductFormularioPOST>({
    nombre: "",
    titulo: "",
    subtitulo: "",
    lema: "",
    descripcion: "",
    stock: 100,
    precio: 199.99,
    seccion: "Negocio",
    especificaciones: {
      color: "",
      material: "",
    },
    relacionados: [],
    imagenes: [
      {
        url_imagen: null,
        texto_alt:"",
      },
      {
        url_imagen: null,
        texto_alt:"",
      },
      {
        url_imagen: null,
        texto_alt:"",
      },
      {
        url_imagen: null,
        texto_alt:"",
      },
    ],
    textos_alt: [],
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNestedChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    group: "dimensiones" | "especificaciones"
  ) => {
    setFormData({
      ...formData,
      [group]: {
        ...formData[group],
        [e.target.name]: e.target.value,
      },
    });
  };

  const handleRelacionadosChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    id: number
  ) => {
    if (e.target.checked) {
      // Agregar el ID al array de relacionados
      setFormData({
        ...formData,
        relacionados: [...formData.relacionados, id],
      });
    } else {
      // Eliminar el ID del array de relacionados
      setFormData({
        ...formData,
        relacionados: formData.relacionados.filter(
          (relacionado) => relacionado !== id
        ),
      });
    }
  };

  const handleImagesChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.target.files && e.target.files[0]) {
      const nuevoArray = [...formData.imagenes];

      // Agregar el archivo y su parrafo
      nuevoArray[index] = {
        ...nuevoArray[index],
        url_imagen: e.target.files[0],
      };

      setFormData({ ...formData, imagenes: nuevoArray });
    }
  };
  const handleImagesTextoSEOChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.target.value) {
      const nuevoArray = [...formData.imagenes];

      // Agregar el archivo y su parrafo
      nuevoArray[index] = {
        ...nuevoArray[index],
        texto_alt: e.target.value,
      };

      setFormData({ ...formData, imagenes: nuevoArray });
    }
  };

  // Referencia al contenedor del formulario
  const formContainerRef = useRef<HTMLDivElement>(null);

  function openModal() {
    setShowModal(true);
  }

  function closeModal() {
    setFormPage(1); // Resetea el número de página
    setShowModal(false);
    setFormData({
      nombre: "",
      titulo: "",
      subtitulo: "",
      lema: "",
      descripcion: "",
      stock: 100,
      precio: 199.99,
      seccion: "Negocio",
      especificaciones: {
        color: "",
        material: "",
      },
      relacionados: [],
      imagenes: [
      {
        url_imagen: null,
        texto_alt:"",
      },
      {
        url_imagen: null,
        texto_alt:"",
      },
      {
        url_imagen: null,
        texto_alt:"",
      },
      {
        url_imagen: null,
        texto_alt:"",
      },
    ],
      textos_alt: [],
    });
  }

  function goNextForm() {
    setIsExiting(true); // Inicia la animación de salida
    setTimeout(() => {
      setFormPage((prevPage) => prevPage + 1); // Incrementa el número de página
      setIsExiting(false); // Resetea el estado de salida
      scrollToTop(); // Desplaza el scroll hacia arriba
    }, 500); // Duración de la animación (en milisegundos)
  }

  function goBackForm() {
    setIsExiting(true); // Inicia la animación de salida
    setTimeout(() => {
      setFormPage((prevPage) => prevPage - 1); // Decrementa el número de página
      setIsExiting(false); // Resetea el estado de salida
      scrollToTop(); // Desplaza el scroll hacia arriba
    }, 500); // Duración de la animación (en milisegundos)
  }

  function scrollToTop() {
    if (formContainerRef.current) {
      formContainerRef.current.scrollTo({
        top: 0,
        behavior: "smooth", // Desplazamiento suave
      });
    }
  }

  const addNewSpecification = () => {
    const newKey = prompt("Nombre de la nueva especificación:");
    if (newKey && !formData.especificaciones[newKey]) {
      setFormData((prev) => ({
        ...prev,
        especificaciones: {
          ...prev.especificaciones,
          [newKey]: "",
        },
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // Cambia el estado de carga a verdadero
    if (
      !formData.nombre ||
      !formData.titulo ||
      !formData.subtitulo ||
      !formData.lema ||
      !formData.descripcion ||
      !formData.seccion ||
      !formData.especificaciones.color ||
      !formData.especificaciones.material ||
      !formData.imagenes ||
      formData.imagenes.some((imagen) => !imagen.url_imagen) // Verifica si alguna imagen es null
    ) {
      Swal.fire({
        icon: "warning",
        title: "Campos obligatorios",
        text: "⚠️ Todos los campos son obligatorios.",
      });
      setIsLoading(false);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();

      formDataToSend.append("nombre", formData.nombre);
      formDataToSend.append("titulo", formData.titulo);
      formDataToSend.append("subtitulo", formData.subtitulo);
      formDataToSend.append("lema", formData.lema);
      formDataToSend.append("link", formData.lema);
      formDataToSend.append("descripcion", formData.descripcion);
      formDataToSend.append("stock", formData.stock.toString());
      formDataToSend.append("precio", formData.precio.toString());
      formDataToSend.append("seccion", formData.seccion);
      formDataToSend.append("especificaciones", JSON.stringify(formData.especificaciones));

      formData.imagenes.forEach((imagen, index) => {
        if (imagen.url_imagen) {
          formDataToSend.append(`imagenes[${index}]`, imagen.url_imagen);
        }
      });

      formData.imagenes.forEach((imagen, index) => {
        const altText = imagen.texto_alt.trim() || "Texto SEO para imagen";

        if (imagen.url_imagen) {
          formDataToSend.append(`imagenes[${index}]`, imagen.url_imagen);
          formDataToSend.append(`textos_alt[${index}]`, altText);
        }
      });

      formData.relacionados.forEach((item, index) => {
        formDataToSend.append(`relacionados[${index}]`, item.toString());
      });

      const response = await fetch(
        getApiUrl(config.endpoints.productos.create),
        {
          method: "POST",
          body: formDataToSend, // FormData
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json"
          },
        }
      );

      const data = await response.json();
      console.log("Respuesta del servidor:", data);

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Producto añadido exitosamente",
          showConfirmButton: false,
          timer: 1500
        });
        closeModal(); // Cerrar modal
        setIsLoading(false); // Cambia el estado de carga a falso
        onProductAdded?.(); // Actualiza los productos
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message,
        });
        setIsLoading(false); // Cambia el estado de carga a falso
      }
    } catch (error) {
      console.error("Error al enviar los datos:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `❌ Error: ${error}`,
      });
      setIsLoading(false); // Cambia el estado de carga a falso
    }
  };

  useEffect(() => {
    if (showModal) {
      const fetchProductos = async () => {
        try {
          const data = await getProducts();
          setProductos(data); // Almacena los productos en el estado
        } catch (error) {
          console.error("Error al obtener productos:", error);
        }
      };

      fetchProductos();
    }
  }, [showModal]);

  return (
      <>
        <button onClick={openModal} className="flex items-center gap-2 bg-teal-600 text-white hover:bg-teal-700 transition-all duration-300 px-5 py-3 rounded-lg text-sm font-bold shadow-lg hover:shadow-xl">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Agregar Producto
        </button>
        {showModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4 md:p-6 lg:p-8 overflow-y-auto">
              <button
                  className="absolute top-4 right-4 md:top-6 md:right-6 text-white hover:text-red-400 transition-all duration-300 hover:cursor-pointer text-3xl md:text-4xl"
                  onClick={() => closeModal()}
                  aria-label="Cerrar"
              >
                <IoMdCloseCircle />
              </button>
              <div
                  ref={formContainerRef}
                  className="bg-white w-full max-w-md md:max-w-2xl lg:max-w-4xl rounded-2xl shadow-2xl p-6 md:p-8 relative transition-all duration-500 overflow-y-auto max-h-[90vh] min-h-[70vh] md:min-h-[80vh]"
              >
                <div className="bg-teal-600 -mx-6 md:-mx-8 -mt-6 md:-mt-8 mb-6 p-4 md:p-6 rounded-t-2xl">
                  <h4 className="text-xl md:text-2xl text-center font-bold text-white">
                    Agregar Producto
                  </h4>
                </div>
                <form onSubmit={handleSubmit} className="relative">
                  {/* Primera página del formulario */}
                  <div
                      className={`absolute w-full transition-all duration-500 ${
                          isExiting && formPage === 1
                              ? "-translate-x-full opacity-0 pointer-events-none"
                              : ""
                      } ${
                          !isExiting && formPage === 1
                              ? "translate-x-0 opacity-100 pointer-events-auto"
                              : "opacity-0 pointer-events-none"
                      }`}
                  >
                    <div className="space-y-4">
                      <div className="form-input">
                        <label className="block !text-gray-700 text-sm font-medium mb-1">Nombre:</label>
                        <input
                            required
                            value={formData.nombre}
                            onChange={handleChange}
                            type="text"
                            name="nombre"
                            placeholder="Nombre del producto..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                        />
                      </div>
                      <div className="form-input">
                        <label className="block !text-gray-700 text-sm font-medium mb-1">Descripción:</label>
                        <textarea
                            required
                            value={formData.descripcion}
                            onChange={handleChange}
                            name="descripcion"
                            placeholder="Descripción del producto..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition min-h-[100px]"
                        />
                      </div>
                      <div className="form-input">
                        <label className="block !text-gray-700 text-sm font-medium mb-1">Título:</label>
                        <input
                            required
                            value={formData.titulo}
                            onChange={handleChange}
                            type="text"
                            name="titulo"
                            placeholder="Título..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                        />
                      </div>
                      <div className="form-input">
                        <label className="block !text-gray-700 text-sm font-medium mb-1">Subtitulo:</label>
                        <input
                            required
                            value={formData.subtitulo}
                            onChange={handleChange}
                            type="text"
                            name="subtitulo"
                            placeholder="Subtitulo..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                        />
                      </div>
                      <div className="form-input">
                        <label className="block !text-gray-700 text-sm font-medium mb-1">Lema:</label>
                        <input
                            required
                            value={formData.lema}
                            onChange={handleChange}
                            type="text"
                            name="lema"
                            placeholder="Lema..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                        />
                      </div>
                      {/*<div className="form-input">*/}
                      {/*  <label className="block !text-gray-700 text-sm font-medium mb-1">Imagen Principal del Producto:</label>*/}
                      {/*  <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">*/}
                      {/*    <input*/}
                      {/*        required*/}
                      {/*        accept="image/png, image/jpeg, image/jpg"*/}
                      {/*        type="file"*/}
                      {/*        name="imagen_principal"*/}
                      {/*        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"*/}
                      {/*    />*/}
                      {/*  </div>*/}
                      {/*</div>*/}
                      <div className="form-input">
                        <label className="block !text-gray-700 text-sm font-medium mb-1">Sección del Producto:</label>
                        <select
                            required
                            value={formData.seccion}
                            onChange={handleChange}
                            name="seccion"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition appearance-none bg-white"
                        >
                          <option value="Negocio">Negocio</option>
                          <option value="Decoración">Decoración</option>
                          <option value="Maquinaria">Maquinaria</option>
                        </select>
                      </div>

                      {/* Especificaciones */}
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <h5 className="font-medium !text-gray-700 mb-3">Especificaciones</h5>
                        <div className="space-y-3">
                          {Object.entries(formData.especificaciones).map(([key, value]) => (
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2" key={key}>
                                <label className="text-sm text-gray-600 sm:w-1/4">{key}:</label>
                                <input
                                    type="text"
                                    name={key}
                                    value={value}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                          ...prev,
                                          especificaciones: {
                                            ...prev.especificaciones,
                                            [key]: e.target.value,
                                          },
                                        }))
                                    }
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition text-sm"
                                />
                              </div>
                          ))}
                        </div>
                        <button
                            type="button"
                            onClick={addNewSpecification}
                            className="mt-3 inline-flex items-center gap-1 bg-teal-50 hover:bg-teal-100 text-teal-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Añadir Especificación
                        </button>
                      </div>

                      {/* Dimensiones */}
                      {/*<div className="bg-gray-50 p-4 rounded-lg border border-gray-100">*/}
                      {/*  <h5 className="font-medium !text-gray-700 mb-3">Dimensiones</h5>*/}
                      {/*  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">*/}
                      {/*    <div className="form-input">*/}
                      {/*      <label className="block text-sm text-gray-600 mb-1">Alto:</label>*/}
                      {/*      <div className="relative">*/}
                      {/*        <input*/}
                      {/*            required*/}
                      {/*            value={formData.dimensiones.alto}*/}
                      {/*            onChange={(e) => handleNestedChange(e, "dimensiones")}*/}
                      {/*            name="alto"*/}
                      {/*            type="number"*/}
                      {/*            placeholder="0"*/}
                      {/*            className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"*/}
                      {/*        />*/}
                      {/*        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">cm</span>*/}
                      {/*      </div>*/}
                      {/*    </div>*/}
                      {/*    <div className="form-input">*/}
                      {/*      <label className="block text-sm text-gray-600 mb-1">Ancho:</label>*/}
                      {/*      <div className="relative">*/}
                      {/*        <input*/}
                      {/*            required*/}
                      {/*            value={formData.dimensiones.ancho}*/}
                      {/*            onChange={(e) => handleNestedChange(e, "dimensiones")}*/}
                      {/*            name="ancho"*/}
                      {/*            type="number"*/}
                      {/*            placeholder="0"*/}
                      {/*            className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"*/}
                      {/*        />*/}
                      {/*        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">cm</span>*/}
                      {/*      </div>*/}
                      {/*    </div>*/}
                      {/*    <div className="form-input">*/}
                      {/*      <label className="block text-sm text-gray-600 mb-1">Largo:</label>*/}
                      {/*      <div className="relative">*/}
                      {/*        <input*/}
                      {/*            required*/}
                      {/*            value={formData.dimensiones.largo}*/}
                      {/*            onChange={(e) => handleNestedChange(e, "dimensiones")}*/}
                      {/*            name="largo"*/}
                      {/*            type="number"*/}
                      {/*            placeholder="0"*/}
                      {/*            className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"*/}
                      {/*        />*/}
                      {/*        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">cm</span>*/}
                      {/*      </div>*/}
                      {/*    </div>*/}
                      {/*  </div>*/}
                      {/*</div>*/}
                    </div>
                    <button
                        onClick={goNextForm}
                        className="mt-6 mb-4 w-full bg-teal-600 hover:bg-teal-700 text-white py-3 px-6 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                        type="button"
                    >
                      Siguiente
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  {/* Segunda página del formulario */}
                  <div
                      className={`absolute w-full transition-all duration-500 ${
                          isExiting && formPage === 2
                              ? "-translate-x-full opacity-0 pointer-events-none"
                              : ""
                      } ${
                          !isExiting && formPage === 2
                              ? "translate-x-0 opacity-100 pointer-events-auto"
                              : "opacity-0 pointer-events-none"
                      }`}
                  >
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6">
                      <h5 className="font-medium !text-gray-700 mb-4">Galería de Imágenes</h5>
                      <div className="space-y-4">
                        {formData.imagenes.map((_, index) => (
                            <div key={index} className="form-input">
                              <label className="block !text-gray-700 text-sm font-medium mb-1">Imagen {index + 1}:</label>
                              <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-white">
                                <input
                                    required
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImagesChange(e, index)}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                                />
                              </div>
                              <label className="block !text-gray-700 text-sm font-medium mb-1">Texto SEO Imagen {index + 1}:</label>
                              <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-white">
                                <input
                                    required
                                    type="text"
                                    onChange={(e) => handleImagesTextoSEOChange(e, index)}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                                />
                              </div>
                            </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col-reverse sm:flex-row gap-3">
                      <button
                          onClick={goBackForm}
                          className="w-full sm:w-1/2 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-6 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2"
                          type="button"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Volver
                      </button>
                      <button
                          type="button"
                          onClick={goNextForm}
                          className="w-full sm:w-1/2 bg-teal-600 hover:bg-teal-700 text-white py-3 px-6 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        Siguiente
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Tercera página del form */}
                  <div
                      className={`absolute w-full transition-all duration-500 ${
                          isExiting && formPage === 3
                              ? "-translate-x-full opacity-0 pointer-events-none"
                              : ""
                      } ${
                          !isExiting && formPage === 3
                              ? "translate-x-0 opacity-100 pointer-events-auto"
                              : "opacity-0 pointer-events-none"
                      }`}
                  >
                    <div className="form-input mb-6">
                      <label className="block !text-gray-700 text-sm font-medium mb-3">Productos Relacionados:</label>
                      {productos.length > 0 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-64 overflow-y-auto p-2 bg-gray-50 rounded-lg border border-gray-100">
                            {productos.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex flex-col items-center gap-2"
                                >
                                  <label className="cursor-pointer group relative">
                                    <input
                                        type="checkbox"
                                        className="peer absolute opacity-0"
                                        value={item.id}
                                        onChange={(e) =>
                                            handleRelacionadosChange(e, item.id)
                                        }
                                    />
                                    <div className="relative">
                                      {item.imagenes?.[0]?.url_imagen ? (
                                          <img
                                              src={`https://apitami.tamimaquinarias.com${item.imagenes[0].url_imagen}`}
                                              alt={item.nombre}
                                              className={`w-24 h-24 md:w-28 md:h-28 object-cover rounded-xl border-2 transition-all duration-300 ${
                                                  formData.relacionados.includes(item.id)
                                                      ? 'border-teal-600'
                                                      : 'border-gray-200 group-hover:border-teal-400'
                                              }`}
                                          />
                                      ) : (
                                          <span className="text-sm text-gray-400 italic">Sin imagen</span>
                                      )}
                                      <div className="absolute inset-0 bg-teal-600/0 peer-checked:bg-teal-600/20 flex items-center justify-center rounded-xl transition-all duration-300">
                                        <svg
                                            className="w-8 h-8 text-white opacity-0 peer-checked:opacity-100 transition-all duration-300"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                          <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                      </div>
                                    </div>
                                    <p className="text-xs text-center mt-1 text-gray-600">{item.nombre}</p>
                                  </label>
                                </div>
                            ))}
                          </div>
                      ) : (
                          <div className="flex items-center justify-center h-40 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="text-center">
                              <div className="inline-block p-3 rounded-full bg-gray-100 mb-2">
                                <svg className="w-6 h-6 text-gray-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                </svg>
                              </div>
                              <p className="text-sm text-gray-500">Cargando productos...</p>
                            </div>
                          </div>
                      )}
                    </div>
                    <div className="flex flex-col-reverse sm:flex-row gap-3">
                      <button
                          onClick={goBackForm}
                          className="w-full sm:w-1/2 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-6 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2"
                          type="button"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Volver
                      </button>
                      <button
                          disabled={isLoading}
                          type="submit"
                          className={`w-full sm:w-1/2 bg-teal-600 hover:bg-teal-700 text-white py-3 px-6 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                              isLoading ? "opacity-75 cursor-not-allowed" : ""
                          }`}
                      >
                        {isLoading ? (
                            <>
                              <svg
                                  className="animate-spin h-5 w-5 text-white"
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
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                ></path>
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
                </form>
              </div>
            </div>
        )}
      </>
  );
};

export default AddProduct;