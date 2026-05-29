import React, { useState, useEffect } from 'react';
import { ImageUploadField } from './ImageUploadField';

interface MobileImageSelectorProps {
    // Primera imagen
    firstImageLabel?: string;
    firstImageDescription?: string;
    firstImageFieldName: string;
    firstImagePreview: string | File | null;
    firstImageValue: string | File | null;
    firstImageAltText?: string;
    firstImageAltFieldName?: string;
    
    // Segunda imagen
    secondImageLabel?: string;
    secondImageDescription?: string;
    secondImageFieldName: string;
    secondImagePreview: string | File | null;
    secondImageValue: string | File | null;
    secondImageAltText?: string;
    secondImageAltFieldName?: string;
    
    // Handlers
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>, field: string) => void;
    onClearImage: (field: string) => void;
    onFieldChange?: (field: string, value: string) => void;
    
    // Identificador de sección para eventos
    section?: 'inicio' | 'producto';
    
    // Callback cuando cambia el contador
    onImageCountChange?: (count: 1 | 2) => void;
    
    // Conteo inicial
    initialCount?: 1 | 2;
}

/**
 * MobileImageSelector Component
 * Selector de 1 o 2 imágenes móviles con vista previa
 * 
 * Características:
 * - Radio buttons para elegir entre 1 o 2 imágenes
 * - Usa ImageUploadField para carga de imágenes
 * - Soporte para campos ALT (SEO)
 * - Oculta/muestra segundo campo según selección
 * - Limpia automáticamente la segunda imagen si cambias a 1 imagen
 * - Emite eventos para sincronización
 * - Tema dark mode
 */
export const MobileImageSelector: React.FC<MobileImageSelectorProps> = ({
    firstImageLabel = 'Imagen Móvil Principal',
    firstImageDescription = 'Resolución: 420x320px. Máx 2MB (webp).',
    firstImageFieldName,
    firstImagePreview,
    firstImageValue,
    firstImageAltText,
    firstImageAltFieldName,
    
    secondImageLabel = 'Imagen Móvil Secundaria',
    secondImageDescription = 'Resolución: 220x320px. Máx 2MB (webp).',
    secondImageFieldName,
    secondImagePreview,
    secondImageValue,
    secondImageAltText,
    secondImageAltFieldName,
    
    onFileChange,
    onClearImage,
    onFieldChange,
    
    section = 'inicio',
    onImageCountChange,
    initialCount
}) => {
    const [imageCount, setImageCount] = useState<1 | 2>(initialCount || 2);

    useEffect(() => {
        if (initialCount) {
            setImageCount(initialCount);
        }
    }, [initialCount]);

    // Actualizar visibilidad y emitir evento
    const handleImageCountChange = (count: 1 | 2) => {
        setImageCount(count);
        
        // Si cambiamos a 1 imagen, limpiar la segunda
        if (count === 1) {
            onClearImage(secondImageFieldName);
            if (secondImageAltFieldName && onFieldChange) {
                onFieldChange(secondImageAltFieldName, '');
            }
        }
        
        // Emitir evento para sincronización
        window.dispatchEvent(new CustomEvent('popup-mobile-image-count-change', {
            detail: { count, section }
        }));
        
        // Callback
        onImageCountChange?.(count);
    };

    return (
        <div className="space-y-6">
            {/* Selector: 1 o 2 Imágenes Móviles */}
            <div
                className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-6 rounded-2xl border border-indigo-200 dark:border-indigo-700/30 shadow-sm"
            >
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM4 16a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd"></path>
                    </svg>
                    Configuración de Imágenes Móviles
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Elige si deseas mostrar 1 imagen o 2 imágenes en dispositivos móviles.
                </p>
                <div className="flex flex-col sm:flex-row gap-6">
                    {/* Opción 1: 1 Imagen */}
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                            type="radio"
                            name={`popupMobileImageCount-${section}`}
                            value="1"
                            checked={imageCount === 1}
                            onChange={() => handleImageCountChange(1)}
                            className="w-5 h-5 text-indigo-600 dark:text-indigo-400 cursor-pointer accent-indigo-600"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            Solo 1 imagen móvil
                        </span>
                    </label>
                    
                    {/* Opción 2: 2 Imágenes */}
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                            type="radio"
                            name={`popupMobileImageCount-${section}`}
                            value="2"
                            checked={imageCount === 2}
                            onChange={() => handleImageCountChange(2)}
                            className="w-5 h-5 text-indigo-600 dark:text-indigo-400 cursor-pointer accent-indigo-600"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            2 imágenes móviles
                        </span>
                    </label>
                </div>
            </div>

            {/* Primera Imagen Móvil - Siempre visible */}
            <div className="bg-white dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
                <ImageUploadField
                    label={firstImageLabel}
                    description={firstImageDescription}
                    fieldName={firstImageFieldName}
                    preview={firstImagePreview}
                    value={firstImageValue}
                    onFileChange={onFileChange}
                    onClearImage={onClearImage}
                    buttonLabel="Seleccionar"
                    previewWidth="w-20"
                    previewHeight="h-20"
                />
                
                {/* Campo ALT opcional */}
                {firstImageAltFieldName && (
                    <div className="pt-2">
                        <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-widest">
                            Texto ALT (SEO)
                        </label>
                        <input
                            type="text"
                            value={firstImageAltText || ''}
                            onChange={(e) => onFieldChange?.(firstImageAltFieldName, e.target.value)}
                            className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-xs focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                            placeholder="Ej: Imagen móvil principal..."
                        />
                    </div>
                )}
            </div>

            {/* Segunda Imagen Móvil - Mostrar/Ocultar según selección */}
            {imageCount === 2 && (
                <div 
                    className="bg-white dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4 animate-fadeIn transition-all duration-300"
                >
                    <ImageUploadField
                        label={secondImageLabel}
                        description={secondImageDescription}
                        fieldName={secondImageFieldName}
                        preview={secondImagePreview}
                        value={secondImageValue}
                        onFileChange={onFileChange}
                        onClearImage={onClearImage}
                        buttonLabel="Seleccionar"
                        previewWidth="w-20"
                        previewHeight="h-20"
                    />
                    
                    {/* Campo ALT opcional */}
                    {secondImageAltFieldName && (
                        <div className="pt-2">
                            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-widest">
                                Texto ALT (SEO)
                            </label>
                            <input
                                type="text"
                                value={secondImageAltText || ''}
                                onChange={(e) => onFieldChange?.(secondImageAltFieldName, e.target.value)}
                                className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-xs focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                                placeholder="Ej: Imagen móvil secundaria..."
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
