import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import type Producto from "src/models/Product";
import { useWhatsapp } from "src/hooks/admin/whatsapp/useWhatsapp";
import type { WhatsappPlantillaInput } from "src/models/whatsapp";

interface SendWhatsappFormProps {
    onClose: () => void;
    products: Producto[];
    isConnected: boolean;
}

const defaultFormData: WhatsappPlantillaInput = {
    producto_id: undefined,
    mensaje: "",
    imagen_principal: null,
};

export default function SendWhatsappForm({ onClose, products, isConnected }: SendWhatsappFormProps) {
    const {
        getWhatsappPlantilla,
        getWhatsappPlantillaDefault,
        whatsappPlantilla,
        saveWhatsappPlantilla,
        saveWhatsappPlantillaDefault,
        sendWhatsappCampana,
        isLoading,
        isSaving,
        isActivating,
        clearWhatsappPlantilla,
        error,
    } = useWhatsapp();

    const [formData, setFormData] = useState<WhatsappPlantillaInput>(defaultFormData);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    // Cargar plantilla cuando cambia el producto
    useEffect(() => {
        clearWhatsappPlantilla();
        if (formData.producto_id === undefined) {
            setFormData(prev => ({ ...prev, mensaje: "", imagen_principal: null }));
            setPreviewImage(null);
            return;
        }

        if (formData.producto_id === 0) {
            getWhatsappPlantillaDefault();
        } else {
            getWhatsappPlantilla(formData.producto_id);
        }
    }, [formData.producto_id, getWhatsappPlantilla, getWhatsappPlantillaDefault]);

    useEffect(() => {
        if (!whatsappPlantilla) {
            setFormData(prev => ({ ...prev, mensaje: "", imagen_principal: null }));
            setPreviewImage(null);
            return;
        }

        setFormData({
            producto_id: whatsappPlantilla.producto_id || 0,
            mensaje: whatsappPlantilla.mensaje || "",
            imagen_principal: null, // No podemos setear el File desde la URL
        });

        if (whatsappPlantilla.imagen_principal) {
            setPreviewImage(whatsappPlantilla.imagen_principal);
        }
    }, [whatsappPlantilla]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData(prev => ({ ...prev, imagen_principal: file }));
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.producto_id === undefined) {
            Swal.fire({ icon: 'warning', title: 'Atención', text: 'Selecciona un producto' });
            return;
        }
        if (!formData.mensaje.trim()) {
            Swal.fire({ icon: 'warning', title: 'Atención', text: 'El mensaje no puede estar vacío' });
            return;
        }

        const result = formData.producto_id === 0
            ? await saveWhatsappPlantillaDefault(formData)
            : await saveWhatsappPlantilla(formData);

        if (result.success) {
            Swal.fire({ icon: 'success', title: 'Éxito', text: 'Plantilla guardada correctamente', timer: 1500 });
            // No cerramos el modal aquí por si quiere enviar después
        } else {
            Swal.fire({ icon: 'error', title: 'Error', text: result.message || 'Error guardando plantilla' });
        }
    };

    const handleActivateCampaign = async () => {
        if (formData.producto_id === undefined || formData.producto_id === 0) {
            Swal.fire({ icon: 'warning', title: 'Atención', text: 'Selecciona un producto específico para la campaña' });
            return;
        }

        const confirm = await Swal.fire({
            title: '¿Iniciar campaña masiva?',
            text: 'Se enviará este mensaje a todos los prospectos interesados en este producto.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#14b8a6',
            confirmButtonText: 'Sí, iniciar envío',
            cancelButtonText: 'Cancelar'
        });

        if (!confirm.isConfirmed) return;

        const result = await sendWhatsappCampana(formData.producto_id);

        if (result.success) {
            Swal.fire({
                icon: 'success',
                title: 'Campaña Finalizada',
                html: `<div class="text-left"><p>Total Leads: <b>${result.total_leads}</b></p><p>Exitosos: <span class="text-green-600"><b>${result.exitosos}</b></span></p><p>Fallidos: <span class="text-red-600"><b>${result.fallidos}</b></span></p></div>`
            });
        } else {
            Swal.fire({ icon: 'error', title: 'Error', text: result.message || 'Error enviando campaña' });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn">
            {!isConnected && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-sm">
                        <b>WhatsApp no está conectado.</b> Ve a la pestaña "Conexión" para escanear el código QR antes de enviar.
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Columna Izquierda: Configuración */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 border-b pb-2">Configuración de Campaña</h3>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-400">Producto Relacionado</label>
                            <select
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                                value={formData.producto_id ?? ""}
                                onChange={(e) => setFormData(prev => ({ ...prev, producto_id: e.target.value === "" ? undefined : Number(e.target.value) }))}
                            >
                                <option value="">Selecciona un producto...</option>
                                <option value="0">Plantilla por Defecto</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.nombre}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-400">Mensaje de WhatsApp</label>
                            <textarea
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-teal-500 transition-all min-h-[150px]"
                                placeholder="Escribe el mensaje que recibirán los clientes..."
                                value={formData.mensaje}
                                onChange={(e) => setFormData(prev => ({ ...prev, mensaje: e.target.value }))}
                            />
                            <p className="text-xs text-gray-500 italic">Puedes usar variables como {'{nombre}'} si tu API lo soporta.</p>
                        </div>
                    </div>
                </div>

                {/* Columna Derecha: Multimedia */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 border-b pb-2">Imagen de Campaña</h3>

                        <div className="relative group">
                            <div className={`aspect-video w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all ${previewImage ? 'border-teal-500' : 'border-gray-300 hover:border-teal-400'}`}>
                                {previewImage ? (
                                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center p-6">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 group-hover:text-teal-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 01-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="mt-2 text-sm text-gray-500 font-medium">Click para subir imagen</p>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={handleFileChange}
                                    accept="image/*"
                                />
                            </div>
                            {previewImage && (
                                <button
                                    type="button"
                                    onClick={() => { setPreviewImage(null); setFormData(prev => ({ ...prev, imagen_principal: null })) }}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100 dark:border-gray-700">
                <button
                    type="submit"
                    disabled={isLoading || isSaving || isActivating}
                    className="flex-1 bg-white text-teal-600 border-2 border-teal-500 hover:bg-teal-50 px-8 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                    {isSaving ? <AiOutlineLoading3Quarters className="animate-spin" /> : null}
                    {isSaving ? "Guardando..." : "Guardar Plantilla"}
                </button>

                <button
                    type="button"
                    onClick={handleActivateCampaign}
                    disabled={isLoading || isSaving || isActivating || !isConnected || !formData.producto_id || formData.producto_id === 0}
                    className={`flex-1 px-8 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 ${!isConnected || !formData.producto_id || formData.producto_id === 0
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white hover:scale-[1.02]'
                        }`}
                >
                    {isActivating ? <AiOutlineLoading3Quarters className="animate-spin" /> : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    )}
                    {isActivating ? "Enviando..." : "Iniciar Envío Masivo"}
                </button>

                <button
                    type="button"
                    onClick={onClose}
                    className="sm:w-auto px-8 py-4 rounded-2xl font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
                >
                    Cancelar
                </button>
            </div>
        </form>
    );
}
