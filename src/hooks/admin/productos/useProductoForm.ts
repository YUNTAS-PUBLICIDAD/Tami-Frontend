
/**
 * @file useProductoForm.ts
 * @description Este hook maneja el formulario para añadir productos.
 * Gestiona el estado del formulario, validación, imágenes, especificaciones y lógica de envío.
 */

import React, { useState, useEffect } from "react";
import type { ProductPOST } from "../../../models/Product.ts";
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
        imagenes: Array(4).fill({ url_imagen: null }),
        relacionados: [],
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
                nombre: producto.nombreProducto,
                titulo: producto.title,
                subtitulo: producto.subtitle,
                lema: producto.tagline,
                descripcion: producto.description,
                imagen_principal: null, // Resetear la imagen principal
                stock: producto.stockProducto,
                precioProducto: producto.precioProducto,
                seccion: producto.seccion,
                especificaciones: producto.specs, // Mapeo directo si tiene la misma estructura
                dimensiones: producto.dimensions, // Mapeo directo si tiene la misma estructura
                imagenes: producto.images?.map((url) => ({ url_imagen: null })) || [], // Conversión de `string[]` a `{ url_imagen: null }`
                relacionados: producto.relatedProducts || [],
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
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleNestedChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        group: "dimensiones" | "especificaciones"
    ) => {
        setFormData((prev) => ({
            ...prev,
            [group]: { ...prev[group], [e.target.name]: e.target.value },
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData((prev) => ({ ...prev, imagen_principal: file }));
        }
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
                : prev.relacionados.filter((r) => r !== id),
        }));
    };

    const handleImagesChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        index: number
    ) => {
        if (e.target.files?.[0]) {
            const nuevasImagenes = [...formData.imagenes];
            // Agregar el archivo y su parrafo
            nuevasImagenes[index] = { url_imagen: e.target.files[0] };
            setFormData((prev) => ({ ...prev, imagenes: nuevasImagenes }));
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
            lema,
            descripcion,
            imagen_principal,
            stock,
            precioProducto,
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
            !lema.trim() ||
            !descripcion.trim() ||
            !(imagen_principal instanceof File) ||
            stock <= 0 ||
            precioProducto <= 0 ||
            !seccion.trim() ||
            !especificaciones.color.trim() ||
            !especificaciones.material.trim() ||
            !dimensiones.alto.trim() ||
            !dimensiones.largo.trim() ||
            !dimensiones.ancho.trim() ||
            imagenes.length === 0 ||
            imagenes.some((img) => !(img.url_imagen instanceof File))
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
                const value = formData[key as keyof ProductPOST];
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

            if (formData.imagen_principal) {
                formToSend.append("imagen_principal", formData.imagen_principal);
            }

            formData.imagenes.forEach((img, i) => {
                if (img.url_imagen) {
                    formToSend.append(`imagenes[${i}][url_imagen]`, img.url_imagen);
                }
            });

            const productoData: Partial<Producto> = {
                name: formData.nombre, // `nombre` en `ProductPOST` se asigna a `name` en `Producto`
                title: formData.titulo,
                subtitle: formData.subtitulo,
                tagline: formData.lema,
                description: formData.descripcion,
                image: formData.imagen_principal
                    ? URL.createObjectURL(formData.imagen_principal) // Convierte el archivo a una URL
                    : "", // Si es null, asigna un string vacío
                stockProducto: formData.stock,
                precioProducto: formData.precioProducto,
                seccion: formData.seccion,
                specs: formData.especificaciones, // Mapea correctamente a `specs`
                dimensions: formData.dimensiones, // Mapea a `dimensions`
                images: formData.imagenes
                    .filter((img) => img.url_imagen !== null) // Excluye imágenes nulas
                    .map((img) => URL.createObjectURL(img.url_imagen as File)), // Convierte archivos a URLs
                relatedProducts: formData.relacionados, // `relacionados` se asigna a `relatedProducts`
            };

            if (isEditing && producto) {
                await updateProducto(producto!.id, productoData);
                await Swal.fire({
                    icon: "success",
                    title: "Producto actualizado correctamente",
                    showConfirmButton: false,
                    timer: 1500,
                });
            } else {
                console.log(productoData);
                await addProducto(productoData);
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
            imagenes: Array(4).fill({ url_imagen: null }),
            relacionados: [],
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