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
        <div className="space-y-6">
            {/* Imagen 1 */}
            <div>
                <ImageUploadField
                    label="Primera Imagen"
                    description="Sube una imagen promocional para tu popup. Resolución recomendada: 448x550px. La imagen debe pesar 2MB como máximo, recomendación formato webp."
                    fieldName="imagen_popup"
                    preview={previews.imagen_popup}
                    value={formData.imagen_popup}
                    onFileChange={onFileChange}
                    onClearImage={onClearImage}
                    buttonLabel="Seleccionar Imagen 1"
                />
                <div className="mt-4">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                        Texto ALT (SEO):
                    </label>
                    <input
                        type="text"
                        value={formData.texto_alt_popup}
                        onChange={(e) => onFieldChange("texto_alt_popup", e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all shadow-sm"
                        placeholder="Ej: Ventilador holográfico Tami..."
                    />
                </div>
            </div>

            {/* Imagen 2 */}
            <div>
                <ImageUploadField
                    label="Segunda Imagen"
                    description="Segunda imagen para el popup (mitad derecha). Resolución recomendada: 448x550px. La imagen debe pesar 2MB como máximo, recomendación formato webp."
                    fieldName="imagen_popup2"
                    preview={previews.imagen_popup2}
                    value={formData.imagen_popup2}
                    onFileChange={onFileChange}
                    onClearImage={onClearImage}
                    buttonLabel="Seleccionar Imagen 2"
                />
                <div className="mt-4">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                        Texto ALT (SEO):
                    </label>
                    <input
                        type="text"
                        value={formData.texto_alt_popup2}
                        onChange={(e) => onFieldChange("texto_alt_popup2", e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all shadow-sm"
                        placeholder="Ej: Fondo decorativo azul..."
                    />
                </div>
            </div>

            {/* Imagen 3 - Móvil */}
            <div>
                <ImageUploadField
                    label="Primera Imagen Móvil"
                    description="Imagen para vista en dispositivos móviles. Resolución recomendada: 448x320px. La imagen debe pesar 2MB como máximo, recomendación formato webp."
                    fieldName="imagen_popup_mobile"
                    preview={previews.imagen_popup_mobile}
                    value={formData.imagen_popup_mobile}
                    onFileChange={onFileChange}
                    onClearImage={onClearImage}
                    buttonLabel="Seleccionar Imagen Móvil 1"
                />
                <div className="mt-4">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                        Texto ALT (SEO):
                    </label>
                    <input
                        type="text"
                        value={formData.texto_alt_popup_mobile}
                        onChange={(e) => onFieldChange("texto_alt_popup_mobile", e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all shadow-sm"
                        placeholder="Ej: Imagen móvil principal..."
                    />
                </div>
            </div>

            {/* Imagen 4 - Móvil 2 */}
            <div>
                <ImageUploadField
                    label="Segunda Imagen Móvil"
                    description="Segunda imagen para vista en dispositivos móviles (abajo). Resolución recomendada: 448x320px. La imagen debe pesar 2MB como máximo, recomendación formato webp."
                    fieldName="imagen_popup_mobile2"
                    preview={previews.imagen_popup_mobile2}
                    value={formData.imagen_popup_mobile2}
                    onFileChange={onFileChange}
                    onClearImage={onClearImage}
                    buttonLabel="Seleccionar Imagen Móvil 2"
                />
                <div className="mt-4">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                        Texto ALT (SEO):
                    </label>
                    <input
                        type="text"
                        value={formData.texto_alt_popup_mobile2}
                        onChange={(e) => onFieldChange("texto_alt_popup_mobile2", e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all shadow-sm"
                        placeholder="Ej: Imagen móvil secundaria..."
                    />
                </div>
            </div>

            {/* Mensaje del Botón */}
            <div className="bg-gray-50 dark:bg-gray-800/40 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                    Mensaje del Botón
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Escribe el texto que aparecerá en el botón del popup.
                </p>
                <input
                    type="text"
                    value={formData.etiqueta?.popup_button_text || ""}
                    onChange={(e) => onFieldChange("popup_button_text", e.target.value, true)}
                    className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-teal-500 dark:text-white transition-all shadow-inner"
                    placeholder="!REGISTRARME!"
                />
            </div>

            {/* Colores */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ColorPickerField
                    label="Color del Botón"
                    description="fondo"
                    color={formData.etiqueta?.popup_button_color || "#4FB9AF"}
                    onChange={(color) => onFieldChange("popup_button_color", color, true)}
                    isNested={true}
                />
                <ColorPickerField
                    label="Color del Texto"
                    description="texto"
                    color={formData.etiqueta?.popup_text_color || "#ffffff"}
                    onChange={(color) => onFieldChange("popup_text_color", color, true)}
                    isNested={true}
                />
            </div>
        </div>
    );
};

export default PopupSection;
