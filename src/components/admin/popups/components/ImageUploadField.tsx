import React from 'react';
import { getImageUrl } from '../utils/imageUrl';

interface ImageUploadFieldProps {
    label: string;
    description: string;
    fieldName: string;
    preview: string | File | null;
    value: string | File | null;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>, field: string) => void;
    onClearImage: (field: string) => void;
    previewWidth?: string;
    previewHeight?: string;
    buttonLabel?: string;
}

/**
 * ImageUploadField Component
 * Componente reutilizable para carga y previsualización de imágenes
 * 
 * Características:
 * - Preview en tiempo real
 * - Botón para seleccionar imagen
 * - Botón para limpiar imagen
 * - Soporte para archivos File y URLs string
 * - Tema dark mode
 */
export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
    label,
    description,
    fieldName,
    preview,
    value,
    onFileChange,
    onClearImage,
    previewWidth = 'sm:w-32',
    previewHeight = 'h-32',
    buttonLabel
}) => {
    const inputId = `input_${fieldName}`;
    const hasImage = preview || value;

    return (
        <div className="bg-gray-50 dark:bg-gray-800/40 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                {label}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {description}
            </p>

            <div className="flex flex-col sm:flex-row gap-6 items-start">
                {/* Preview */}
                <div className={`w-full ${previewWidth} ${previewHeight} bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex items-center justify-center shrink-0 shadow-inner`}>
                    {hasImage ? (
                        <img
                            src={getImageUrl(preview, value)}
                            className="w-full h-full object-contain"
                            alt={label}
                        />
                    ) : (
                        <span className="text-xs text-gray-400 font-medium">Sin imagen</span>
                    )}
                </div>

                {/* Controls */}
                <div className="flex-1 space-y-4 w-full">
                    <div className="flex flex-col gap-2">
                        <input
                            type="file"
                            id={inputId}
                            accept="image/*"
                            onChange={(e) => onFileChange(e, fieldName)}
                            className="hidden"
                        />

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => document.getElementById(inputId)?.click()}
                                className="inline-flex items-center gap-2 px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-lg transition-all shadow-md active:scale-95 w-fit"
                            >
                                {buttonLabel || `Seleccionar ${label}`}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                                    />
                                </svg>
                            </button>

                            {hasImage && (
                                <button
                                    type="button"
                                    onClick={() => onClearImage(fieldName)}
                                    className="text-red-500 hover:text-red-600 transition-colors p-2"
                                    title={`Borrar ${label}`}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageUploadField;
