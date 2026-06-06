import React, { useState, useEffect } from 'react';
import { ImageUploadField } from './ImageUploadField';

interface MobileImageSelectorProps {
    firstImageLabel?: string;
    firstImageDescription?: string;
    firstImageFieldName: string;
    firstImagePreview: string | File | null;
    firstImageValue: string | File | null;
    firstImageAltText?: string;
    firstImageAltFieldName?: string;

    secondImageLabel?: string;
    secondImageDescription?: string;
    secondImageFieldName: string;
    secondImagePreview: string | File | null;
    secondImageValue: string | File | null;
    secondImageAltText?: string;
    secondImageAltFieldName?: string;

    onFileChange: (e: React.ChangeEvent<HTMLInputElement>, field: string) => void;
    onClearImage: (field: string) => void;
    onFieldChange?: (field: string, value: string) => void;
}

/**
 * MobileImageSelector Component
 * Selector fijo de 2 imágenes móviles con vista previa
 * 
 * Características:
 * - Usa ImageUploadField para carga de imágenes
 * - Soporte para campos ALT (SEO)
 * - Tema dark mode
 */
export const MobileImageSelector: React.FC<MobileImageSelectorProps> = ({
    firstImageLabel = 'Imagen Móvil Principal',
    firstImageDescription = 'Resolución: 448x420px. Máx 2MB (webp).',
    firstImageFieldName,
    firstImagePreview,
    firstImageValue,
    firstImageAltText,
    firstImageAltFieldName,

    secondImageLabel = 'Imagen Móvil Secundaria',
    secondImageDescription = 'Resolución: 448x220px. Máx 2MB (webp).',
    secondImageFieldName,
    secondImagePreview,
    secondImageValue,
    secondImageAltText,
    secondImageAltFieldName,

    onFileChange,
    onClearImage,
    onFieldChange,
}) => {
    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
                <ImageUploadField
                    label={firstImageLabel}
                    description={firstImageDescription}
                    fieldName={firstImageFieldName}
                    preview={firstImagePreview}
                    value={firstImageValue}
                    onFileChange={(e, fieldName) => {
                    onFileChange(e, fieldName);
                    }}
                    onClearImage={onClearImage}
                    buttonLabel="Seleccionar"
                    previewWidth="w-20"
                    previewHeight="h-20"
                />

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
            <div className="bg-white dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4 animate-fadeIn transition-all duration-300">
                <ImageUploadField
                    label={secondImageLabel}
                    description={secondImageDescription}
                    fieldName={secondImageFieldName}
                    preview={secondImagePreview}
                    value={secondImageValue}
                    onFileChange={(e, fieldName) => {
                    onFileChange(e, fieldName);
                    }}
                    onClearImage={onClearImage}
                    buttonLabel="Seleccionar"
                    previewWidth="w-20"
                    previewHeight="h-20"
                />

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
        </div>
    );
};
