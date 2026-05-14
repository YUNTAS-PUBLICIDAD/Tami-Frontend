import React from 'react';
import EmailEditor from '../EmailEditor';
import { ImageUploadField } from './ImageUploadField';
import { ColorPickerField } from './ColorPickerField';
import type { ProductFormData } from '../types/productTab.types';

interface EmailSectionProps {
    formData: ProductFormData | null;
    previews: Record<string, string | File | null>;
    onFieldChange: (field: string, value: string | File | null) => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>, field: string) => void;
    onClearImage: (field: string) => void;
}

/**
 * EmailSection Component
 * Sección de configuración de Correo
 * 
 * Incluye:
 * - Imagen del correo
 * - Asunto del correo
 * - Cuerpo del correo
 * - Configuración del botón (texto y enlace)
 * - Colores del botón
 */
export const EmailSection: React.FC<EmailSectionProps> = ({
    formData,
    previews,
    onFieldChange,
    onFileChange,
    onClearImage
}) => {
    if (!formData) return null;

    return (
        <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800/40 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2 text-blue-600">
                    Correo Electrónico
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Configura la imagen y mensaje de correo para este producto.
                </p>

                <div className="space-y-6">
                    {/* Email Image */}
                    <ImageUploadField
                        label="Imagen del Correo"
                        description=""
                        fieldName="imagen_email"
                        preview={previews.imagen_email}
                        value={formData.imagen_email}
                        onFileChange={onFileChange}
                        onClearImage={onClearImage}
                        previewWidth="sm:w-32"
                        previewHeight="h-32"
                        buttonLabel="Subir Imagen Correo"
                    />

                    {/* Email Subject */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">
                            Asunto del Correo:
                        </label>
                        <input
                            type="text"
                            value={formData.asunto}
                            onChange={(e) => onFieldChange("asunto", e.target.value)}
                            className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                            placeholder="Ej: ¡Tu oferta especial de Tami!"
                        />
                    </div>

                    {/* Email Body */}
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                            Cuerpo del Correo:
                        </label>
                        <EmailEditor
                            defaultValue={formData.mensaje_email}
                            inputId="emailBodyProducto"
                            updateEventName="update-email-editor-producto"
                            onChangeHtml={(html) => onFieldChange("mensaje_email", html)}
                        />
                    </div>

                    {/* Email Button Configuration */}
                    <div className="space-y-4 pt-6 mt-4 border-t border-gray-100 dark:border-gray-700/50">
                        <h4 className="font-bold text-gray-800 dark:text-gray-100">
                            Configuración del Botón en el Correo
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Texto del Botón:
                                </label>
                                <input
                                    type="text"
                                    value={formData.email_btn_text}
                                    onChange={(e) => onFieldChange("email_btn_text", e.target.value)}
                                    className="block w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                    placeholder="Ej: COTIZAR AHORA"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Enlace del Botón (Opcional):
                                </label>
                                <input
                                    type="url"
                                    value={formData.email_btn_link}
                                    onChange={(e) => onFieldChange("email_btn_link", e.target.value)}
                                    className="block w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

                        {/* Button Colors */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <ColorPickerField
                                label="Color de Fondo"
                                color={formData.email_btn_bg_color}
                                onChange={(color) => onFieldChange("email_btn_bg_color", color)}
                                isNested={true}
                            />
                            <ColorPickerField
                                label="Color del Texto"
                                color={formData.email_btn_text_color}
                                onChange={(color) => onFieldChange("email_btn_text_color", color)}
                                isNested={true}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailSection;
