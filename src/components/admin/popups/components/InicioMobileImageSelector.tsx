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

    useEffect(() => {
        if (currentInicioImages.popup_mobile_image_url) {
            setFirstImagePreview(currentInicioImages.popup_mobile_image_url);
            setFirstImageValue(currentInicioImages.popup_mobile_image_url);
        }

        if (currentInicioImages.popup_mobile_image2_url) {
            setSecondImagePreview(currentInicioImages.popup_mobile_image2_url);
            setSecondImageValue(currentInicioImages.popup_mobile_image2_url);
        }
    }, []);

    useEffect(() => {
        const handleSettingsLoaded = (e: any) => {
            const { imageMobile, imageMobile2, count } = e.detail;
            
            setFirstImagePreview(imageMobile);
            setFirstImageValue(imageMobile);
            setFirstImageDeleted(!imageMobile);

            setSecondImagePreview(imageMobile2);
            setSecondImageValue(imageMobile2);
            setSecondImageDeleted(!imageMobile2);
        };

        window.addEventListener('inicio-mobile-settings-loaded', handleSettingsLoaded);
        return () => {
            window.removeEventListener('inicio-mobile-settings-loaded', handleSettingsLoaded);
        };
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const url = URL.createObjectURL(file);

        if (fieldName === 'imagen_popup_mobile') {
            setFirstImagePreview(url);
            setFirstImageValue(file);
            window.dispatchEvent(
  new CustomEvent("product-field-change", {
    detail: {
      field: fieldName,
      value: file
    }
  })
);
            setFirstImageDeleted(false);
            currentInicioImages.popup_mobile_image_url = url;

            // Sincronizar con el input real del DOM
            const fileInput = document.getElementById('popupImageMobile') as HTMLInputElement | null;
            if (fileInput) {
                const dt = new DataTransfer();
                dt.items.add(file);
                fileInput.files = dt.files;
                console.log(
  "INPUT REAL popupImageMobile",
  fileInput.files?.length,
  fileInput.files?.[0]
);
            }
            const deleteInput = document.getElementById('delete_popupImageMobile') as HTMLInputElement | null;
            if (deleteInput) deleteInput.value = '0';

            window.dispatchEvent(new CustomEvent('update-popup-preview', {
                detail: { settings: { popup_mobile_image_url: url }, mode: 'mobile' }
            }));
        } else if (fieldName === 'imagen_popup_mobile2') {
            setSecondImagePreview(url);
            setSecondImageValue(file);
            window.dispatchEvent(
  new CustomEvent("product-field-change", {
    detail: { field: "imagen_popup_mobile2", value: file }
  })
);
            setSecondImageDeleted(false);
            currentInicioImages.popup_mobile_image2_url = url;

            const fileInput = document.getElementById('popupImageMobile2') as HTMLInputElement | null;
            if (fileInput) {
                const dt = new DataTransfer();
                dt.items.add(file);
                fileInput.files = dt.files;
                console.log(
  "INPUT REAL popupImageMobile2",
  fileInput.files?.length,
  fileInput.files?.[0]
);
            }
            const deleteInput = document.getElementById('delete_popupImageMobile2') as HTMLInputElement | null;
            if (deleteInput) deleteInput.value = '0';

            window.dispatchEvent(new CustomEvent('update-popup-preview', {
                detail: { settings: { popup_mobile_image2_url: url }, mode: 'mobile' }
            }));
        }
    };

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
            <input type="file" id="popupImageMobile" className="hidden" accept=".webp" />
            <input type="file" id="popupImageMobile2" className="hidden" accept=".webp" />
            <input type="hidden" id="delete_popupImageMobile" name="delete_popupImageMobile" value={firstImageDeleted ? '1' : '0'} />
            <input type="hidden" id="delete_popupImageMobile2" name="delete_popupImageMobile2" value={secondImageDeleted ? '1' : '0'} />
            <input type="hidden" id="popupMobileImageCountValue" name="popup_mobile_image_count" value="2" />

            <MobileImageSelector
                firstImageLabel="Imagen Móvil Principal"
                firstImageDescription="Resolución: 448x420px. Máx 2MB (webp)."
                firstImageFieldName="imagen_popup_mobile"
                firstImagePreview={firstImagePreview}
                firstImageValue={firstImageValue}

                secondImageLabel="Imagen Móvil Secundaria"
                secondImageDescription="Resolución: 448x220px. Máx 2MB (webp)."
                secondImageFieldName="imagen_popup_mobile2"
                secondImagePreview={secondImagePreview}
                secondImageValue={secondImageValue}

                onFileChange={handleFileChange}
                onClearImage={handleClearImage}
            />
        </div>
    );
};

export default InicioMobileImageSelector;
