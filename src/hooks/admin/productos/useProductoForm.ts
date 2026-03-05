
/**
 * @file useProductoForm.ts
 * @description Este hook maneja el formulario para añadir productos.
 * Gestiona el estado del formulario, validación, imágenes, especificaciones y lógica de envío.
 */

import React, { useState, useEffect } from "react";
import type { ProductFormularioPOST } from "../../../models/Product.ts";
import useProductoAcciones from "./useProductosActions";
import type Producto from "../../../models/Product.ts";
import useClienteAcciones from "../seguimiento/useClientesActions.ts";
import Swal from "sweetalert2";
/**
 * Funcion para manejar el formulario de cliente
 */
const useProductForm = (
    producto?: Producto | null,
    onSuccess?: () => void
) => {
    /**
     * Estado para manejar los datos del formulario.
     * Inicialmente se establece como un objeto vacío.
     */
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<ProductFormularioPOST>({
        nombre: "",
        titulo: "",
        subtitulo: "",
        link: "",
        descripcion: "",
        stock: 100,
        precio: 199.99,
        seccion: "Negocio",
        especificaciones: [],
        dimensiones: {
            alto: "",
            largo: "",
            ancho: "",
        },
        imagenes: Array(5).fill({ url_imagen: null, texto_alt_SEO: "" }),
        relacionados: [],
        textos_alt: [],
        asunto: "",
        etiqueta: {
            keywords: [""],
            meta_titulo: "",
            meta_descripcion: "",
            popup_estilo: "estilo1",
        }
    });

    const [isEditing, setIsEditing] = useState(false); // Estado para manejar si estamos editando o añadiendo un producto
    const { addProducto, updateProducto } = useProductoAcciones(); // Importamos las funciones de los fetch para añadir y actualizar prodcutos

    /**
     * Efecto para manejar la carga inicial del formulario.
     * Si se pasa un producto, se cargan sus datos en el formulario.
     */
    useEffect(() => {
        if (producto) {
            /**
             * Si hay un producto, cargamos sus datos en el formulario.
             */
            setFormData({
                nombre: producto.nombre,
                titulo: producto.titulo,
                subtitulo: producto.subtitulo,
                link: producto.link,
                descripcion: producto.descripcion,
                stock: producto.stock,
                precio: producto.precio,
                seccion: producto.seccion,
                especificaciones: producto.especificaciones.map(e => e.valor),
                dimensiones: producto.dimensiones,
                imagenes: producto.imagenes.map((img) => ({ url_imagen: null, texto_alt_SEO: img.texto_alt_SEO })),
                relacionados: producto.productos_relacionados?.map(p => p.id) || [],
                textos_alt: producto.imagenes.map(img => img.texto_alt_SEO),
                asunto: "",
                etiqueta: {
                    keywords: producto.etiqueta.keywords.split(","),
                    meta_titulo: producto.etiqueta.meta_titulo,
                    meta_descripcion: producto.etiqueta.meta_descripcion,
                    popup_estilo: producto.etiqueta.popup_estilo,
                }
            });
            setIsEditing(true);
        } else {
            /**
             * Si no hay producto, reiniciamos el formulario
             * y establecemos el estado de edición en falso.
             */
            resetForm();
        }
    }, [producto]);

    /**
     * Función para manejar los cambios en los inputs del formulario.
     */
    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData((prev: ProductFormularioPOST) => ({ ...prev, [name]: value }));
    };

    const handleNestedChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        group: "dimensiones" | "especificaciones"
    ) => {
        setFormData((prev: ProductFormularioPOST) => ({
            ...prev,
            [group]: { ...prev[group], [e.target.name]: e.target.value },
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // No longer used in this model
    };

    const handleRelacionadosChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        id: number
    ) => {
        setFormData((prev) => ({
            ...prev,
            relacionados: e.target.checked
                // Agregar el ID al array de relacionados
                ? [...prev.relacionados, id]
                // Eliminar el ID del array de relacionados
                : prev.relacionados.filter((r: number) => r !== id),
        }));
    };

    const handleImagesChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        index: number
    ) => {
        if (e.target.files?.[0]) {
            const nuevasImagenes = [...formData.imagenes];
            // Agregar el archivo y su parrafo
            nuevasImagenes[index] = { ...nuevasImagenes[index], url_imagen: e.target.files[0] };
            setFormData((prev: ProductFormularioPOST) => ({ ...prev, imagenes: nuevasImagenes }));
        }
    };

    /**
     * Función para manejar el envío del formulario.
     * Valida los campos y llama a las funciones de añadir o actualizar producto.
     */

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Prevenimos el comportamiento por defecto del formulario
        const {
            nombre,
            titulo,
            subtitulo,
            descripcion,
            stock,
            precio,
            seccion,
            especificaciones,
            dimensiones,
            imagenes,
            relacionados,
        } = formData; // Desestructuramos los datos del formulario

        /**
         * Validación de los campos del formulario.
         */
        if (
            !nombre.trim() ||
            !titulo.trim() ||
            !subtitulo.trim() ||
            !descripcion.trim() ||
            stock <= 0 ||
            precio <= 0 ||
            !seccion.trim() ||
            !dimensiones.alto.trim() ||
            !dimensiones.largo.trim() ||
            !dimensiones.ancho.trim() ||
            imagenes.length === 0
        ) {
            await Swal.fire({
                icon: "warning",
                title: "Campos obligatorios",
                text: "⚠️ Todos los campos son obligatorios y deben tener valores válidos.",
            });
            return;
        }
        setIsLoading(true);
        try {
            const formToSend = new FormData();

            for (const key in formData) {
                const value = formData[key as keyof ProductFormularioPOST];
                if (
                    typeof value === "string" ||
                    typeof value === "number" ||
                    value instanceof Blob
                ) {
                    formToSend.append(key, value as string | Blob);
                }
            }

            formToSend.append(
                "especificaciones",
                JSON.stringify(formData.especificaciones)
            );
            formToSend.append(
                "dimensiones",
                JSON.stringify({
                    alto: formData.dimensiones.alto + "cm",
                    largo: formData.dimensiones.largo + "cm",
                    ancho: formData.dimensiones.ancho + "cm",
                })
            );
            formToSend.append("relacionados", JSON.stringify(formData.relacionados));

            if ((formData as any).miniatura) {
                formToSend.append("miniatura", (formData as any).miniatura);
            }

            formData.imagenes.forEach((img: { url_imagen: File | string | null }, i: number) => {
                if (img.url_imagen instanceof File) {
                    formToSend.append(`imagenes[${i}]`, img.url_imagen);
                }
            });

            const productoData: Partial<Producto> = {
                nombre: formData.nombre,
                titulo: formData.titulo,
                subtitulo: formData.subtitulo,
                descripcion: formData.descripcion,
                stock: formData.stock,
                precio: formData.precio,
                seccion: formData.seccion,
                dimensiones: formData.dimensiones,
                imagenes: formData.imagenes
                    .filter((img: { url_imagen: File | string | null }) => img.url_imagen instanceof File)
                    .map((img: { url_imagen: File | string | null }) => ({
                        id: 0,
                        url_imagen: URL.createObjectURL(img.url_imagen as File),
                        texto_alt_SEO: ""
                    })),
            };

            if (isEditing && producto) {
                await updateProducto(producto!.id, formToSend);
                await Swal.fire({
                    icon: "success",
                    title: "Producto actualizado correctamente",
                    showConfirmButton: false,
                    timer: 1500,
                });
            } else {

                await addProducto(formToSend);
                await Swal.fire({
                    icon: "success",
                    title: "Producto creado exitosamente",
                    showConfirmButton: false,
                    timer: 1500,
                });
            }

            onSuccess?.();
            resetForm();
        } catch (error: any) {
            console.error("❌ Error al enviar:", error);
            await Swal.fire({
                icon: "error",
                title: "Error",
                text: `❌ Error: ${error.message || "Error desconocido"}`,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            nombre: "",
            titulo: "",
            subtitulo: "",
            link: "",
            descripcion: "",
            stock: 100,
            precio: 199.99,
            seccion: "Negocio",
            especificaciones: [],
            dimensiones: {
                alto: "",
                largo: "",
                ancho: "",
            },
            imagenes: Array(5).fill({ url_imagen: null, texto_alt_SEO: "" }),
            relacionados: [],
            textos_alt: [],
            asunto: "",
            etiqueta: {
                keywords: [""],
                meta_titulo: "",
                meta_descripcion: "",
                popup_estilo: "estilo1",
            }
        });
        setIsEditing(false);
    };

    return {
        formData,
        handleChange,
        handleNestedChange,
        handleFileChange,
        handleRelacionadosChange,
        handleImagesChange,
        handleSubmit,
        resetForm,
        isEditing,
        setFormData,
        isLoading
    };
};

export default useProductForm;