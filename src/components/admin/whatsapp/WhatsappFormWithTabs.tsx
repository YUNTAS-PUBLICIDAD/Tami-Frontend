import React, { useState, useEffect } from 'react';
import WhatsappConnection from './WhatsappConnection';

interface WhatsappFormWithTabsProps {
    onClose: () => void;
}

// El texto original que se usará si el admin quiere resetear
const DEFAULT_TEMPLATE = `📢 *Bienvenido a Tami Maquinarias* 📢

Gracias por su interés en nuestros productos. A continuación, le proporcionamos los detalles del producto que ha consultado:

📝 *Producto Consultado:*
    • Nombre: {{productName}}  
    • Descripción: {{description}}  

📅 *Fecha y Hora de Consulta:*
    • Fecha: {{fecha}}
    • Hora: {{hora}}

📧 *Información Adicional:*
Le informamos que en breve recibirá un correo electrónico a *{{email}}* con más detalles. Le recomendamos revisar su bandeja de entrada.

Si tiene alguna otra consulta, no dude en contactarnos.

¡Gracias por elegirnos!

Atentamente,  
*Yuntas Publicidad*`;

export default function WhatsappFormWithTabs({ onClose }: WhatsappFormWithTabsProps) {
    const [template, setTemplate] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'connection' | 'template'>('connection');

    useEffect(() => {
        fetch(`${import.meta.env.PUBLIC_API_URL}/api/v1/whatsapp-templates/product_details`)
            .then(res => res.json())
            .then(data => {
                if (data && data.content) setTemplate(data.content);
                else setTemplate(DEFAULT_TEMPLATE); // Cargar default si la DB está vacía
            })
            .catch(() => setTemplate(DEFAULT_TEMPLATE));
    }, []);

    const handleSaveTemplate = async () => {
        setIsSaving(true);
        try {
            await fetch(`${import.meta.env.PUBLIC_API_URL}/api/v1/whatsapp-templates/product_details`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: template })
            });
            alert('¡Plantilla guardada!');
        } catch (error) {
            alert('Error al guardar');
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        if (confirm('¿Estás seguro de que quieres restablecer el mensaje original? Perderás los cambios actuales.')) {
            setTemplate(DEFAULT_TEMPLATE);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 p-4">
            {/* Headers de Pestañas */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                <button
                    onClick={() => setActiveTab('connection')}
                    className={`px-4 py-2 font-medium transition-all ${activeTab === 'connection' ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-500'}`}
                >
                    Conexión QR
                </button>
                <button
                    onClick={() => setActiveTab('template')}
                    className={`px-4 py-2 font-medium transition-all ${activeTab === 'template' ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-500'}`}
                >
                    Mensaje de Respuesta
                </button>
            </div>

            <div className="flex-1 animate-fadeIn overflow-y-auto">
                {activeTab === 'connection' ? (
                    <WhatsappConnection />
                ) : (
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                Diseño del Mensaje
                            </label>
                            <button 
                                onClick={handleReset}
                                className="text-xs text-red-500 hover:underline font-semibold"
                            >
                                Restablecer original
                            </button>
                        </div>
                        
                        <textarea
                            value={template}
                            onChange={(e) => setTemplate(e.target.value)}
                            className="w-full h-80 p-4 border rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white font-sans text-sm focus:ring-2 focus:ring-green-500 outline-none"
                            placeholder="Escribe el mensaje..."
                        />
                        
                        <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2 uppercase font-bold tracking-wider">Etiquetas dinámicas:</p>
                            <div className="flex flex-wrap gap-2">
                                {['productName', 'description', 'email', 'fecha', 'hora'].map(v => (
                                    <code key={v} className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-[10px] text-green-600 font-bold border">
                                        {"{{"}{v}{"}}"}
                                    </code>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleSaveTemplate}
                            disabled={isSaving}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all disabled:opacity-50"
                        >
                            {isSaving ? 'Guardando...' : 'Guardar Cambios en WhatsApp'}
                        </button>
                    </div>
                )}

                <div className="mt-8 flex justify-end">
                    <button onClick={onClose} className="text-gray-500 font-bold px-4 py-2 hover:text-gray-700">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}