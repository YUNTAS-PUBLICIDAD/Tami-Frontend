import { useState, useRef, useEffect, type FC } from "react";
import type { ProductPOST } from "../../../models/Product.ts";
import type Product from "../../../models/Product.ts";
import { IoMdCloseCircle } from "react-icons/io";
import { config, getApiUrl } from "../../../../config.ts";
import { getProducts } from "../../../hooks/admin/productos/productos.ts";
type Props = {
  onProductAdded?: () => void;
};

const AddProduct = ({ onProductAdded }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formPage, setFormPage] = useState(1);
  const [isExiting, setIsExiting] = useState(false);
  const [productos, setProductos] = useState<Product[]>([]);
  const [formData, setFormData] = useState<ProductPOST>({
    nombre: "",
    titulo: "",
    subtitulo: "",
    lema: "",
    descripcion: "",
    imagen_principal: null,
    stock: 100,
    precioProducto: 199.99,
    seccion: "Trabajo",
    especificaciones: {
      color: "",
      material: "",
    },
    dimensiones: {
      alto: "",
      largo: "",
      ancho: "",
    },
    imagenes: [
      {
        url_imagen: null,
      },
      {
        url_imagen: null,
      },
      {
        url_imagen: null,
      },
      {
        url_imagen: null,
      },
    ],
    relacionados: [],
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, imagen_principal: e.target.files[0] });
    }
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
      imagen_principal: null,
      stock: 100,
      precioProducto: 199.99,
      seccion: "Trabajo",
      especificaciones: {
        color: "",
        material: "",
      },
      dimensiones: {
        alto: "",
        largo: "",
        ancho: "",
      },
      imagenes: [
        {
          url_imagen: null,
        },
        {
          url_imagen: null,
        },
        {
          url_imagen: null,
        },
        {
          url_imagen: null,
        },
      ],
      relacionados: [],
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
      !formData.imagen_principal ||
      !formData.seccion ||
      !formData.especificaciones.color ||
      !formData.especificaciones.material ||
      !formData.dimensiones.alto ||
      !formData.dimensiones.largo ||
      !formData.dimensiones.ancho ||
      !formData.imagenes ||
      formData.imagenes.some((imagen) => !imagen.url_imagen) // Verifica si alguna imagen es null
    ) {
      alert("⚠️ Todos los campos son obligatorios.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();

      formDataToSend.append("nombre", formData.nombre);
      formDataToSend.append("titulo", formData.titulo);
      formDataToSend.append("subtitulo", formData.subtitulo);
      formDataToSend.append("lema", formData.lema);
      formDataToSend.append("stock", formData.stock.toString());
      formDataToSend.append("precio", formData.precioProducto.toString());
      formDataToSend.append("descripcion", formData.descripcion);
      formDataToSend.append("lema", formData.lema);
      formDataToSend.append("mensaje_correo", "");
      formDataToSend.append("seccion", formData.seccion);
      Object.entries(formData.especificaciones).forEach(([key, value]) => {
        formDataToSend.append(`especificaciones[${key}]`, value);
      });
      formDataToSend.append(
        "dimensiones[alto]",
        formData.dimensiones.alto + "cm"
      );
      formDataToSend.append(
        "dimensiones[largo]",
        formData.dimensiones.largo + "cm"
      );
      formDataToSend.append(
        "dimensiones[ancho]",
        formData.dimensiones.ancho + "cm"
      );
      formData.imagenes.forEach((item, index) => {
        if (item.url_imagen) {
          formDataToSend.append(
            `imagenes[${index}][url_imagen]`,
            item.url_imagen
          );
        }
      });
      formDataToSend.append("imagen_principal", formData.imagen_principal); // Subir imagen como archivo
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
          },
        }
      );

      const data = await response.json();
      console.log("Respuesta del servidor:", data);

      if (response.ok) {
        alert("✅ Producto añadido exitosamente");
        closeModal(); // Cerrar modal
        setIsLoading(false); // Cambia el estado de carga a falso
        onProductAdded?.(); // Actualiza los productos
      } else {
        alert(`❌ Error: ${data.message}`);
        setIsLoading(false); // Cambia el estado de carga a falso
      }
    } catch (error) {
      console.error("Error al enviar los datos:", error);
      alert(`❌ Error: ${error}`);
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
      <button onClick={openModal} className="flex items-center gap-2 bg-white text-teal-600 hover:bg-teal-50 transition-all duration-300 px-5 py-3 rounded-full text-sm font-bold shadow-md hover:shadow-lg">
        Agregar Producto
      </button>
      {showModal && (
        <div className="h-screen w-screen bg-black/75 absolute top-0 left-0 z-50 flex justify-center items-center">
          <button
            className="absolute top-5 right-5 text-red-200 hover:text-red-600 transition-all duration-300 hover:cursor-pointer text-4xl"
            onClick={() => closeModal()}
          >
            <IoMdCloseCircle />
          </button>
          <div
            ref={formContainerRef} // Asigna la referencia al contenedor
            className={`bg-teal-700 w-1/2 h-10/12 rounded-xl p-10 relative transition-all duration-500 ${
              formPage !== 1 ? "overflow-hidden" : "overflow-y-scroll"
            }`}
          >
            <h4 className="text-2xl text-center mb-5 font-bold text-white">
              Agregar Producto
            </h4>
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
                <div className="form-input">
                  <label>Nombre:</label>
                  <input
                    required
                    value={formData.nombre}
                    onChange={handleChange}
                    type="text"
                    name="nombre"
                    placeholder="Nombre del producto..."
                  />
                </div>
                <div className="form-input">
                  <label>Descripción:</label>
                  <textarea
                    required
                    value={formData.descripcion}
                    onChange={handleChange}
                    name="descripcion"
                    placeholder="Descripción del producto..."
                  />
                </div>
                <div className="form-input">
                  <label>Título:</label>
                  <input
                    required
                    value={formData.titulo}
                    onChange={handleChange}
                    type="text"
                    name="titulo"
                    placeholder="Título..."
                  />
                </div>
                <div className="form-input">
                  <label>Subtitulo:</label>
                  <input
                    required
                    value={formData.subtitulo}
                    onChange={handleChange}
                    type="text"
                    name="subtitulo"
                    placeholder="Subtitulo..."
                  />
                </div>
                <div className="form-input">
                  <label>Lema:</label>
                  <input
                    required
                    value={formData.lema}
                    onChange={handleChange}
                    type="text"
                    name="lema"
                    placeholder="Lema..."
                  />
                </div>
                <div className="form-input">
                  <label>Imagen Principal del Producto:</label>
                  <input
                    required
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleFileChange}
                    type="file"
                    name="imagen_principal"
                  />
                </div>
                <div className="form-input">
                  <label>Sección del Producto:</label>
                  <select
                    required
                    value={formData.seccion}
                    onChange={handleChange}
                    name="seccion"
                  >
                    <option value="Trabajo">Trabajo</option>
                    <option value="Decoración">Decoración</option>
                    <option value="Negocio">Negocio</option>
                  </select>
                </div>
                <div className="group-form">
                  {Object.entries(formData.especificaciones).map(([key, value]) => (
                      <div className="form-input" key={key}>
                        <label>{key}:</label>
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
                        />
                      </div>
                  ))}
                  <button
                      type="button"
                      onClick={addNewSpecification}
                      className="admin-act-btn my-5"
                  >
                    Añadir Especificación
                  </button>
                </div>
                <div className="group-form">
                  <div className="form-input">
                    <label>Alto:</label>
                    <input
                      required
                      value={formData.dimensiones.alto}
                      onChange={(e) => handleNestedChange(e, "dimensiones")}
                      name="alto"
                      type="number"
                      placeholder="cm"
                    />
                  </div>
                  <div className="form-input">
                    <label>Ancho</label>
                    <input
                      required
                      value={formData.dimensiones.ancho}
                      onChange={(e) => handleNestedChange(e, "dimensiones")}
                      name="ancho"
                      type="number"
                      placeholder="cm"
                    />
                  </div>
                  <div className="form-input">
                    <label>Largo</label>
                    <input
                      required
                      value={formData.dimensiones.largo}
                      onChange={(e) => handleNestedChange(e, "dimensiones")}
                      name="largo"
                      type="number"
                      placeholder="cm"
                    />
                  </div>
                </div>
                <button
                  onClick={goNextForm}
                  className="admin-act-btn w-full mb-6"
                  type="button"
                >
                  Siguiente
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
                {formData.imagenes.map((_, index) => (
                  <div key={index} className="form-input">
                    <label>Imagen {index + 1}:</label>
                    <input
                      required
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImagesChange(e, index)}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={goNextForm}
                  className="admin-act-btn w-full"
                >
                  Siguiente
                </button>
                <button
                  onClick={goBackForm}
                  className="neutral-btn w-full mb-6"
                  type="button"
                >
                  Volver
                </button>
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
                <div className="form-input">
                  <label>Productos Relacionados:</label>
                  {productos.length > 0 ? (
                    <div className="grid grid-cols-3 gap-4 auto-rows-auto overflow-y-scroll h-72 p-2">
                      {productos.map((item) => (
                        <div
                          key={item.id}
                          className="w-full h-full flex items-center justify-center gap-2"
                        >
                          <label className="flex flex-col text-white items-center gap-2">
                            <input
                              type="checkbox"
                              className="peer hidden"
                              value={item.id}
                              onChange={(e) =>
                                handleRelacionadosChange(e, item.id)
                              }
                            />
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-36 h-36 rounded-full border-2 border-teal-700 peer-checked:border-slate-900 object-cover"
                            />
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="col-span-3 text-center py-4 text-gray-500">
                      Cargando productos...
                    </p>
                  )}
                </div>
                <button
                  onClick={goBackForm}
                  className="neutral-btn w-full mb-6"
                  type="button"
                >
                  Volver
                </button>
                <button
                  disabled={isLoading}
                  type="submit"
                  className={`admin-act-btn w-full transition ${
                    isLoading
                      ? "disabled:opacity-75 disabled:hover:cursor-not-allowed disabled:cursor-not-allowed disabled:bg-teal-950"
                      : ""
                  } `}
                >
                  {isLoading ? (
                    <span className="w-full text-center flex justify-center items-center gap-2">
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
                      Guardando...
                    </span>
                  ) : (
                    "Guardar Producto"
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

export default AddProduct;