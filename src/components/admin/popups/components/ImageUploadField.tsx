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
    previewWidth = 'w-full sm:w-32',
    previewHeight = 'h-32',
    buttonLabel
}) => {
    const inputId = `input_${fieldName}`;
    const hasImage = preview || value;

    return (
        <div className="w-full">
            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                {label}
            </h4>
            {description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    {description}
                </p>
            )}

            <div className="flex flex-row gap-4 items-center">
                {/* Preview */}
                <div className={`${previewWidth} ${previewHeight} bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden flex items-center justify-center shrink-0 shadow-inner group relative`}>
                    {hasImage ? (
                        <>
                            <img
                                src={getImageUrl(preview, value)}
                                className="w-full h-full object-contain p-1"
                                alt={label}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    type="button"
                                    onClick={() => document.getElementById(inputId)?.click()}
                                    className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-all"
                                    title="Cambiar imagen"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                </button>
                            </div>
                        </>
                    ) : (
                        <div 
                            className="flex flex-col items-center gap-1 cursor-pointer w-full h-full justify-center"
                            onClick={() => document.getElementById(inputId)?.click()}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">Subir</span>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="flex-1 min-w-0">
                    <input
                        type="file"
                        id={inputId}
                        accept="image/*"
                        onChange={(e) => onFileChange(e, fieldName)}
                        className="hidden"
                    />

                    <div className="flex flex-col sm:flex-row gap-3">
                        {!hasImage ? (
                            <button
                                type="button"
                                onClick={() => document.getElementById(inputId)?.click()}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 whitespace-nowrap w-full sm:w-auto"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                {buttonLabel || 'SELECCIONAR IMAGEN'}
                            </button>
                        ) : (
                            <div className="flex flex-wrap gap-2 w-full">
                                <button
                                    type="button"
                                    onClick={() => document.getElementById(inputId)?.click()}
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-[11px] font-bold rounded-xl transition-all shadow-sm active:scale-95 uppercase tracking-wide flex-1 min-w-[120px]"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Cambiar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onClearImage(fieldName)}
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 text-[11px] font-bold rounded-xl transition-all active:scale-95 uppercase tracking-wide flex-1 min-w-[100px]"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Eliminar
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageUploadField;
