import React from 'react';
import type { ProductFormData } from '../types/productTab.types';
import { ImageUploadField } from './ImageUploadField';
import { ColorPickerField } from './ColorPickerField';

interface PopupSectionProps {
    formData: ProductFormData | null;
    previews: Record<string, string | File | null>;
    onFieldChange: (field: string, value: string | File | null, isNested?: boolean) => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>, field: string) => void;
    onClearImage: (field: string) => void;
}

/**
 * PopupSection Component
 * Sección de configuración de Pop-ups
 * 
 * Incluye:
 * - 4 cargas de imágenes (popup, popup2, popup_mobile, popup_mobile2)
 * - Campos de texto ALT para SEO
 * - Mensaje del botón
 * - Selectores de color (botón y texto)
 */
export const PopupSection: React.FC<PopupSectionProps> = ({
    formData,
    previews,
    onFieldChange,
    onFileChange,
    onClearImage
}) => {
    if (!formData) return null;

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Sección Desktop */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                    <div className="p-2 bg-teal-100 dark:bg-teal-900/40 rounded-lg text-teal-600 dark:text-teal-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                        Vistas de Escritorio
                    </h3>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {/* Imagen 1 */}
                    <div className="bg-white dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
                        <ImageUploadField
                            label="Imagen Principal (Izquierda)"
                            description="Resolución: 448x550px. Máx 2MB (webp)."
                            fieldName="imagen_popup"
                            preview={previews.imagen_popup}
                            value={formData.imagen_popup}
                            onFileChange={onFileChange}
                            onClearImage={onClearImage}
                            buttonLabel="Seleccionar"
                            previewWidth="w-20"
                            previewHeight="h-20"
                        />
                        <div className="pt-2">
                            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-widest">
                                Texto ALT (SEO)
                            </label>
                            <input
                                type="text"
                                value={formData.texto_alt_popup}
                                onChange={(e) => onFieldChange("texto_alt_popup", e.target.value)}
                                className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-xs focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                                placeholder="Ej: Ventilador holográfico..."
                            />
                        </div>
                    </div>

                    {/* Imagen 2 */}
                    <div className="bg-white dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
                        <ImageUploadField
                            label="Imagen Secundaria (Derecha)"
                            description="Resolución: 448x550px. Máx 2MB (webp)."
                            fieldName="imagen_popup2"
                            preview={previews.imagen_popup2}
                            value={formData.imagen_popup2}
                            onFileChange={onFileChange}
                            onClearImage={onClearImage}
                            buttonLabel="Seleccionar"
                            previewWidth="w-20"
                            previewHeight="h-20"
                        />
                        <div className="pt-2">
                            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-widest">
                                Texto ALT (SEO)
                            </label>
                            <input
                                type="text"
                                value={formData.texto_alt_popup2}
                                onChange={(e) => onFieldChange("texto_alt_popup2", e.target.value)}
                                className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-xs focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                                placeholder="Ej: Fondo decorativo..."
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Sección Móvil */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg text-indigo-600 dark:text-indigo-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                        Vistas de Móvil
                    </h3>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {/* Imagen 3 - Móvil */}
                    <div className="bg-white dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
                        <ImageUploadField
                            label="Imagen Móvil Principal"
                            description="Resolución: 448x320px. Máx 2MB (webp)."
                            fieldName="imagen_popup_mobile"
                            preview={previews.imagen_popup_mobile}
                            value={formData.imagen_popup_mobile}
                            onFileChange={onFileChange}
                            onClearImage={onClearImage}
                            buttonLabel="Seleccionar"
                            previewWidth="w-20"
                            previewHeight="h-20"
                        />
                        <div className="pt-2">
                            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-widest">
                                Texto ALT (SEO)
                            </label>
                            <input
                                type="text"
                                value={formData.texto_alt_popup_mobile}
                                onChange={(e) => onFieldChange("texto_alt_popup_mobile", e.target.value)}
                                className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-xs focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                                placeholder="Ej: Imagen móvil principal..."
                            />
                        </div>
                    </div>

                    {/* Imagen 4 - Móvil 2 */}
                    <div className="bg-white dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
                        <ImageUploadField
                            label="Imagen Móvil Secundaria"
                            description="Resolución: 448x320px. Máx 2MB (webp)."
                            fieldName="imagen_popup_mobile2"
                            preview={previews.imagen_popup_mobile2}
                            value={formData.imagen_popup_mobile2}
                            onFileChange={onFileChange}
                            onClearImage={onClearImage}
                            buttonLabel="Seleccionar"
                            previewWidth="w-20"
                            previewHeight="h-20"
                        />
                        <div className="pt-2">
                            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-widest">
                                Texto ALT (SEO)
                            </label>
                            <input
                                type="text"
                                value={formData.texto_alt_popup_mobile2}
                                onChange={(e) => onFieldChange("texto_alt_popup_mobile2", e.target.value)}
                                className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-xs focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                                placeholder="Ej: Imagen móvil secundaria..."
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Estilo y Botón */}
            <div className="bg-gray-50 dark:bg-gray-800/40 p-6 rounded-3xl border border-gray-100 dark:border-gray-700/50 shadow-sm space-y-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <span className="w-2 h-8 bg-teal-500 rounded-full"></span>
                    Botón y Colores
                </h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest">
                            Texto del Botón:
                        </label>
                        <input
                            type="text"
                            value={formData.etiqueta.popup_button_text}
                            onChange={(e) => onFieldChange("popup_button_text", e.target.value, true)}
                            className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-teal-500 dark:text-white transition-all shadow-inner"
                            placeholder="!REGISTRARME!"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <ColorPickerField
                            label="Fondo Botón"
                            description=""
                            color={formData.etiqueta.popup_button_color}
                            onChange={(color) => onFieldChange("popup_button_color", color, true)}
                            isNested={true}
                        />
                        <ColorPickerField
                            label="Texto Botón"
                            description=""
                            color={formData.etiqueta.popup_text_color}
                            onChange={(color) => onFieldChange("popup_text_color", color, true)}
                            isNested={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PopupSection;
