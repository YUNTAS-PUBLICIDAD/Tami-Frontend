import React from 'react';


interface GradientPickerFieldProps {
    label: string;
    description?: string;

    // color inicial editable
    startColor: string;

    // color final fijo (opcional)
    endColor?: string;

    onChange: (startColor: string) => void;
}

export const GradientPickerField: React.FC<GradientPickerFieldProps> = ({
    label,
    description,
    startColor,
    endColor = "#0D2D2B",
    onChange
}) => {

    const gradient = `linear-gradient(to right, ${startColor}, ${endColor})`;

    return (
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50 shadow-sm">
            <span className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-3">
                {label}
            </span>

            <div className="flex items-center gap-4">

                {/* Preview */}
                <div
                    className="w-14 h-14 rounded-full border-2 border-white dark:border-gray-600 shadow-md shrink-0"
                    style={{
                        background: gradient
                    }}
                />

                {/* Selector */}
                <div className="flex flex-col gap-1">

                    <input
                        type="color"
                        value={startColor}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-12 h-12 cursor-pointer"
                    />

                    <span className="text-xs text-gray-500">
                        Color inicial
                    </span>

                    {description && (
                        <span className="text-xs text-gray-400">
                            {description}
                        </span>
                    )}

                    <span className="text-xs font-mono text-gray-400 break-all">
                        {gradient}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default GradientPickerField;