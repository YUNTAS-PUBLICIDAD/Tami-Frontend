import { useState, useRef, useEffect, type FC } from "react";
import { defaultValuesProduct, type ProductFormularioPOST } from "../../../models/Product.ts";
import React from "react";
import { config, getApiUrl } from "../../../../config.ts";
import { getProducts } from "../../../hooks/admin/productos/productos.ts";
import { FaEdit } from "react-icons/fa";
import type Product from "src/models/Product";
import { IoMdCloseCircle } from "react-icons/io";
import Swal from "sweetalert2";
import { slugify } from "../../../utils/slugify";


interface EditProductProps {
    product: Product;
    onProductUpdated: () => Promise<void> | void;
}

const EditProduct: React.FC<EditProductProps> = ({ product, onProductUpdated }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [formPage, setFormPage] = useState(1);
    const [isExiting, setIsExiting] = useState(false);
    const [productos, setProductos] = useState<Product[]>([]);
    const [nuevaEspecificacion, setNuevaEspecificacion] = useState("");

    const [formData, setFormData] = useState<ProductFormularioPOST>(defaultValuesProduct);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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
    };

    const handleSpecificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            especificaciones: {
                ...prev.especificaciones,
                [name]: value,
            },
        }));
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

    const agregarKeyword = () => {
        setFormData((prev) => ({
            ...prev,
            etiqueta: {
                ...prev.etiqueta,
                keywords: [...prev.etiqueta.keywords, ""],
            }
        }));
    };

    const handleKeywordsChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const nuevasKeywords = [...formData.etiqueta.keywords];
        nuevasKeywords[index] = e.target.value;
        setFormData(prev => ({
            ...prev,
            etiqueta: {
                ...prev.etiqueta,
                keywords: nuevasKeywords
            }
        }));
    };

    const eliminarKeyword = (index: number) => {
        setFormData(prev => ({
            ...prev,
            etiqueta: {
                ...prev.etiqueta,
                keywords: prev.etiqueta.keywords.filter((_, i) => i !== index)
            }
        }));
    };

    const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const nuevasImagenes = [...formData.imagenes];
        nuevasImagenes[index] = {
            ...nuevasImagenes[index],
            url_imagen: file, // Reemplaza imagen existente
        };

        setFormData((prev) => ({
            ...prev,
            imagenes: nuevasImagenes,
        }));
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
                texto_alt_SEO: e.target.value,
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
        setFormData(defaultValuesProduct);
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
        if (nuevaEspecificacion.trim()) {
            setFormData(prev => ({
                ...prev,
                especificaciones: [...prev.especificaciones, nuevaEspecificacion.trim()]
            }));
            setNuevaEspecificacion("");
        }
    };

    const eliminarEspecificacion = (index: number) => {
        setFormData(prev => ({
            ...prev,
            especificaciones: prev.especificaciones.filter((_, i) => i !== index)
        }));
    };

    const handleEspecificacionChange = (index: number, value: string) => {
        const nuevasEspecificaciones = [...formData.especificaciones];
        nuevasEspecificaciones[index] = value;
        setFormData(prev => ({
            ...prev,
            especificaciones: nuevasEspecificaciones
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Validación
        if (
            !formData.nombre ||
            !formData.titulo ||
            !formData.subtitulo ||
            !formData.descripcion ||
            !formData.seccion ||
            !formData.imagenes ||
            formData.imagenes.every((imagen) => !imagen.url_imagen)
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
            const nuevoLink = slugify(formData.titulo || formData.nombre);
            formDataToSend.append("link", nuevoLink);
            formDataToSend.append("descripcion", formData.descripcion);
            formDataToSend.append("stock", formData.stock.toString());
            formDataToSend.append("precio", formData.precio.toString());
            formDataToSend.append("seccion", formData.seccion);
            formDataToSend.append(
                "especificaciones",
                JSON.stringify(formData.especificaciones)
            );
            formDataToSend.append(
                "etiqueta[meta_titulo]",
                formData.etiqueta.meta_titulo
            );
            formDataToSend.append(
                "etiqueta[meta_descripcion]",
                formData.etiqueta.meta_descripcion
            );
            formDataToSend.append("keywords", JSON.stringify(formData.etiqueta.keywords));
            formDataToSend.append("dimensiones[alto]", formData.dimensiones.alto);
            formDataToSend.append("dimensiones[largo]", formData.dimensiones.largo);
            formDataToSend.append("dimensiones[ancho]", formData.dimensiones.ancho);

            // Manejo de imágenes: conservar existentes + añadir nuevas
            formData.imagenes.forEach((imagen, index) => {
                const altText = imagen.texto_alt_SEO.trim() || "Texto SEO para imagen";

                if (imagen.url_imagen instanceof File) {
                    // Nueva imagen subida
                    formDataToSend.append(`imagenes[${index}]`, imagen.url_imagen);
                    formDataToSend.append(`textos_alt[${index}]`, altText);
                } else if (typeof imagen.url_imagen === "string" && imagen.url_imagen) {
                    // Imagen existente (URL) → la mandamos también
                    formDataToSend.append(`imagenes_existentes[${index}]`, imagen.url_imagen);
                    formDataToSend.append(`textos_alt[${index}]`, altText);
                }
                // Si es null no se envía nada en ese índice
            });

            formData.relacionados.forEach((item, index) => {
                formDataToSend.append(`relacionados[${index}]`, item.toString());
            });

            // Agregar imagen popup y texto alt popup al FormData
            if (formData.imagen_popup) {
                formDataToSend.append('imagen_popup', formData.imagen_popup);
                formDataToSend.append('texto_alt_popup', formData.texto_alt_popup || '');
            }

            formDataToSend.append("_method", "PUT");

            const response = await fetch(
                getApiUrl(config.endpoints.productos.update(product.id)),
                {
                    method: "POST",
                    body: formDataToSend,
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                }
            );

            const data = await response.json();
            console.log("Respuesta del servidor:", data);

            if (response.ok) {
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
                    text: data.message,
                });
                setIsLoading(false);
            }
        } catch (error) {
            console.error("Error al enviar los datos:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: `❌ Error: ${error}`,
            });
            setIsLoading(false);
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

    useEffect(() => {
        if (showModal && product) {
            // Transformar imágenes existentes
            let imagenesTransformadas =
                product.imagenes?.map((img) => ({
                    url_imagen: `${config.apiUrl}${img.url_imagen}`,
                    texto_alt_SEO: img.texto_alt_SEO || "",
                })) || [];

            while (imagenesTransformadas.length < 5) {
                imagenesTransformadas.push({ url_imagen: "", texto_alt_SEO: "" });
            }

            const relacionadosIds =
                product.productos_relacionados?.map((rel) => (rel as { id: number }).id) || [];

            // lista de strings para transformar en Array
            const keywordsArray = product.etiqueta?.keywords.split(",").map(kw => kw.trim());

            setFormData({
                nombre: product.nombre,
                titulo: product.titulo,
                subtitulo: product.subtitulo,
                link: product.link,
                descripcion: product.descripcion,
                etiqueta: {
                    keywords: keywordsArray || [""],
                    meta_titulo: product.etiqueta?.meta_titulo || "",
                    meta_descripcion: product.etiqueta?.meta_descripcion || "",
                },
                stock: product.stock,
                precio: product.precio,
                seccion: product.seccion,
                especificaciones: Array.isArray(product.especificaciones)
                    ? product.especificaciones.map((e: any) => e.valor)
                    : [],
                relacionados: relacionadosIds,
                imagenes: imagenesTransformadas,
                textos_alt: product.imagenes?.map((img) => img.texto_alt_SEO) || [],
                dimensiones: {
                    largo: product.dimensiones?.largo || "",
                    alto: product.dimensiones?.alto || "",
                    ancho: product.dimensiones?.ancho || "",
                },
            });
        }
    }, [showModal, product]);


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
                    <button
                        className="absolute top-4 right-4 md:top-6 md:right-6 text-white hover:text-red-400 transition-all duration-300 hover:cursor-pointer text-3xl md:text-4xl"
                        onClick={() => closeModal()}
                        aria-label="Cerrar"
                    >
                        <IoMdCloseCircle />
                    </button>
                    <div
                        ref={formContainerRef}
                        className="dialog max-h-[90vh] min-h-[70vh] md:min-h-[80vh]"
                    >
                        <div className="dialog-header">
                            <h4 className="dialog-title">
                                Editar Producto
                            </h4>
                        </div>
                        <form onSubmit={handleSubmit} className="relative">
                            {/* Primera página del formulario */}
                            <div
                                className={`absolute w-full transition-all duration-500 ${isExiting && formPage === 1
                                    ? "-translate-x-full opacity-0 pointer-events-none"
                                    : ""
                                    } ${!isExiting && formPage === 1
                                        ? "translate-x-0 opacity-100 pointer-events-auto"
                                        : "opacity-0 pointer-events-none"
                                    }`}
                            >
                                <div className="space-y-4">
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
                                            className="min-h-[100px]"
                                        />
                                    </div>
                                    <div className="form-input">
                                        <label htmlFor="meta_titulo">
                                            Meta título <span className="text-gray-500">(recomendado: 50-60 caracteres)</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="meta_titulo"
                                            name="meta_titulo"
                                            value={formData.etiqueta.meta_titulo}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    etiqueta: {
                                                        ...prev.etiqueta,
                                                        meta_titulo: e.target.value,
                                                    },
                                                }))
                                            }
                                            maxLength={70}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            {formData.etiqueta.meta_titulo.length} / 70 caracteres
                                        </p>
                                    </div>

                                    <div className="form-input">
                                        <label htmlFor="meta_descripcion">
                                            Meta descripción <span className="text-gray-500">(recomendado: 40-160 caracteres)</span>
                                        </label>
                                        <textarea
                                            id="meta_descripcion"
                                            name="meta_descripcion"
                                            value={formData.etiqueta.meta_descripcion}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    etiqueta: {
                                                        ...prev.etiqueta,
                                                        meta_descripcion: e.target.value,
                                                    },
                                                }))
                                            }
                                            maxLength={200}
                                            rows={3}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            {formData.etiqueta.meta_descripcion.length} / 200 caracteres
                                        </p>
                                    </div>

                                    {/* keywords */}
                                    <div className="card">
                                        <h4 className="font-medium text-gray-700 dark:text-gray-400 mb-3">Keywords:</h4>
                                        {formData.etiqueta.keywords.map((k, index) => (
                                            <div className="form-input flex justify-between gap-2">
                                                <input type="text" id="keywords" value={k}
                                                    onChange={(e) => handleKeywordsChange(index, e)}
                                                />
                                                <button
                                                    type="button"
                                                    disabled={index === 0} onClick={() => eliminarKeyword(index)}
                                                    className="text-red-600 hover:cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}

                                        <button
                                            type="button"
                                            onClick={agregarKeyword}
                                            className="inline-flex items-center gap-1 bg-teal-50 hover:bg-teal-100 text-teal-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Añadir keyword
                                        </button>
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
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                                        />
                                    </div>
                                    <div className="form-input">
                                        <label>Subtitulo:</label>
                                        <input
                                            required
                                            value={formData.subtitulo ?? ""}
                                            onChange={handleChange}
                                            type="text"
                                            name="subtitulo"
                                            placeholder="Subtitulo..."
                                        />
                                    </div>
                                    {/*<div className="form-input">*/}
                                    {/*    <label className="block !text-gray-700 text-sm font-medium mb-1">Imagen Principal del Producto:</label>*/}
                                    {/*    <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">*/}
                                    {/*        <input*/}
                                    {/*            required*/}
                                    {/*            accept="image/png, image/jpeg, image/jpg"*/}
                                    {/*            type="file"*/}
                                    {/*            name="miniatura"*/}
                                    {/*            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"*/}
                                    {/*        />*/}
                                    {/*    </div>*/}
                                    {/*</div>*/}
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

                                    {/* Especificaciones */}
                                    <div className="card">
                                        <h5 className="font-medium text-gray-700 dark:text-gray-400 mb-3">Especificaciones</h5>
                                        <div className="flex items-center gap-2 form-input">
                                            <input
                                                type="text"
                                                value={nuevaEspecificacion}
                                                onChange={(e) => setNuevaEspecificacion(e.target.value)}
                                                placeholder="Nueva especificación..."
                                                className="flex-1"
                                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addNewSpecification())}
                                            />
                                            <button
                                                type="button"
                                                onClick={addNewSpecification}
                                                className="inline-flex items-center gap-1 bg-teal-50 hover:bg-teal-100 text-teal-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                                Añadir Especificación
                                            </button>
                                        </div>

                                        <div className="space-y-2">
                                            {formData.especificaciones.map((espec, index) => (
                                                <div key={index} className="flex items-center gap-2 form-input">
                                                    <input
                                                        type="text"
                                                        value={espec}
                                                        onChange={(e) => handleEspecificacionChange(index, e.target.value)}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => eliminarEspecificacion(index)}
                                                        className="text-red-600 hover:text-red-800 p-1"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}

                                            {formData.especificaciones.length === 0 && (
                                                <p className="text-sm text-gray-500 italic">No hay especificaciones agregadas</p>
                                            )}
                                        </div>
                                    </div>
                                    {/* <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
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
                                </div> */}


                                    {/* Dimensiones */}
                                    <div className="card">
                                        <h5 className="font-medium text-gray-700 dark:text-gray-400 mb-3">Dimensiones</h5>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <div className="form-input">
                                                <label className="block text-sm text-gray-600 mb-1">Alto:</label>
                                                <div className="relative">
                                                    <input
                                                        required
                                                        title="alto"
                                                        value={formData.dimensiones.alto}
                                                        onChange={handleDimensionChange}
                                                        name="alto"
                                                        type="number"
                                                        placeholder="0"
                                                        className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                                                    />
                                                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">cm</span>
                                                </div>
                                            </div>
                                            <div className="form-input">
                                                <label className="block text-sm text-gray-600 mb-1">Ancho:</label>
                                                <div className="relative">
                                                    <input
                                                        title="ancho"
                                                        required
                                                        value={formData.dimensiones.ancho}
                                                        onChange={handleDimensionChange}
                                                        name="ancho"
                                                        type="number"
                                                        placeholder="0"
                                                        className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                                                    />
                                                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">cm</span>
                                                </div>
                                            </div>
                                            <div className="form-input">
                                                <label className="block text-sm text-gray-600 mb-1">Largo:</label>
                                                <div className="relative">
                                                    <input
                                                        required
                                                        title="largo"
                                                        value={formData.dimensiones.largo}
                                                        onChange={handleDimensionChange}
                                                        name="largo"
                                                        type="number"
                                                        placeholder="0"
                                                        className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                                                    />
                                                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">cm</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
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
                                className={`absolute w-full transition-all duration-500 ${isExiting && formPage === 2
                                    ? "-translate-x-full opacity-0 pointer-events-none"
                                    : ""
                                    } ${!isExiting && formPage === 2
                                        ? "translate-x-0 opacity-100 pointer-events-auto"
                                        : "opacity-0 pointer-events-none"
                                    }`}
                            >
                                <div className="card">
                                    <h5 className="font-medium text-gray-700 dark:text-gray-400 mb-4">Galería de Imágenes</h5>
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">
                                        <p className="font-medium">⚠️ Importante:</p>
                                        <ul className="list-disc list-inside space-y-1 mt-1">
                                            <li>Puedes subir hasta <strong>5 imágenes</strong> por producto.</li>
                                            <li>Las imágenes que ves abajo son solo de referencia.</li>
                                            <li>Al actualizar el producto, <strong>se reemplazarán todas las imágenes</strong> por las que subas aquí.</li>
                                            <li>Si quieres mantener alguna de las actuales, <strong>debes volver a subirla</strong>.</li>
                                            <li>Si es que no quieres cambiar nada conforme a las imágenes, ignorar esta página. </li>
                                        </ul>
                                    </div>
                                    <div className="space-y-4">
                                        {formData.imagenes.map((img, index) => (
                                            <div key={index} className="form-input">
                                                <label>Imagen {index + 1}:</label>
                                                <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-white dark:bg-gray-900/70 dark:border-gray-700">
                                                    {img.url_imagen ? (
                                                        <div className="flex items-center gap-4">
                                                            <img
                                                                src={
                                                                    typeof img.url_imagen === "string"
                                                                        ? img.url_imagen.startsWith("http")
                                                                            ? img.url_imagen
                                                                            : `https://apitami.tamimaquinarias.com${img.url_imagen}`
                                                                        : URL.createObjectURL(img.url_imagen)
                                                                }
                                                                alt={img.texto_alt_SEO || `Imagen ${index + 1}`}
                                                                className="w-16 h-16 object-cover rounded border-2 border-gray-200"
                                                            />

                                                            {/* Botón para reemplazar imagen */}
                                                            <label className="text-sm text-blue-600 underline cursor-pointer">
                                                                Reemplazar
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={(e) => handleImagesChange(e, index)}
                                                                    className="hidden"
                                                                />
                                                            </label>
                                                            <p>* Obligatorio</p>
                                                        </div>
                                                    ) : (
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => handleImagesChange(e, index)}
                                                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                                                        />
                                                    )}
                                                </div>
                                                <label>Texto SEO Imagen {index + 1}:</label>
                                                <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-white dark:bg-gray-900/70">
                                                    <input
                                                        type="text"
                                                        onChange={(e) => handleImagesTextoSEOChange(e, index)}
                                                        value={img.texto_alt_SEO ? img.texto_alt_SEO : ""}
                                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 outline-none"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Imagen para Pop Up */}
                                <div className="card mt-6">
                                    <h5 className="font-medium text-gray-700 dark:text-gray-400 mb-4">Imagen para Pop-up</h5>
                                    <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
                                        <p className="font-medium">ℹ️ Esta imagen se usará únicamente en el pop-up del producto.</p>
                                    </div>
                                    <div className="form-input">
                                        <label>Imagen Pop-up:</label>
                                        <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-white dark:bg-gray-900/70 dark:border-gray-700">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                name="imagen_popup"
                                                onChange={e => {
                                                    if (e.target.files?.[0]) {
                                                        setFormData(prev => ({ ...prev, imagen_popup: e.target.files![0] }));
                                                    }
                                                }}
                                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-input">
                                        <label>Texto ALT Imagen Pop-up (opcional):</label>
                                        <input
                                            type="text"
                                            name="texto_alt_popup"
                                            value={formData.texto_alt_popup || ''}
                                            onChange={e => setFormData(prev => ({ ...prev, texto_alt_popup: e.target.value }))}
                                            placeholder="Texto alternativo para SEO..."
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6">
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
                                className={`absolute w-full transition-all duration-500 ${isExiting && formPage === 3
                                    ? "-translate-x-full opacity-0 pointer-events-none"
                                    : ""
                                    } ${!isExiting && formPage === 3
                                        ? "translate-x-0 opacity-100 pointer-events-auto"
                                        : "opacity-0 pointer-events-none"
                                    }`}
                            >
                                <div className="form-input mb-6">
                                    <label>Productos Relacionados:</label>
                                    {productos.length > 0 ? (
                                        <div className="card grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto">
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
                                                            checked={formData.relacionados.includes(item.id)}
                                                            onChange={(e) => handleRelacionadosChange(e, item.id)}
                                                        />
                                                        <div className="relative flex items-center justify-center">
                                                            {item.imagenes?.[0]?.url_imagen ? (
                                                                <img
                                                                    src={`https://apitami.tamimaquinarias.com${item.imagenes[0].url_imagen}`}
                                                                    alt={item.nombre}
                                                                    className={`w-24 h-24 md:w-28 md:h-28 object-cover rounded-xl border-2 transition-all duration-300 ${formData.relacionados.includes(item.id)
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
                                        className={`w-full sm:w-1/2 bg-teal-600 hover:bg-teal-700 text-white py-3 px-6 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${isLoading ? "opacity-75 cursor-not-allowed" : ""
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

export default EditProduct;