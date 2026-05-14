import { config } from '../../../../../config';

/**
 * getImageUrl Helper
 * Convierte string | File | null a string seguro para src de img
 * 
 * Soporta:
 * - String: URLs o base64 (construye URL completa si es relativa)
 * - File: Convierte a Object URL
 * - null: Retorna empty string
 * - undefined: Retorna empty string
 */
export const getImageUrl = (preview: string | File | null | undefined, fallback: string | File | null | undefined): string => {
    // Prioriza preview si existe
    if (preview) {
        if (typeof preview === 'string') {
            return preview;
        }
        if (preview instanceof File) {
            return URL.createObjectURL(preview);
        }
    }

    // Fallback a valor alternativo
    if (fallback) {
        if (typeof fallback === 'string') {
            // Construye URL completa si es relativa
            if (fallback.startsWith('http')) {
                return fallback;
            }
            return `${config.apiUrl}${fallback}`;
        }
        if (fallback instanceof File) {
            return URL.createObjectURL(fallback);
        }
    }

    // Por defecto retorna empty string
    return '';
};
