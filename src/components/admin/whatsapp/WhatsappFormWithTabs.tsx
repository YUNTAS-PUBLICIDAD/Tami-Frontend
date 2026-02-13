import React, { useState, useEffect } from 'react';
import WhatsappConnection from './WhatsappConnection';

interface WhatsappFormWithTabsProps {
    onClose: () => void;
}

interface Producto {
    id: number;
    nombre: string;
    link: string;
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
    const [productos, setProductos] = useState<Producto[]>([]);
    const [selectedProductoId, setSelectedProductoId] = useState<number | null>(null);
    const [template, setTemplate] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingProductos, setIsLoadingProductos] = useState(true);
    const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
    const [hasCustomTemplate, setHasCustomTemplate] = useState(false);
    const [activeTab, setActiveTab] = useState<'connection' | 'template'>('connection');

    // ✅ Cargar lista de productos al montar el componente
    useEffect(() => {
        const fetchProductos = async () => {
            try {
                const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/api/v1/productos`);
                const data = await response.json();
                setProductos(data);
            } catch (error) {
                console.error('Error al cargar productos:', error);
            } finally {
                setIsLoadingProductos(false);
            }
        };

        fetchProductos();
    }, []);

    // ✅ Cargar plantilla cuando se selecciona un producto
    useEffect(() => {
        if (!selectedProductoId) {
            setTemplate('');
            setHasCustomTemplate(false);
            return;
        }

        const fetchTemplate = async () => {
            setIsLoadingTemplate(true);
            try {
                const response = await fetch(
                    `${import.meta.env.PUBLIC_API_URL}/api/v1/whatsapp/template/product/${selectedProductoId}`
                );
                const data = await response.json();
                
                if (data && data.data && data.data.content) {
                    setTemplate(data.data.content);
                    setHasCustomTemplate(true);
                } else {
                    setTemplate(DEFAULT_TEMPLATE);
                    setHasCustomTemplate(false);
                }
            } catch (error) {
                console.error('Error al cargar plantilla:', error);
                setTemplate(DEFAULT_TEMPLATE);
                setHasCustomTemplate(false);
            } finally {
                setIsLoadingTemplate(false);
            }
        };

        fetchTemplate();
    }, [selectedProductoId]);

    const handleSaveTemplate = async () => {
        if (!selectedProductoId) {
            alert('Por favor, selecciona un producto primero');
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch(
                `${import.meta.env.PUBLIC_API_URL}/api/v1/whatsapp/template/product/${selectedProductoId}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: template })
                }
            );

            if (response.ok) {
                setHasCustomTemplate(true);
                alert('¡Plantilla guardada para este producto!');
            } else {
                throw new Error('Error al guardar');
            }
        } catch (error) {
            alert('Error al guardar la plantilla');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        if (confirm('¿Estás seguro de que quieres restablecer el mensaje original? Perderás los cambios actuales.')) {
            setTemplate(DEFAULT_TEMPLATE);
        }
    };

    const handleDeleteCustomTemplate = async () => {
        if (!selectedProductoId || !hasCustomTemplate) return;

        if (confirm('¿Estás seguro de que quieres eliminar la plantilla personalizada? Se usará la plantilla por defecto.')) {
            try {
                const response = await fetch(
                    `${import.meta.env.PUBLIC_API_URL}/api/v1/whatsapp/template/product/${selectedProductoId}`,
                    { method: 'DELETE' }
                );

                if (response.ok) {
                    setTemplate(DEFAULT_TEMPLATE);
                    setHasCustomTemplate(false);
                    alert('Plantilla personalizada eliminada. Se usará la plantilla por defecto.');
                } else {
                    throw new Error('Error al eliminar');
                }
            } catch (error) {
                alert('Error al eliminar la plantilla');
                console.error(error);
            }
        }
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 p-4">
            {/* Headers de Pestañas */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                <button
                    onClick={() => setActiveTab('connection')}
                    className={`px-4 py-2 font-medium transition-all ${
                        activeTab === 'connection' 
                            ? 'border-b-2 border-green-500 text-green-600' 
                            : 'text-gray-500'
                    }`}
                >
                    Conexión QR
                </button>
                <button
                    onClick={() => setActiveTab('template')}
                    className={`px-4 py-2 font-medium transition-all ${
                        activeTab === 'template' 
                            ? 'border-b-2 border-green-500 text-green-600' 
                            : 'text-gray-500'
                    }`}
                >
                    Mensaje de Respuesta
                </button>
            </div>

            <div className="flex-1 animate-fadeIn overflow-y-auto">
                {activeTab === 'connection' ? (
                    <WhatsappConnection />
                ) : (
                    <div className="space-y-4">
                        {/* ✅ SELECTOR DE PRODUCTOS */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                Seleccionar Producto
                            </label>
                            <select
                                value={selectedProductoId || ''}
                                onChange={(e) => setSelectedProductoId(Number(e.target.value) || null)}
                                disabled={isLoadingProductos}
                                className="w-full px-4 py-3 border rounded-xl bg-white dark:bg-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-green-500 outline-none disabled:opacity-50"
                            >
                                <option value="">
                                    {isLoadingProductos ? 'Cargando productos...' : '-- Selecciona un producto --'}
                                </option>
                                {productos.map((producto) => (
                                    <option key={producto.id} value={producto.id}>
                                        {producto.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* ✅ Indicador de estado de plantilla */}
                        {selectedProductoId && (
                            <div className={`px-4 py-2 rounded-lg text-sm ${
                                hasCustomTemplate 
                                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
                                    : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                            }`}>
                                {hasCustomTemplate ? (
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold">✅ Este producto tiene una plantilla personalizada</span>
                                        <button
                                            onClick={handleDeleteCustomTemplate}
                                            className="text-xs text-red-600 hover:underline font-semibold"
                                        >
                                            Eliminar personalización
                                        </button>
                                    </div>
                                ) : (
                                    <span className="font-semibold">ℹ️ Usando plantilla por defecto. Guarda para crear una personalizada.</span>
                                )}
                            </div>
                        )}

                        {/* ✅ Editor de plantilla */}
                        {selectedProductoId ? (
                            <>
                                <div className="flex justify-between items-end">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                        Diseño del Mensaje
                                    </label>
                                    <button 
                                        onClick={handleReset}
                                        className="text-xs text-red-500 hover:underline font-semibold"
                                        disabled={isLoadingTemplate}
                                    >
                                        Restablecer original
                                    </button>
                                </div>
                                
                                {isLoadingTemplate ? (
                                    <div className="w-full h-80 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-xl">
                                        <div className="text-gray-500">Cargando plantilla...</div>
                                    </div>
                                ) : (
                                    <textarea
                                        value={template}
                                        onChange={(e) => setTemplate(e.target.value)}
                                        className="w-full h-80 p-4 border rounded-xl bg-gray-50 dark:bg-gray-900 dark:text-white font-sans text-sm focus:ring-2 focus:ring-green-500 outline-none"
                                        placeholder="Escribe el mensaje personalizado para este producto..."
                                    />
                                )}
                                
                                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2 uppercase font-bold tracking-wider">
                                        Etiquetas dinámicas:
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {['productName', 'description', 'email', 'fecha', 'hora'].map(v => (
                                            <code 
                                                key={v} 
                                                className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-[10px] text-green-600 font-bold border"
                                            >
                                                {"{{"}{v}{"}}"}
                                            </code>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={handleSaveTemplate}
                                    disabled={isSaving || isLoadingTemplate}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? 'Guardando...' : 'Guardar Plantilla para este Producto'}
                                </button>

                                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                    Esta plantilla se usará solo para este producto. Los demás productos usarán la plantilla por defecto.
                                </p>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <svg 
                                    className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                                    />
                                </svg>
                                <p className="text-gray-500 dark:text-gray-400 font-medium">
                                    Selecciona un producto para personalizar su mensaje de WhatsApp
                                </p>
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-8 flex justify-end">
                    <button 
                        onClick={onClose} 
                        className="text-gray-500 font-bold px-4 py-2 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}