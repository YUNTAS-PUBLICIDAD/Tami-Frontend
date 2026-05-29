import React, { useState, useEffect } from 'react';
import { MobileImageSelector } from './MobileImageSelector';
import { currentInicioImages } from '../../../../scripts/admin/popupsState';

/**
 * InicioMobileImageSelector Component
 * Puente de React para integrar MobileImageSelector en la pestaña de Inicio de Astro.
 * Sincroniza el estado de React con el estado global de popupsState y mantiene
 * actualizados los inputs de archivo y delete ocultos en el DOM para que el script
 * de guardado de configuración vainilla funcione sin modificaciones.
 */
export const InicioMobileImageSelector: React.FC = () => {
    const [firstImagePreview, setFirstImagePreview] = useState<string | File | null>(null);
    const [firstImageValue, setFirstImageValue] = useState<string | File | null>(null);
    const [firstImageDeleted, setFirstImageDeleted] = useState(false);

    const [secondImagePreview, setSecondImagePreview] = useState<string | File | null>(null);
    const [secondImageValue, setSecondImageValue] = useState<string | File | null>(null);
    const [secondImageDeleted, setSecondImageDeleted] = useState(false);

    const [imageCount, setImageCount] = useState<1 | 2>(2);

    // Inicializar desde el estado global de Inicio si ya tiene valores (ej. al cambiar de pestaña)
    useEffect(() => {
        if (currentInicioImages.popup_mobile_image_url) {
            setFirstImagePreview(currentInicioImages.popup_mobile_image_url);
            setFirstImageValue(currentInicioImages.popup_mobile_image_url);
        }
        if (currentInicioImages.popup_mobile_image2_url) {
            setSecondImagePreview(currentInicioImages.popup_mobile_image2_url);
            setSecondImageValue(currentInicioImages.popup_mobile_image2_url);
        }
        
        const countInput = document.getElementById('popupMobileImageCountValue') as HTMLInputElement | null;
        if (countInput) {
            setImageCount(parseInt(countInput.value) as 1 | 2);
        }
    }, []);

    // Escuchar el evento cuando se cargan las configuraciones desde la API
    useEffect(() => {
        const handleSettingsLoaded = (e: any) => {
            const { imageMobile, imageMobile2, count } = e.detail;
            
            setFirstImagePreview(imageMobile);
            setFirstImageValue(imageMobile);
            setFirstImageDeleted(!imageMobile);

            setSecondImagePreview(imageMobile2);
            setSecondImageValue(imageMobile2);
            setSecondImageDeleted(!imageMobile2);

            setImageCount(count || 2);
        };

        window.addEventListener('inicio-mobile-settings-loaded', handleSettingsLoaded);
        return () => {
            window.removeEventListener('inicio-mobile-settings-loaded', handleSettingsLoaded);
        };
    }, []);

    // Sincronizar el conteo de imágenes
    const handleImageCountChange = (count: 1 | 2) => {
        setImageCount(count);
        
        // Si cambia a 1, limpiar la segunda
        if (count === 1) {
            handleClearImage('imagen_popup_mobile2');
        }
        
        // Sincronizar con el input oculto en el DOM
        const countInput = document.getElementById('popupMobileImageCountValue') as HTMLInputElement | null;
        if (countInput) countInput.value = String(count);

        // Emitir evento para la vista previa
        window.dispatchEvent(new CustomEvent('popup-mobile-image-count-change', {
            detail: { count, section: 'inicio' }
        }));
    };

    // Manejar el cambio de archivos
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const url = URL.createObjectURL(file);

        if (fieldName === 'imagen_popup_mobile') {
            setFirstImagePreview(url);
            setFirstImageValue(file);
            setFirstImageDeleted(false);
            currentInicioImages.popup_mobile_image_url = url;

            // Sincronizar con el input real del DOM
            const fileInput = document.getElementById('popupImageMobile') as HTMLInputElement | null;
            if (fileInput) {
                const dt = new DataTransfer();
                dt.items.add(file);
                fileInput.files = dt.files;
            }
            const deleteInput = document.getElementById('delete_popupImageMobile') as HTMLInputElement | null;
            if (deleteInput) deleteInput.value = '0';

            // Actualizar vista previa
            window.dispatchEvent(new CustomEvent('update-popup-preview', {
                detail: { settings: { popup_mobile_image_url: url }, mode: 'mobile' }
            }));
        } else if (fieldName === 'imagen_popup_mobile2') {
            setSecondImagePreview(url);
            setSecondImageValue(file);
            setSecondImageDeleted(false);
            currentInicioImages.popup_mobile_image2_url = url;

            // Sincronizar con el input real del DOM
            const fileInput = document.getElementById('popupImageMobile2') as HTMLInputElement | null;
            if (fileInput) {
                const dt = new DataTransfer();
                dt.items.add(file);
                fileInput.files = dt.files;
            }
            const deleteInput = document.getElementById('delete_popupImageMobile2') as HTMLInputElement | null;
            if (deleteInput) deleteInput.value = '0';

            // Actualizar vista previa
            window.dispatchEvent(new CustomEvent('update-popup-preview', {
                detail: { settings: { popup_mobile_image2_url: url }, mode: 'mobile' }
            }));
        }
    };

    // Manejar el borrado de imágenes
    const handleClearImage = (fieldName: string) => {
        if (fieldName === 'imagen_popup_mobile') {
            setFirstImagePreview(null);
            setFirstImageValue(null);
            setFirstImageDeleted(true);
            currentInicioImages.popup_mobile_image_url = null;

            const fileInput = document.getElementById('popupImageMobile') as HTMLInputElement | null;
            if (fileInput) fileInput.value = '';
            
            const deleteInput = document.getElementById('delete_popupImageMobile') as HTMLInputElement | null;
            if (deleteInput) deleteInput.value = '1';

            window.dispatchEvent(new CustomEvent('update-popup-preview', {
                detail: { settings: { popup_mobile_image_url: null }, mode: 'mobile' }
            }));
        } else if (fieldName === 'imagen_popup_mobile2') {
            setSecondImagePreview(null);
            setSecondImageValue(null);
            setSecondImageDeleted(true);
            currentInicioImages.popup_mobile_image2_url = null;

            const fileInput = document.getElementById('popupImageMobile2') as HTMLInputElement | null;
            if (fileInput) fileInput.value = '';
            
            const deleteInput = document.getElementById('delete_popupImageMobile2') as HTMLInputElement | null;
            if (deleteInput) deleteInput.value = '1';

            window.dispatchEvent(new CustomEvent('update-popup-preview', {
                detail: { settings: { popup_mobile_image2_url: null }, mode: 'mobile' }
            }));
        }
    };

    return (
        <div className="w-full">
            {/* Elementos ocultos requeridos por los scripts de guardado del backend */}
            <input type="file" id="popupImageMobile" className="hidden" accept=".webp" />
            <input type="file" id="popupImageMobile2" className="hidden" accept=".webp" />
            <input type="hidden" id="delete_popupImageMobile" name="delete_popupImageMobile" value={firstImageDeleted ? '1' : '0'} />
            <input type="hidden" id="delete_popupImageMobile2" name="delete_popupImageMobile2" value={secondImageDeleted ? '1' : '0'} />
            <input type="hidden" id="popupMobileImageCountValue" name="popup_mobile_image_count" value={imageCount} />

            <MobileImageSelector
                firstImageLabel="Imagen Móvil Principal"
                firstImageDescription="Resolución: 420x320px. Máx 2MB (webp)."
                firstImageFieldName="imagen_popup_mobile"
                firstImagePreview={firstImagePreview}
                firstImageValue={firstImageValue}
                
                secondImageLabel="Imagen Móvil Secundaria"
                secondImageDescription="Resolución: 220x320px. Máx 2MB (webp)."
                secondImageFieldName="imagen_popup_mobile2"
                secondImagePreview={secondImagePreview}
                secondImageValue={secondImageValue}
                
                onFileChange={handleFileChange}
                onClearImage={handleClearImage}
                section="inicio"
                onImageCountChange={handleImageCountChange}
            />
        </div>
    );
};

export default InicioMobileImageSelector;
