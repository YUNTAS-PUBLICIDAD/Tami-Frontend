import React from 'react';
import type { TabType } from '../types/productTab.types';

interface TabNavigationProps {
    tabs: Array<{
        id: TabType | string;
        label: string;
    }>;
    activeTab: TabType | string;
    onTabChange: (tab: TabType | string) => void;
}

/**
 * TabNavigation Component
 * Componente reutilizable para navegación de tabs
 * 
 * Características:
 * - Navegación clara entre pestañas
 * - Estilos responsivos
 * - Estados activo/inactivo
 * - Tema dark mode
 * - Animaciones suaves
 */
export const TabNavigation: React.FC<TabNavigationProps> = ({
    tabs,
    activeTab,
    onTabChange
}) => {
    return (
        <div className="flex gap-2 mb-6 pb-2 flex-wrap">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        activeTab === tab.id
                            ? "bg-teal-600 dark:bg-teal-500 text-white shadow-sm"
                            : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-700 dark:hover:text-gray-200"
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

export default TabNavigation;
