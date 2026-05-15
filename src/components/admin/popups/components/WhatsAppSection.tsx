import React from 'react';
import WhatsappEditor from '../WhatsappEditor';
import { ImageUploadField } from './ImageUploadField';
import type { ProductFormData } from '../types/productTab.types';

interface WhatsAppSectionProps {
    formData: ProductFormData | null;
    previews: Record<string, string | File | null>;
    onFieldChange: (field: string, value: string | File | number | null, isNested?: boolean) => void;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>, field: string) => void;
    onClearImage: (field: string) => void;
    whatsappSelected: number;
    onWhatsappSelectChange: (messageNumber: number) => void;
}

/**
 * WhatsAppSection Component
 * Sección de configuración de WhatsApp
 * 
 * Incluye:
 * - 3 mensajes configurables
 * - Imagen para cada mensaje
 * - Tiempo de espera entre mensajes
 * - Editor de mensajes WhatsApp
 */
export const WhatsAppSection: React.FC<WhatsAppSectionProps> = ({
    formData,
    previews,
    onFieldChange,
    onFileChange,
    onClearImage,
    whatsappSelected,
    onWhatsappSelectChange
}) => {
    if (!formData) return null;

    return (
        <div className="space-y-6">
            {/* Message Selector */}
            <div className="flex flex-col gap-3 p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"></path>
                        </svg>
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100">Configuración:</h3>
                </div>

                <select
                    id="whatsappMessageSelectorProducto"
                    className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all cursor-pointer"
                    value={whatsappSelected}
                    onChange={(e) => onWhatsappSelectChange(parseInt(e.target.value))}
                >
                    <option value={1}>🟢 WhatsApp Mensaje 1</option>
                    <option value={2}>🟡 WhatsApp Mensaje 2</option>
                    <option value={3}>🟠 WhatsApp Mensaje 3</option>
                </select>
            </div>

            {/* Message 1 */}
            {whatsappSelected === 1 && (
                <div className="bg-gray-50 dark:bg-gray-800/40 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm space-y-6 animate-in fade-in duration-300">
                    <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                            <span className="font-bold">1</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Primer Mensaje</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100/50 dark:border-blue-800/30 p-3 rounded-xl">
                            <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
                                <span className="font-bold">Recomendación para la imagen:</span> Usa formato 
                                <span className="bg-blue-100 dark:bg-blue-800 px-1 rounded text-blue-800 dark:text-blue-200 mx-1">webp, png o jpg</span> 
                                y un tamaño sugerido de 
                                <span className="bg-blue-100 dark:bg-blue-800 px-1 rounded text-blue-800 dark:text-blue-200 mx-1">600x400px</span> 
                                o similar para un mejor diseño.
                            </p>
                        </div>
                        <ImageUploadField
                            label="Imagen del Mensaje 1"
                            description=""
                            fieldName="imagen_whatsapp"
                            preview={previews.imagen_whatsapp}
                            value={formData.imagen_whatsapp}
                            onFileChange={onFileChange}
                            onClearImage={onClearImage}
                            previewWidth="w-24"
                            previewHeight="h-24"
                            buttonLabel="Subir Imagen"
                        />


                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Mensaje de WhatsApp:</label>
                            <WhatsappEditor
                                defaultValue={formData.texto_alt_whatsapp}
                                inputId="whatsappMessageProducto"
                                updateEventName="update-whatsapp-editor-producto"
                                previewEventName="update-whatsapp-preview"
                            />
                        </div>

                        <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Tiempo de aparición (minutos):</label>
                            <select
                                value={formData.whatsapp_time_1}
                                onChange={(e) => onFieldChange("whatsapp_time_1", parseInt(e.target.value) || 0)}
                                className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm cursor-pointer"
                            >
                                <option value={0}>Inmediato</option>
                                <option value={1}>1 minuto</option>
                                <option value={5}>5 minutos</option>
                                <option value={10}>10 minutos</option>
                                <option value={30}>30 minutos</option>
                                <option value={45}>45 minutos</option>
                                <option value={60}>1 hora</option>
                            </select>
                            <p className="text-[10px] text-gray-500 italic">Envío inmediato al suscribirse.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Message 2 */}
            {whatsappSelected === 2 && (
                <div className="bg-gray-50 dark:bg-gray-800/40 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm space-y-6 animate-in fade-in duration-300">
                    <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                            <span className="font-bold">2</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Segundo Mensaje</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100/50 dark:border-blue-800/30 p-3 rounded-xl">
                            <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
                                <span className="font-bold">Recomendación para la imagen:</span> Usa formato 
                                <span className="bg-blue-100 dark:bg-blue-800 px-1 rounded text-blue-800 dark:text-blue-200 mx-1">webp, png o jpg</span> 
                                y un tamaño sugerido de 
                                <span className="bg-blue-100 dark:bg-blue-800 px-1 rounded text-blue-800 dark:text-blue-200 mx-1">600x400px</span> 
                                o similar para un mejor diseño.
                            </p>
                        </div>
                        <ImageUploadField
                            label="Imagen del Mensaje 2"
                            description=""
                            fieldName="imagen_whatsapp_2"
                            preview={previews.imagen_whatsapp_2}
                            value={formData.imagen_whatsapp_2}
                            onFileChange={onFileChange}
                            onClearImage={onClearImage}
                            previewWidth="w-24"
                            previewHeight="h-24"
                            buttonLabel="Subir Imagen"
                        />


                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Mensaje de WhatsApp:</label>
                            <WhatsappEditor
                                defaultValue={formData.mensaje_whatsapp_2}
                                inputId="whatsappMessageProducto2"
                                updateEventName="update-whatsapp-editor-producto-2"
                                previewEventName="update-whatsapp-preview-2"
                            />
                        </div>

                        <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Tiempo de espera (minutos):</label>
                            <select
                                value={formData.whatsapp_time_2}
                                onChange={(e) => onFieldChange("whatsapp_time_2", parseInt(e.target.value) || 0)}
                                className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm cursor-pointer"
                            >
                                <option value={0}>Inmediato</option>
                                <option value={1}>1 minuto</option>
                                <option value={5}>5 minutos</option>
                                <option value={10}>10 minutos</option>
                                <option value={30}>30 minutos</option>
                                <option value={45}>45 minutos</option>
                                <option value={60}>1 hora</option>
                            </select>
                            <p className="text-[10px] text-gray-500 italic">Tiempo después del mensaje 1.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Message 3 */}
            {whatsappSelected === 3 && (
                <div className="bg-gray-50 dark:bg-gray-800/40 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm space-y-6 animate-in fade-in duration-300">
                    <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                            <span className="font-bold">3</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Tercer Mensaje</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100/50 dark:border-blue-800/30 p-3 rounded-xl">
                            <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
                                <span className="font-bold">Recomendación para la imagen:</span> Usa formato 
                                <span className="bg-blue-100 dark:bg-blue-800 px-1 rounded text-blue-800 dark:text-blue-200 mx-1">webp, png o jpg</span> 
                                y un tamaño sugerido de 
                                <span className="bg-blue-100 dark:bg-blue-800 px-1 rounded text-blue-800 dark:text-blue-200 mx-1">600x400px</span> 
                                o similar para un mejor diseño.
                            </p>
                        </div>
                        <ImageUploadField
                            label="Imagen del Mensaje 3"
                            description=""
                            fieldName="imagen_whatsapp_3"
                            preview={previews.imagen_whatsapp_3}
                            value={formData.imagen_whatsapp_3}
                            onFileChange={onFileChange}
                            onClearImage={onClearImage}
                            previewWidth="w-24"
                            previewHeight="h-24"
                            buttonLabel="Subir Imagen"
                        />


                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Mensaje de WhatsApp:</label>
                            <WhatsappEditor
                                defaultValue={formData.mensaje_whatsapp_3}
                                inputId="whatsappMessageProducto3"
                                updateEventName="update-whatsapp-editor-producto-3"
                                previewEventName="update-whatsapp-preview-3"
                            />
                        </div>

                        <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Tiempo de espera (minutos):</label>
                            <select
                                value={formData.whatsapp_time_3}
                                onChange={(e) => onFieldChange("whatsapp_time_3", parseInt(e.target.value) || 0)}
                                className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm cursor-pointer"
                            >
                                <option value={0}>Inmediato</option>
                                <option value={1}>1 minuto</option>
                                <option value={5}>5 minutos</option>
                                <option value={10}>10 minutos</option>
                                <option value={30}>30 minutos</option>
                                <option value={45}>45 minutos</option>
                                <option value={60}>1 hora</option>
                            </select>
                            <p className="text-[10px] text-gray-500 italic">Tiempo después del mensaje 2.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WhatsAppSection;
