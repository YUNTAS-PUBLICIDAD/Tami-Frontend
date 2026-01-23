import React, { useState } from 'react';
import WhatsappConnection from './WhatsappConnection';
import SendWhatsappForm from './SendWhatsappForm';
import type Producto from 'src/models/Product';

interface WhatsappFormWithTabsProps {
    onClose: () => void;
    products: Producto[];
}

export default function WhatsappFormWithTabs({ onClose, products }: WhatsappFormWithTabsProps) {
    const [activeTab, setActiveTab] = useState('connection');
    const [isWhatsappConnected, setIsWhatsappConnected] = useState(false);

    const tabs = [
        {
            id: 'connection', label: '1. Conexión', icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            )
        },
        {
            id: 'template', label: '2. Envío de Campaña', icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
            )
        },
    ];

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800">
            {/* Cabecera de Tabs */}
            <div className="flex border-b border-gray-100 dark:border-gray-700 mb-8">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-8 py-4 text-sm font-bold transition-all duration-300 border-b-2 ${activeTab === tab.id
                            ? 'border-teal-500 text-teal-600 bg-teal-50/30'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Contenido de Tabs */}
            <div className="flex-1">
                {activeTab === 'connection' && (
                    <div className="animate-fadeIn">
                        <WhatsappConnection
                            onConnectionChange={setIsWhatsappConnected}
                        />

                        {!isWhatsappConnected && (
                            <div className="mt-8 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-100 dark:border-teal-900/30">
                                <p className="text-sm text-teal-800 dark:text-teal-400 font-medium text-center">
                                    💡 Una vez conectado, podrás acceder a la pestaña de "Envío de Campaña".
                                </p>
                            </div>
                        )}

                        {isWhatsappConnected && (
                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={() => setActiveTab('template')}
                                    className="bg-teal-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                                >
                                    Continuar al Envío
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'template' && (
                    <div className="animate-fadeIn">
                        <SendWhatsappForm
                            products={products}
                            onClose={onClose}
                            isConnected={isWhatsappConnected}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
