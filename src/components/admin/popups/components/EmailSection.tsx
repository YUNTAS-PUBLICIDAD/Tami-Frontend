import React, { useEffect } from 'react';
import EmailEditor from '../EmailEditor';
import { ImageUploadField } from './ImageUploadField';
import { ColorPickerField } from './ColorPickerField';
import type { ProductFormData } from '../types/productTab.types';
import { ProductSyncService } from '../services/productSyncService';

interface EmailSectionProps {
    formData: ProductFormData | null;
    previews: Record<string, string | File | null>;
    selectedEmail: number;
    onSelectedEmailChange: (emailIndex: number) => void;
    onFieldChange: (field: string, value: string | number | File | null) => void;
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
    selectedEmail,
    onSelectedEmailChange,
    onFieldChange,
    onFileChange,
    onClearImage
}) => {
    if (!formData) return null;

    useEffect(() => {
        // Sync preview to currently selected email when selection changes
        ProductSyncService.syncEmailPreview(formData, previews, {}, selectedEmail);
    }, [selectedEmail, formData, previews]);

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
                    <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/30 flex flex-col sm:flex-row items-center gap-4">
                        <div className="flex items-center gap-3 shrink-0">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                                @
                            </div>
                            <span className="text-sm font-bold text-blue-900 dark:text-blue-100">Configuración:</span>
                        </div>
                        <div className="relative flex-1 w-full">
                            <select
                                value={selectedEmail}
                                onChange={(e) => onSelectedEmailChange(Number(e.target.value))}
                                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none shadow-sm cursor-pointer transition-all appearance-none"
                            >
                                <option value={1}>📧 Correo 1</option>
                                <option value={2}>📧 Correo 2</option>
                                <option value={3}>📧 Correo 3</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 dark:text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    {/* Email Image */}
                    {/* Image and fields for selected email */}
                    <ImageUploadField
                        label={`Imagen del Correo ${selectedEmail}`}
                        description=""
                        fieldName={`imagen_email_${selectedEmail}`}
                        preview={(previews as any)[`imagen_email_${selectedEmail}`]}
                        value={(formData as any)[`imagen_email_${selectedEmail}`]}
                        onFileChange={onFileChange}
                        onClearImage={onClearImage}
                        previewWidth="sm:w-32"
                        previewHeight="h-32"
                        buttonLabel={`Subir Imagen Correo ${selectedEmail}`}
                    />

                    {/* Recomendación de Imagen */}
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm rounded-xl border border-blue-100 dark:border-blue-800/20">
                        <span className="font-medium">Recomendación para la imagen:</span> Usa formato <span className="bg-blue-100 dark:bg-blue-900/50 px-1.5 py-0.5 rounded text-blue-700 dark:text-blue-300 font-medium">webp, png o jpg</span> y un tamaño sugerido de <span className="bg-blue-100 dark:bg-blue-900/50 px-1.5 py-0.5 rounded text-blue-700 dark:text-blue-300 font-medium">600x400px</span> o similar para un mejor diseño.
                    </div>

                    {/* Email Subject */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">
                            Asunto del Correo:
                        </label>
                        <input
                            type="text"
                            value={(formData as any)[`asunto_${selectedEmail}`] || ''}
                            onChange={(e) => onFieldChange(`asunto_${selectedEmail}`, e.target.value)}
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
                            defaultValue={(formData as any)[`mensaje_email_${selectedEmail}`]}
                            inputId={`emailBodyProducto${selectedEmail}`}
                            updateEventName={`update-email-editor-producto-${selectedEmail}`}
                            previewEventName={`update-email-preview-${selectedEmail}`}
                            onChangeHtml={(html) => onFieldChange(`mensaje_email_${selectedEmail}`, html)}
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
                                    value={(formData as any)[`email_btn_text_${selectedEmail}`] || ''}
                                    onChange={(e) => onFieldChange(`email_btn_text_${selectedEmail}`, e.target.value)}
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
                                    value={(formData as any)[`email_btn_link_${selectedEmail}`] || ''}
                                    onChange={(e) => onFieldChange(`email_btn_link_${selectedEmail}`, e.target.value)}
                                    className="block w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

                        {/* Button Colors */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <ColorPickerField
                                label="Color de Fondo"
                                color={(formData as any)[`email_btn_bg_color_${selectedEmail}`]}
                                onChange={(color) => onFieldChange(`email_btn_bg_color_${selectedEmail}`, color)}
                                isNested={true}
                            />
                            <ColorPickerField
                                label="Color del Texto"
                                color={(formData as any)[`email_btn_text_color_${selectedEmail}`]}
                                onChange={(color) => onFieldChange(`email_btn_text_color_${selectedEmail}`, color)}
                                isNested={true}
                            />
                            <div className="col-span-1 sm:col-span-2 mt-2">
                                <div className="rounded-3xl border border-blue-100 dark:border-blue-800/30 bg-blue-50/70 dark:bg-blue-950/20 p-4">
                                    <label className="block text-sm font-bold text-blue-900 dark:text-blue-100 mb-3">Temporizador de envío</label>
                                    <div className="relative max-w-xs">
                                        <select
                                            value={(formData as any)[`email_time_${selectedEmail}`] ?? 0}
                                            onChange={(e) => onFieldChange(`email_time_${selectedEmail}`, Number(e.target.value))}
                                            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 pr-10 text-sm font-semibold text-gray-800 dark:text-gray-100 shadow-sm outline-none transition focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 cursor-pointer appearance-none"
                                        >
                                            <option value={-1}>No enviar</option>
                                            <option value={0}>Instantáneo</option>
                                            <option value={1}>1 minuto</option>
                                            <option value={2}>2 minutos</option>
                                            <option value={3}>3 minutos</option>
                                            <option value={4}>4 minutos</option>
                                            <option value={5}>5 minutos</option>
                                            <option value={10}>10 minutos</option>
                                            <option value={15}>15 minutos</option>
                                            <option value={20}>20 minutos</option>
                                            <option value={30}>30 minutos</option>
                                            <option value={60}>1 hora</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400 dark:text-gray-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailSection;
