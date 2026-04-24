import React, { useState, useEffect, useRef } from "react";
import apiClient from "../../../services/apiClient";
import { config, getApiUrl } from "../../../../config";
import { ProductoService } from "../../../services/producto.service";
import type Producto from "../../../models/Product";
import Swal from "sweetalert2";

const TabProducto: React.FC = () => {
    const [products, setProducts] = useState<Producto[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [selectedProductId, setSelectedProductId] = useState<string>("");
    const [formData, setFormData] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [previews, setPreviews] = useState<{ [key: string]: string }>({});

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

    const getFullImageUrl = (url: string) => {
        if (!url) return "";
        if (url.startsWith("http")) return url;
        return `${config.apiUrl}${url}`;
    };

    const handleProductSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setSelectedProductId(id);
        const product = products.find(p => p.id.toString() === id);
        
        if (product) {
            const imagenPopup = product.producto_imagenes?.find((img) => img.tipo === "popup");
            const imagenPopup2 = product.producto_imagenes?.find((img) => {
                const tipo = (img.tipo || "").toLowerCase();
                return tipo === "popup2" || tipo === "popup_2";
            });

            const initialData = {
                imagen_popup: imagenPopup ? getFullImageUrl(imagenPopup.url_imagen) : null,
                texto_alt_popup: imagenPopup?.texto_alt_SEO || "",
                imagen_popup2: imagenPopup2 ? getFullImageUrl(imagenPopup2.url_imagen) : null,
                texto_alt_popup2: imagenPopup2?.texto_alt_SEO || "",
                etiqueta: {
                    popup_button_color: product.etiqueta?.popup_button_color || "#008B8B",
                    popup_text_color: product.etiqueta?.popup_text_color || "#000000",
                    popup_button_text: product.etiqueta?.popup_button_text || "¡COTIZA AHORA!",
                }
            };
            setFormData(initialData);
            
            // Initial Preview Sync
            syncPreview(initialData);
        } else {
            setFormData(null);
        }
    };

    const syncPreview = (data: any) => {
        const previewSettings = {
            popup_image_url: data.imagen_popup,
            popup_image2_url: data.imagen_popup2,
            button_bg_color: data.etiqueta.popup_button_color,
            button_text_color: data.etiqueta.popup_text_color,
            button_text: data.etiqueta.popup_button_text
        };
        
        window.dispatchEvent(
            new CustomEvent("update-popup-preview", {
                detail: { settings: previewSettings },
            }),
        );
    };

    const handleFieldChange = (field: string, value: any, isEtiqueta = false) => {
        setFormData((prev: any) => {
            const newData = { ...prev };
            if (isEtiqueta) {
                newData.etiqueta = { ...newData.etiqueta, [field]: value };
            } else {
                newData[field] = value;
            }
            syncPreview(newData);
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
                handleFieldChange(field, file);
                
                // Update preview with base64 for immediate feedback
                const updatedData = { ...formData, [field]: url };
                syncPreview(updatedData);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!selectedProductId || !formData) return;

        setIsSaving(true);
        try {
            const product = products.find(p => p.id.toString() === selectedProductId);
            if (!product) throw new Error("Producto no encontrado");

            const formDataToSend = new FormData();
            
            // Required fields for update might be needed depending on backend
            // For now sending what's changed and basic info
            formDataToSend.append("nombre", product.nombre);
            formDataToSend.append("titulo", product.titulo);
            formDataToSend.append("subtitulo", product.subtitulo);
            formDataToSend.append("descripcion", product.descripcion);
            formDataToSend.append("seccion", product.seccion);
            
            // Popup Specific
            formDataToSend.append("etiqueta[popup_button_color]", formData.etiqueta.popup_button_color);
            formDataToSend.append("etiqueta[popup_text_color]", formData.etiqueta.popup_text_color);
            formDataToSend.append("etiqueta[popup_button_text]", formData.etiqueta.popup_button_text);
            
            if (formData.imagen_popup instanceof File) {
                formDataToSend.append("imagen_popup", formData.imagen_popup);
            }
            formDataToSend.append("texto_alt_popup", formData.texto_alt_popup);

            if (formData.imagen_popup2 instanceof File) {
                formDataToSend.append("imagen_popup2", formData.imagen_popup2);
                formDataToSend.append("imagen_popup_2", formData.imagen_popup2); // Compatibility
            }
            formDataToSend.append("texto_alt_popup2", formData.texto_alt_popup2);

            formDataToSend.append("_method", "PUT");

            const response = await apiClient.post(
                config.endpoints.productos.update(selectedProductId),
                formDataToSend,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            if (response.status === 200 || response.status === 201) {
                Swal.fire({
                    icon: "success",
                    title: "Configuración guardada",
                    text: "El pop-up del producto ha sido actualizado.",
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                throw new Error("Error al guardar");
            }
        } catch (error) {
            console.error("Error saving product popup:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo guardar la configuración."
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
                    {/* Recomendación de Imágenes */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-300">
                        <p className="font-bold flex items-center gap-2 mb-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            Recomendación de Imágenes
                        </p>
                        <p className="opacity-90">
                            Usa imágenes <strong>WebP (800x1200px)</strong>. La principal va a la izquierda y la secundaria (fondo) a la derecha.
                        </p>
                    </div>

                    {/* Imagen 1 */}
                    <div className="bg-gray-50 dark:bg-gray-800/40 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Imagen Principal del Pop-up</h3>
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
                                    <button
                                        type="button"
                                        onClick={() => document.getElementById('input_imagen_popup')?.click()}
                                        className="inline-flex items-center gap-2 px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-lg transition-all shadow-md active:scale-95 w-fit"
                                    >
                                        Seleccionar Imagen
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                        </svg>
                                    </button>
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
                    <div className="bg-gray-50 dark:bg-gray-800/40 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Imagen Secundaria / Fondo</h3>
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
                                    <button
                                        type="button"
                                        onClick={() => document.getElementById('input_imagen_popup2')?.click()}
                                        className="inline-flex items-center gap-2 px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-lg transition-all shadow-md active:scale-95 w-fit"
                                    >
                                        Seleccionar Imagen
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                        </svg>
                                    </button>
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

                    {/* Mensaje del Botón */}
                    <div className="bg-[#1e293b] p-6 rounded-2xl shadow-xl space-y-3 border border-gray-700/50">
                        <h3 className="text-xl font-bold text-white tracking-tight">Mensaje del Botón</h3>
                        <p className="text-gray-400 text-xs">Escribe el texto que aparecerá en el botón del popup.</p>
                        <input 
                            type="text"
                            value={formData.etiqueta.popup_button_text}
                            onChange={(e) => handleFieldChange("popup_button_text", e.target.value, true)}
                            className="w-full p-3 rounded-xl border border-gray-600 bg-gray-800/50 text-white font-bold text-base focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-inner"
                            placeholder="!REGISTRARME!"
                        />
                    </div>

                    {/* Colores */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Color del Botón */}
                        <div className="p-5 rounded-2xl bg-[#1e293b] shadow-xl flex flex-col items-center sm:items-start border border-gray-700/50">
                            <span className="block text-sm font-bold text-white mb-4 uppercase tracking-widest opacity-80">Color del Botón</span>
                            <div className="flex items-center gap-3">
                                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 shadow-2xl cursor-pointer hover:scale-105 transition-transform shrink-0">
                                    <input 
                                        type="color" 
                                        value={formData.etiqueta.popup_button_color}
                                        onChange={(e) => handleFieldChange("popup_button_color", e.target.value, true)}
                                        className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-gray-300">Seleccionar</span>
                                    <span className="text-xs text-gray-500">fondo</span>
                                </div>
                            </div>
                        </div>

                        {/* Color del Texto */}
                        <div className="p-5 rounded-2xl bg-[#1e293b] shadow-xl flex flex-col items-center sm:items-start border border-gray-700/50">
                            <span className="block text-sm font-bold text-white mb-4 uppercase tracking-widest opacity-80">Color del Texto</span>
                            <div className="flex items-center gap-3">
                                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 shadow-2xl cursor-pointer hover:scale-105 transition-transform shrink-0">
                                    <input 
                                        type="color" 
                                        value={formData.etiqueta.popup_text_color}
                                        onChange={(e) => handleFieldChange("popup_text_color", e.target.value, true)}
                                        className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-gray-300">Seleccionar</span>
                                    <span className="text-xs text-gray-500">texto</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Botón Guardar */}
                    <div className="flex justify-end pt-4">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="inline-flex items-center gap-2 px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isSaving ? "Guardando..." : "Guardar Configuración"}
                            {!isSaving && (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            )}
                        </button>
                    </div>
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
