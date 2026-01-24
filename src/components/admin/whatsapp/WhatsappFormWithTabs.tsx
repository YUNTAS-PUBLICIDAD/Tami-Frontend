import React from 'react';
import WhatsappConnection from './WhatsappConnection';

interface WhatsappFormWithTabsProps {
    onClose: () => void;
}

export default function WhatsappFormWithTabs({ onClose }: WhatsappFormWithTabsProps) {
    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800">
            <div className="flex-1 animate-fadeIn">
                <WhatsappConnection />

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-6 py-3 rounded-xl font-bold transition-all"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
