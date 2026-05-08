import React, { useState, useEffect, useRef } from "react";
import apiClient from "../../../services/apiClient";
import { config, getApiUrl } from "../../../../config";
import { ProductoService } from "../../../services/producto.service";
import type Producto from "../../../models/Product";
import Swal from "sweetalert2";
import WhatsappEditor from "./WhatsappEditor";
import EmailEditor from "./EmailEditor";

const TabProducto: React.FC = () => {
    const [products, setProducts] = useState<Producto[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [selectedProductId, setSelectedProductId] = useState<string>("");
    const [formData, setFormData] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [previews, setPreviews] = useState<{ [key: string]: string }>({});
    const [activeTab, setActiveTab] = useState<"popups" | "whatsapp" | "correo">("popups");

    useEffect(() => {
        const handleWhatsappUpdate = (e: any) => {
            if (typeof e.detail === "string") {
                setFormData((prev: any) => prev ? { ...prev, texto_alt_whatsapp: e.detail } : null);
            }
        };
        const handleEmailUpdate = (e: any) => {
            if (typeof e.detail === "string") {
                setFormData((prev: any) => prev ? { ...prev, mensaje_email: e.detail } : null);
            }
        };

        window.addEventListener("update-whatsapp-preview", handleWhatsappUpdate);
        window.addEventListener("update-email-preview", handleEmailUpdate);

        return () => {
            window.removeEventListener("update-whatsapp-preview", handleWhatsappUpdate);
            window.removeEventListener("update-email-preview", handleEmailUpdate);
        };
    }, []);

    useEffect(() => {
        if (formData) {
            syncPreview(formData);
        }
    }, [activeTab]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await ProductoService.getAllProductos();
                setProducts(data);
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoadingProducts(false);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        const handleReset = () => {
            setSelectedProductId("");
            setFormData(null);
            setPreviews({});
        };

        const handleExternalSave = () => {
            handleSave();
        };

        window.addEventListener("reset-product-selection", handleReset);
        window.addEventListener("request-save-product-popup", handleExternalSave);
        return () => {
            window.removeEventListener("reset-product-selection", handleReset);
            window.removeEventListener("request-save-product-popup", handleExternalSave);
        };
    }, [selectedProductId, formData, isSaving]); // Added dependencies to ensure handleSave has latest state

    const getFullImageUrl = (url: string) => {
        if (!url) return "";
        if (url.startsWith("http")) return url;
        return `${config.apiUrl}${url}`;
    };

    const handleProductSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setSelectedProductId(id);

        if (!id) {
            setFormData(null);
            return;
        }

        try {
            // Fetch FULL product details
            const response = await apiClient.get(config.endpoints.productos.detail(id));
            const product = response.data.data || response.data;

            const imagenPopup = product.producto_imagenes?.find((img: any) => img.tipo === "popup");
            const imagenPopup2 = product.producto_imagenes?.find((img: any) => {
                const tipo = (img.tipo || "").toLowerCase();
                return tipo === "popup2" || tipo === "popup_2";
            });

            const imagenPopupMobile = product.producto_imagenes?.find((img: any) => img.tipo === "popup_mobile");
            const imagenPopupMobile2 = product.producto_imagenes?.find((img: any) => img.tipo === "popup_mobile2");

            const imagenEmail = product.producto_imagenes?.find((img: any) => img.tipo === "email");
            const imagenWhatsapp = product.producto_imagenes?.find((img: any) => img.tipo === "whatsapp");

            const initialData = {
                ...product, // Store ALL product fields
                imagen_popup: imagenPopup ? getFullImageUrl(imagenPopup.url_imagen) : null,
                texto_alt_popup: imagenPopup?.texto_alt_SEO || "",
                imagen_popup2: imagenPopup2 ? getFullImageUrl(imagenPopup2.url_imagen) : null,
                texto_alt_popup2: imagenPopup2?.texto_alt_SEO || "",
                imagen_popup_mobile: imagenPopupMobile ? getFullImageUrl(imagenPopupMobile.url_imagen) : null,
                texto_alt_popup_mobile: imagenPopupMobile?.texto_alt_SEO || "",
                imagen_popup_mobile2: imagenPopupMobile2 ? getFullImageUrl(imagenPopupMobile2.url_imagen) : null,
                texto_alt_popup_mobile2: imagenPopupMobile2?.texto_alt_SEO || "",

                // Email Data
                imagen_email: imagenEmail ? getFullImageUrl(imagenEmail.url_imagen) : null,
                asunto: imagenEmail?.asunto || "",
                mensaje_email: imagenEmail?.email_mensaje || "",
                email_btn_text: imagenEmail?.email_btn_text || "Ver Productos",
                email_btn_link: imagenEmail?.email_btn_link || "https://tami.com/productos",
                email_btn_bg_color: imagenEmail?.email_btn_bg_color || "#0b1c3c",
                email_btn_text_color: imagenEmail?.email_btn_text_color || "#ffffff",

                // Whatsapp Data
                imagen_whatsapp: imagenWhatsapp ? getFullImageUrl(imagenWhatsapp.url_imagen) : null,
                texto_alt_whatsapp: imagenWhatsapp?.whatsapp_mensaje || "",

                delete_imagen_popup: 0,
                delete_imagen_popup2: 0,
                delete_imagen_popup_mobile: 0,
                delete_imagen_popup_mobile2: 0,
                delete_imagen_email: 0,
                delete_imagen_whatsapp: 0,
                etiqueta: {
                    ...product.etiqueta,
                    popup_button_color: product.etiqueta?.popup_button_color || "#008B8B",
                    popup_text_color: product.etiqueta?.popup_text_color || "#000000",
                    popup_button_text: product.etiqueta?.popup_button_text || "¡COTIZA AHORA!",
                }
            };
            setFormData(initialData);

            // Update Editors
            window.dispatchEvent(new CustomEvent("update-whatsapp-editor-producto", { detail: initialData.texto_alt_whatsapp }));
            window.dispatchEvent(new CustomEvent("update-email-editor-producto", { detail: initialData.mensaje_email }));

            syncPreview(initialData);
        } catch (error) {
            console.error("Error fetching product details:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudieron obtener los detalles del producto."
            });
        }
    };

    const syncPreview = (data: any, overrides: any = {}) => {
        const previewSettings = {
            popup_image_url: overrides.imagen_popup || previews.imagen_popup || data.imagen_popup,
            popup_image2_url: overrides.imagen_popup2 || previews.imagen_popup2 || data.imagen_popup2,
            button_bg_color: data.etiqueta.popup_button_color,
            button_text_color: data.etiqueta.popup_text_color,
            button_text: data.etiqueta.popup_button_text,
            popup_mobile_image_url: overrides.imagen_popup_mobile !== undefined ? overrides.imagen_popup_mobile : (previews.imagen_popup_mobile || data.imagen_popup_mobile),
            popup_mobile_image2_url: overrides.imagen_popup_mobile2 !== undefined ? overrides.imagen_popup_mobile2 : (previews.imagen_popup_mobile2 || data.imagen_popup_mobile2)
        };

        // Final check: if any of these are still File objects, we don't send them
        if (previewSettings.popup_image_url instanceof File) previewSettings.popup_image_url = null;
        if (previewSettings.popup_image2_url instanceof File) previewSettings.popup_image2_url = null;
        if (previewSettings.popup_mobile_image_url instanceof File) previewSettings.popup_mobile_image_url = null;
        if (previewSettings.popup_mobile_image2_url instanceof File) previewSettings.popup_mobile_image2_url = null;

        window.dispatchEvent(
            new CustomEvent("update-popup-preview", {
                detail: { settings: previewSettings },
            }),
        );

        // Switch preview type based on active tab
        window.dispatchEvent(new CustomEvent("switch-preview-type", { detail: activeTab }));

        if (activeTab === "whatsapp") {
            const waImage = overrides.imagen_whatsapp !== undefined ? overrides.imagen_whatsapp : (previews.imagen_whatsapp || data.imagen_whatsapp);
            window.dispatchEvent(new CustomEvent("update-whatsapp-preview", {
                detail: {
                    text: data.texto_alt_whatsapp || "",
                    image: waImage instanceof File ? null : waImage
                }
            }));
        } else if (activeTab === "correo") {
            const emailImage = overrides.imagen_email !== undefined ? overrides.imagen_email : (previews.imagen_email || data.imagen_email);
            window.dispatchEvent(new CustomEvent("update-email-preview", {
                detail: {
                    body: data.mensaje_email || "",
                    title: data.asunto || "",
                    image: emailImage instanceof File ? null : emailImage,
                    btnText: data.email_btn_text,
                    btnLink: data.email_btn_link,
                    btnBgColor: data.email_btn_bg_color,
                    btnTextColor: data.email_btn_text_color
                }
            }));
        }
    };

    const handleFieldChange = (field: string, value: any, isEtiqueta = false) => {
        setFormData((prev: any) => {
            const newData = { ...prev };
            if (isEtiqueta) {
                newData.etiqueta = { ...newData.etiqueta, [field]: value };
            } else {
                newData[field] = value;
            }

            // Only sync preview if it's not a File object (to avoid broken images in preview)
            if (!(value instanceof File)) {
                syncPreview(newData);
            }
            return newData;
        });
    };

    const handleClearImage = (field: string) => {
        setPreviews(prev => {
            const newPreviews = { ...prev };
            delete newPreviews[field];
            return newPreviews;
        });

        setFormData((prev: any) => {
            const newData = {
                ...prev,
                [field]: null,
                [`delete_${field}`]: 1
            };
            syncPreview(newData, { [field]: null });
            return newData;
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const url = reader.result as string;
                setPreviews(prev => ({ ...prev, [field]: url }));

                setFormData((prev: any) => {
                    const newData = {
                        ...prev,
                        [field]: file,
                        [`delete_${field}`]: 0
                    };
                    // We pass the base64 URL as an override to ensure the preview uses it instead of the File
                    syncPreview(newData, { [field]: url });
                    return newData;
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!selectedProductId || !formData) return;

        setIsSaving(true);
        try {
            const formDataToSend = new FormData();

            // Baseline product fields (unchanged) to satisfy strict backend update handlers.
            formDataToSend.append("nombre", formData.nombre || "");
            formDataToSend.append("titulo", formData.titulo || "");
            formDataToSend.append("subtitulo", formData.subtitulo || "");
            formDataToSend.append("descripcion", formData.descripcion || "");
            formDataToSend.append("seccion", formData.seccion || "");
            formDataToSend.append("link", formData.link || "");
            formDataToSend.append("stock", String(formData.stock ?? 0));
            formDataToSend.append("precio", String(formData.precio ?? 0));

            // Keep current gallery references to avoid backend rules that require gallery context.
            if (Array.isArray(formData.producto_imagenes)) {
                formData.producto_imagenes
                    .filter((img: any) => img?.tipo === "galeria" || !img?.tipo)
                    .forEach((img: any, idx: number) => {
                        let urlLimpia = img.url_imagen || "";
                        if (typeof urlLimpia === "string" && urlLimpia.includes(config.apiUrl)) {
                            urlLimpia = urlLimpia.replace(config.apiUrl, "");
                        }
                        if (typeof urlLimpia === "string") {
                            urlLimpia = urlLimpia.split("?")[0];
                        }

                        formDataToSend.append(`imagenes_existentes[${idx}][url]`, urlLimpia || "");
                        if (img.id != null) {
                            formDataToSend.append(`imagenes_existentes[${idx}][id]`, String(img.id));
                        }
                        formDataToSend.append(`imagenes_existentes[${idx}][alt]`, img.texto_alt_SEO || "");
                    });
            }

            // Popup Images
            if (formData.imagen_popup instanceof File) {
                formDataToSend.append("imagen_popup", formData.imagen_popup);
            }
            formDataToSend.append("texto_alt_popup", formData.texto_alt_popup || "");

            if (formData.imagen_popup2 instanceof File) {
                formDataToSend.append("imagen_popup2", formData.imagen_popup2);
            }
            formDataToSend.append("texto_alt_popup2", formData.texto_alt_popup2 || "");
            formDataToSend.append("texto_alt_popup_2", formData.texto_alt_popup2 || "");

            // Mobile Images
            if (formData.imagen_popup_mobile instanceof File) {
                formDataToSend.append("imagen_popup_mobile", formData.imagen_popup_mobile);
            } else if (formData.delete_imagen_popup_mobile === 1) {
                formDataToSend.append("delete_imagen_popup_mobile", "1");
            }
            formDataToSend.append("texto_alt_popup_mobile", formData.texto_alt_popup_mobile || "");

            if (formData.imagen_popup_mobile2 instanceof File) {
                formDataToSend.append("imagen_popup_mobile2", formData.imagen_popup_mobile2);
            } else if (formData.delete_imagen_popup_mobile2 === 1) {
                formDataToSend.append("delete_imagen_popup_mobile2", "1");
            }
            formDataToSend.append("texto_alt_popup_mobile2", formData.texto_alt_popup_mobile2 || "");

            // Email & Whatsapp Data
            if (formData.imagen_email instanceof File) {
                formDataToSend.append("imagen_email", formData.imagen_email);
            } else if (formData.delete_imagen_email === 1) {
                formDataToSend.append("delete_imagen_email", "1");
            }
            formDataToSend.append("asunto", formData.asunto || "");
            formDataToSend.append("mensaje_email", formData.mensaje_email || "");
            formDataToSend.append("email_btn_text", formData.email_btn_text || "Ver Productos");
            formDataToSend.append("email_btn_link", formData.email_btn_link || "https://tami.com/productos");
            formDataToSend.append("email_btn_bg_color", formData.email_btn_bg_color || "#0b1c3c");
            formDataToSend.append("email_btn_text_color", formData.email_btn_text_color || "#ffffff");

            if (formData.imagen_whatsapp instanceof File) {
                formDataToSend.append("imagen_whatsapp", formData.imagen_whatsapp);
            } else if (formData.delete_imagen_whatsapp === 1) {
                formDataToSend.append("delete_imagen_whatsapp", "1");
            }
            formDataToSend.append("texto_alt_whatsapp", formData.texto_alt_whatsapp || "");

            // Deletion flags for Desktop images as well
            if (!(formData.imagen_popup instanceof File) && formData.delete_imagen_popup === 1) {
                formDataToSend.append("delete_imagen_popup", "1");
            }
            if (!(formData.imagen_popup2 instanceof File) && formData.delete_imagen_popup2 === 1) {
                formDataToSend.append("delete_imagen_popup2", "1");
                formDataToSend.append("delete_imagen_popup_2", "1");
            }

            // Button text and colors
            formDataToSend.append("etiqueta[meta_titulo]", formData.etiqueta?.meta_titulo || "");
            formDataToSend.append("etiqueta[meta_descripcion]", formData.etiqueta?.meta_descripcion || "");
            formDataToSend.append("etiqueta[popup_estilo]", formData.etiqueta?.popup_estilo || "estilo1");
            formDataToSend.append("etiqueta[popup_button_text]", formData.etiqueta?.popup_button_text || "¡COTIZA AHORA!");
            formDataToSend.append("etiqueta[popup_button_color]", formData.etiqueta?.popup_button_color || "#008B8B");
            formDataToSend.append("etiqueta[popup_text_color]", formData.etiqueta?.popup_text_color || "#000000");


            // Required flags for partial update
            formDataToSend.append("_method", "PUT");
            formDataToSend.append("only_popup", "1");

            // Include safe fallbacks if they exist in formData
            if (formData.dimensiones) {
                formDataToSend.append("dimensiones[alto]", String(formData.dimensiones.alto || "0"));
                formDataToSend.append("dimensiones[largo]", String(formData.dimensiones.largo || "0"));
                formDataToSend.append("dimensiones[ancho]", String(formData.dimensiones.ancho || "0"));
            }

            if (formData.especificaciones) {
                let specsToSend = formData.especificaciones;
                if (Array.isArray(specsToSend)) {
                    const specsObj: Record<string, string> = {};
                    specsToSend.forEach((s: any) => {
                        if (s?.nombre && s?.valor) specsObj[s.nombre] = s.valor;
                    });
                    specsToSend = specsObj;
                }
                formDataToSend.append("especificaciones", typeof specsToSend === 'string' ? specsToSend : JSON.stringify(specsToSend));
            }

            if (formData.etiqueta?.keywords) {
                const keywords = formData.etiqueta.keywords;
                const kwArray = Array.isArray(keywords)
                    ? keywords
                    : String(keywords).split(",").map((k: string) => k.trim()).filter(Boolean);
                formDataToSend.append("keywords", JSON.stringify(kwArray));
            }

            console.log("📤 Sending popup update (PUT spoofed). Data:");
            for (let [key, value] of (formDataToSend as any).entries()) {
                console.log(`${key}:`, value instanceof File ? `File(${value.name})` : value);
            }

            const response = await apiClient.post(
                config.endpoints.productos.update(selectedProductId),
                formDataToSend,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            if (response.status === 200 || response.status === 201) {
                Swal.fire({
                    icon: "success",
                    title: "Configuración guardada",
                    text: "El pop-up del producto ha sido actualizado.",
                    timer: 2000,
                    showConfirmButton: false,
                });
            } else {
                throw new Error(`Error al guardar: ${response.status}`);
            }
        } catch (error: any) {
            console.error("❌ Error saving product popup:", error);
            const errorMsg = error.response?.data?.message || error.message || "No se pudo guardar la configuración.";
            Swal.fire({
                icon: "error",
                title: "Error de Guardado",
                text: errorMsg,
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (loadingProducts) {
        return <div className="p-8 text-center text-gray-500">Cargando productos...</div>;
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-xl border border-teal-100 dark:border-teal-800">
                <label className="block text-sm font-bold text-teal-800 dark:text-teal-300 mb-2">
                    Seleccionar Producto para configurar:
                </label>
                <div className="relative">
                    <select
                        value={selectedProductId}
                        onChange={handleProductSelect}
                        className="w-full p-3 pr-10 rounded-lg border border-teal-200 dark:border-teal-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 outline-none transition-all appearance-none"
                    >
                        <option value="">-- Elige un producto --</option>
                        {products.map(p => (
                            <option key={p.id} value={p.id}>{p.nombre}</option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-teal-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
            </div>

            {formData && (
                <div className="space-y-6 animate-fadeIn">
                    {/* Sub-Tabs for Product */}
                    <div className="flex gap-2 mb-6 pb-2">
                        {[
                            { id: 'popups', label: 'Pop-ups' },
                            { id: 'whatsapp', label: 'WhatsApp' },
                            { id: 'correo', label: 'Correo' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id as any);
                                }}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab.id
                                        ? "bg-teal-600 dark:bg-teal-500 text-white shadow-sm"
                                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-700 dark:hover:text-gray-200"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'popups' && (
                        <div className="space-y-6">
                            {/* Imagen 1 */}
                            <div className="bg-gray-50 dark:bg-gray-800/40 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm">
                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Primera Imagen</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    Sube una imagen promocional para tu popup. Resolución recomendada: <strong>448x550px</strong>. La imagen debe pesar <strong>2MB</strong> como máximo, recomendación formato <strong>webp</strong>.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-6 items-start">
                                    <div className="w-full sm:w-32 h-32 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                                        {previews.imagen_popup || formData.imagen_popup ? (
                                            <img src={previews.imagen_popup || formData.imagen_popup} className="w-full h-full object-contain" />
                                        ) : (
                                            <span className="text-xs text-gray-400 font-medium">Sin imagen</span>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-4 w-full">
                                        <div className="flex flex-col gap-2">
                                            <input
                                                type="file"
                                                id="input_imagen_popup"
                                                accept="image/*"
                                                onChange={(e) => handleFileChange(e, "imagen_popup")}
                                                className="hidden"
                                            />
                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => document.getElementById('input_imagen_popup')?.click()}
                                                    className="inline-flex items-center gap-2 px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-lg transition-all shadow-md active:scale-95 w-fit"
                                                >
                                                    Seleccionar Imagen 1
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                    </svg>
                                                </button>
                                                {(previews.imagen_popup || formData.imagen_popup) && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleClearImage("imagen_popup")}
                                                        className="text-red-500 hover:text-red-600 transition-colors p-2"
                                                        title="Borrar Imagen 1"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Texto ALT (SEO):</label>
                                            <input
                                                type="text"
                                                value={formData.texto_alt_popup}
                                                onChange={(e) => handleFieldChange("texto_alt_popup", e.target.value)}
                                                className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all shadow-sm"
                                                placeholder="Ej: Ventilador holográfico Tami..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Imagen 2 */}
                            <div className="bg-gray-50 dark:bg-gray-800/40 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm mt-4">
                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Segunda Imagen</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    Segunda imagen para el popup (mitad derecha). Resolución recomendada: <strong>448x550px</strong>. La imagen debe pesar <strong>2MB</strong> como máximo, recomendación formato <strong>webp</strong>.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-6 items-start">
                                    <div className="w-full sm:w-32 h-32 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                                        {previews.imagen_popup2 || formData.imagen_popup2 ? (
                                            <img src={previews.imagen_popup2 || formData.imagen_popup2} className="w-full h-full object-contain" />
                                        ) : (
                                            <span className="text-xs text-gray-400 font-medium">Sin imagen</span>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-4 w-full">
                                        <div className="flex flex-col gap-2">
                                            <input
                                                type="file"
                                                id="input_imagen_popup2"
                                                accept="image/*"
                                                onChange={(e) => handleFileChange(e, "imagen_popup2")}
                                                className="hidden"
                                            />
                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => document.getElementById('input_imagen_popup2')?.click()}
                                                    className="inline-flex items-center gap-2 px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-lg transition-all shadow-md active:scale-95 w-fit"
                                                >
                                                    Seleccionar Imagen 2
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                    </svg>
                                                </button>
                                                {(previews.imagen_popup2 || formData.imagen_popup2) && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleClearImage("imagen_popup2")}
                                                        className="text-red-500 hover:text-red-600 transition-colors p-2"
                                                        title="Borrar Imagen 2"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Texto ALT (SEO):</label>
                                            <input
                                                type="text"
                                                value={formData.texto_alt_popup2}
                                                onChange={(e) => handleFieldChange("texto_alt_popup2", e.target.value)}
                                                className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all shadow-sm"
                                                placeholder="Ej: Fondo decorativo azul..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Primera Imagen Móvil */}
                            <div className="bg-gray-50 dark:bg-gray-800/40 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm mt-4">
                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Primera Imagen Móvil</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    Imagen para vista en dispositivos móviles. Resolución recomendada: <strong>448x640px</strong>. La imagen debe pesar <strong>2MB</strong> como máximo, recomendación formato <strong>webp</strong>.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-6 items-start">
                                    <div className="w-full sm:w-32 h-32 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                                        {previews.imagen_popup_mobile || formData.imagen_popup_mobile ? (
                                            <img src={previews.imagen_popup_mobile || formData.imagen_popup_mobile} className="w-full h-full object-contain" />
                                        ) : (
                                            <span className="text-xs text-gray-400 font-medium">Sin imagen</span>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-4 w-full">
                                        <div className="flex flex-col gap-2">
                                            <input
                                                type="file"
                                                id="input_imagen_popup_mobile"
                                                accept="image/*"
                                                onChange={(e) => handleFileChange(e, "imagen_popup_mobile")}
                                                className="hidden"
                                            />
                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => document.getElementById('input_imagen_popup_mobile')?.click()}
                                                    className="inline-flex items-center gap-2 px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-lg transition-all shadow-md active:scale-95 w-fit"
                                                >
                                                    Seleccionar Imagen Móvil 1
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                    </svg>
                                                </button>
                                                {(previews.imagen_popup_mobile || formData.imagen_popup_mobile) && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleClearImage("imagen_popup_mobile")}
                                                        className="text-red-500 hover:text-red-600 transition-colors p-2"
                                                        title="Borrar Imagen Móvil 1"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Texto ALT (SEO):</label>
                                            <input
                                                type="text"
                                                value={formData.texto_alt_popup_mobile}
                                                onChange={(e) => handleFieldChange("texto_alt_popup_mobile", e.target.value)}
                                                className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all shadow-sm"
                                                placeholder="Ej: Imagen móvil principal..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Segunda Imagen Móvil */}
                            <div className="bg-gray-50 dark:bg-gray-800/40 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm mt-4">
                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Segunda Imagen Móvil</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    Segunda imagen para vista en dispositivos móviles (abajo). Resolución recomendada: <strong>448x640px</strong>. La imagen debe pesar <strong>2MB</strong> como máximo, recomendación formato <strong>webp</strong>.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-6 items-start">
                                    <div className="w-full sm:w-32 h-32 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                                        {previews.imagen_popup_mobile2 || formData.imagen_popup_mobile2 ? (
                                            <img src={previews.imagen_popup_mobile2 || formData.imagen_popup_mobile2} className="w-full h-full object-contain" />
                                        ) : (
                                            <span className="text-xs text-gray-400 font-medium">Sin imagen</span>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-4 w-full">
                                        <div className="flex flex-col gap-2">
                                            <input
                                                type="file"
                                                id="input_imagen_popup_mobile2"
                                                accept="image/*"
                                                onChange={(e) => handleFileChange(e, "imagen_popup_mobile2")}
                                                className="hidden"
                                            />
                                            <div className="flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => document.getElementById('input_imagen_popup_mobile2')?.click()}
                                                    className="inline-flex items-center gap-2 px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-lg transition-all shadow-md active:scale-95 w-fit"
                                                >
                                                    Seleccionar Imagen Móvil 2
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                    </svg>
                                                </button>
                                                {(previews.imagen_popup_mobile2 || formData.imagen_popup_mobile2) && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleClearImage("imagen_popup_mobile2")}
                                                        className="text-red-500 hover:text-red-600 transition-colors p-2"
                                                        title="Borrar Imagen Móvil 2"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Texto ALT (SEO):</label>
                                            <input
                                                type="text"
                                                value={formData.texto_alt_popup_mobile2}
                                                onChange={(e) => handleFieldChange("texto_alt_popup_mobile2", e.target.value)}
                                                className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all shadow-sm"
                                                placeholder="Ej: Imagen móvil secundaria..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Mensaje del Botón */}
                            <div className="bg-gray-50 dark:bg-gray-800/40 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm mt-4">
                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Mensaje del Botón</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Escribe el texto que aparecerá en el botón del popup.</p>
                                <input
                                    type="text"
                                    value={formData.etiqueta.popup_button_text}
                                    onChange={(e) => handleFieldChange("popup_button_text", e.target.value, true)}
                                    className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-teal-500 dark:text-white transition-all shadow-inner"
                                    placeholder="!REGISTRARME!"
                                />
                            </div>

                            {/* Colores */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                {/* Color del Botón */}
                                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50 shadow-sm flex flex-col items-center sm:items-start">
                                    <span className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-3 w-full text-center sm:text-left">Color del Botón</span>
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white dark:border-gray-600 shadow-md cursor-pointer hover:scale-105 transition-transform shrink-0">
                                            <input
                                                type="color"
                                                value={formData.etiqueta.popup_button_color}
                                                onChange={(e) => handleFieldChange("popup_button_color", e.target.value, true)}
                                                className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Seleccionar</span>
                                            <span className="text-xs text-gray-400">fondo</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Color del Texto */}
                                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50 shadow-sm flex flex-col items-center sm:items-start">
                                    <span className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-3 w-full text-center sm:text-left">Color del Texto</span>
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white dark:border-gray-600 shadow-md cursor-pointer hover:scale-105 transition-transform shrink-0">
                                            <input
                                                type="color"
                                                value={formData.etiqueta.popup_text_color}
                                                onChange={(e) => handleFieldChange("popup_text_color", e.target.value, true)}
                                                className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Seleccionar</span>
                                            <span className="text-xs text-gray-400">texto</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'whatsapp' && (
                        <div className="space-y-6">
                            <div className="bg-gray-50 dark:bg-gray-800/40 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm">
                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2 text-emerald-600">WhatsApp</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Configura la imagen y mensaje de WhatsApp para este producto.</p>

                                <div className="flex flex-col sm:flex-row gap-6 items-start mb-6">
                                    <div className="w-full sm:w-32 h-32 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                                        {previews.imagen_whatsapp || formData.imagen_whatsapp ? (
                                            <img src={previews.imagen_whatsapp || formData.imagen_whatsapp} className="w-full h-full object-contain" />
                                        ) : (
                                            <span className="text-xs text-gray-400 font-medium">Sin imagen</span>
                                        )}
                                    </div>
                                    <div className="flex-1 w-full">
                                        <input
                                            type="file"
                                            id="input_imagen_whatsapp"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, "imagen_whatsapp")}
                                            className="hidden"
                                        />
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => document.getElementById('input_imagen_whatsapp')?.click()}
                                                className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-all shadow-md active:scale-95"
                                            >
                                                Subir Imagen WhatsApp
                                            </button>
                                            {(previews.imagen_whatsapp || formData.imagen_whatsapp) && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleClearImage("imagen_whatsapp")}
                                                    className="text-red-500 hover:text-red-600 p-2"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Mensaje de WhatsApp:</label>
                                    <WhatsappEditor
                                        defaultValue={formData.texto_alt_whatsapp}
                                        inputId="whatsappMessageProducto"
                                        updateEventName="update-whatsapp-editor-producto"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'correo' && (
                        <div className="space-y-6">
                            <div className="bg-gray-50 dark:bg-gray-800/40 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">Correo Electrónico</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Configura el título, mensaje, Boton e imagen para los emails.</p>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <input
                                        type="file"
                                        id="input_imagen_email"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, "imagen_email")}
                                        className="hidden"
                                    />
                                    <div className="flex items-center gap-3 mb-4">
                                        <button
                                            type="button"
                                            onClick={() => document.getElementById('input_imagen_email')?.click()}
                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all shadow-md active:scale-95"
                                        >
                                            Añadir Imagen Adjunta
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                            </svg>
                                        </button>
                                        {(previews.imagen_email || formData.imagen_email) && (
                                            <button
                                                type="button"
                                                onClick={() => handleClearImage("imagen_email")}
                                                className="text-red-500 hover:text-red-600 p-2 transition-colors"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>

                                    {(previews.imagen_email || formData.imagen_email) && (
                                        <div className="mb-4 w-full sm:w-48 h-32 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex items-center justify-center shadow-inner">
                                            <img src={previews.imagen_email || formData.imagen_email} className="w-full h-full object-contain" />
                                        </div>
                                    )}

                                    <div className="p-4 bg-blue-50 dark:bg-[#1e2d4a] text-blue-600 dark:text-[#8cb8ff] text-[14px] rounded-xl leading-relaxed font-medium">
                                        Recomendación para la imagen: Usa formato <span className="bg-blue-100 dark:bg-[#283e66] px-2 py-0.5 rounded text-blue-700 dark:text-[#b3d4ff] mx-0.5">webp, png o jpg</span> y un tamaño sugerido de <span className="bg-blue-100 dark:bg-[#283e66] px-2 py-0.5 rounded text-blue-700 dark:text-[#b3d4ff] mx-0.5">600x400px</span> o similar para un mejor diseño.
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">Asunto del Correo:</label>
                                        <input
                                            type="text"
                                            value={formData.asunto}
                                            onChange={(e) => handleFieldChange("asunto", e.target.value)}
                                            className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                                            placeholder="Ej: ¡Tu oferta especial de Tami!"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Cuerpo del Correo:</label>
                                        <EmailEditor
                                            defaultValue={formData.mensaje_email}
                                            inputId="emailBodyProducto"
                                            updateEventName="update-email-editor-producto"
                                        />
                                    </div>

                                    <div className="space-y-4 pt-6 mt-4 border-t border-gray-100 dark:border-gray-700/50">
                                        <h4 className="font-bold text-gray-800 dark:text-gray-100">Configuración del Botón en el Correo</h4>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Texto del Botón:</label>
                                                <input
                                                    type="text"
                                                    value={formData.email_btn_text}
                                                    onChange={(e) => handleFieldChange("email_btn_text", e.target.value)}
                                                    className="block w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                                    placeholder="Ej: COTIZAR AHORA"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Enlace del Botón (Opcional):</label>
                                                <input
                                                    type="url"
                                                    value={formData.email_btn_link}
                                                    onChange={(e) => handleFieldChange("email_btn_link", e.target.value)}
                                                    className="block w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                                    placeholder="https://..."
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50 shadow-sm flex flex-col items-center sm:items-start">
                                                <span className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-3 w-full text-center sm:text-left">Color de Fondo:</span>
                                                <div className="flex items-center gap-3">
                                                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white dark:border-gray-600 shadow-md cursor-pointer hover:scale-105 transition-transform">
                                                        <input
                                                            type="color"
                                                            value={formData.email_btn_bg_color}
                                                            onChange={(e) => handleFieldChange("email_btn_bg_color", e.target.value)}
                                                            className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-gray-900 dark:text-gray-100">{formData.email_btn_bg_color}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50 shadow-sm flex flex-col items-center sm:items-start">
                                                <span className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-3 w-full text-center sm:text-left">Color del Texto:</span>
                                                <div className="flex items-center gap-3">
                                                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white dark:border-gray-600 shadow-md cursor-pointer hover:scale-105 transition-transform">
                                                        <input
                                                            type="color"
                                                            value={formData.email_btn_text_color}
                                                            onChange={(e) => handleFieldChange("email_btn_text_color", e.target.value)}
                                                            className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-gray-900 dark:text-gray-100">{formData.email_btn_text_color}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {!formData && !loadingProducts && (
                <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl opacity-50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <p className="text-gray-500 font-medium text-lg">Selecciona un producto para comenzar a configurar su pop-up</p>
                </div>
            )}
        </div>
    );
};

export default TabProducto;
