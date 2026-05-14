import React from 'react';

interface ColorPickerFieldProps {
    label: string;
    description?: string;
    color: string;
    onChange: (color: string) => void;
    isNested?: boolean;
}

/**
 * ColorPickerField Component
 * Componente reutilizable para selección de colores
 * 
 * Características:
 * - Input color nativo
 * - Preview en círculo
 * - Diseño compacto y responsivo
 * - Soporte para dark mode
 * - Opción para modo anidado (dentro de otros contenedores)
 */
export const ColorPickerField: React.FC<ColorPickerFieldProps> = ({
    label,
    description,
    color,
    onChange,
    isNested = false
}) => {
    const containerClass = isNested
        ? "p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50 shadow-sm flex flex-col items-center sm:items-start"
        : "p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50 shadow-sm flex flex-col items-center sm:items-start";

    return (
        <div className={containerClass}>
            <span className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-3 w-full text-center sm:text-left">
                {label}
            </span>

            <div className="flex items-center gap-3">
                {/* Color Preview Circle */}
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white dark:border-gray-600 shadow-md cursor-pointer hover:scale-105 transition-transform shrink-0">
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => onChange(e.target.value)}
                        className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                        title={label}
                    />
                </div>

                {/* Labels */}
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                        Seleccionar
                    </span>
                    {description && (
                        <span className="text-xs text-gray-400">
                            {description}
                        </span>
                    )}
                    <span className="text-xs text-gray-400 font-mono">
                        {color.toUpperCase()}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ColorPickerField;
