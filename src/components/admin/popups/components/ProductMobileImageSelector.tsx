import React, { useEffect, useState } from 'react';
import { MobileImageSelector } from './MobileImageSelector';

interface ProductMobileImageSelectorProps {
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
    section?: 'inicio' | 'producto';
    onImageCountChange?: (count: 1 | 2) => void;
    initialCount?: 1 | 2;
}

export const ProductMobileImageSelector: React.FC<ProductMobileImageSelectorProps> = ({
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
    section = 'producto'
}) => {
    const [firstPreviewState, setFirstPreviewState] = useState<string | File | null>(firstImagePreview);
    const [secondPreviewState, setSecondPreviewState] = useState<string | File | null>(secondImagePreview);

    useEffect(() => {
        setFirstPreviewState(firstImagePreview);
    }, [firstImagePreview]);

    useEffect(() => {
        setSecondPreviewState(secondImagePreview);
    }, [secondImagePreview]);

    const dispatchPreview = (settings: Record<string, any>) => {
        window.dispatchEvent(new CustomEvent('update-popup-preview', {
            detail: { settings, mode: 'mobile' }
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const url = URL.createObjectURL(file);
        onFileChange(e, field);

        if (field === firstImageFieldName) {
            setFirstPreviewState(url);
            dispatchPreview({
                popup_mobile_image_url: url,
                popup_mobile_image2_url: secondPreviewState || secondImageValue || null,
                popup_mobile_image_count: 2,
            });
        } else if (field === secondImageFieldName) {
            setSecondPreviewState(url);
            dispatchPreview({
                popup_mobile_image_url: firstPreviewState || firstImageValue || null,
                popup_mobile_image2_url: url,
                popup_mobile_image_count: 2,
            });
        }
    };

    const handleClearImage = (field: string) => {
        onClearImage(field);

        if (field === firstImageFieldName) {
            setFirstPreviewState(null);
            dispatchPreview({
                popup_mobile_image_url: null,
                popup_mobile_image2_url: secondPreviewState || secondImageValue || null,
                popup_mobile_image_count: 2,
            });
        } else if (field === secondImageFieldName) {
            setSecondPreviewState(null);
            dispatchPreview({
                popup_mobile_image_url: firstPreviewState || firstImageValue || null,
                popup_mobile_image2_url: null,
                popup_mobile_image_count: 2,
            });
        }
    };

    return (
        <div className="w-full">
            <MobileImageSelector
                firstImageLabel={firstImageLabel}
                firstImageDescription={firstImageDescription}
                firstImageFieldName={firstImageFieldName}
                firstImagePreview={firstPreviewState}
                firstImageValue={firstImageValue}
                firstImageAltText={firstImageAltText}
                firstImageAltFieldName={firstImageAltFieldName}

                secondImageLabel={secondImageLabel}
                secondImageDescription={secondImageDescription}
                secondImageFieldName={secondImageFieldName}
                secondImagePreview={secondPreviewState}
                secondImageValue={secondImageValue}
                secondImageAltText={secondImageAltText}
                secondImageAltFieldName={secondImageAltFieldName}

                onFileChange={handleFileChange}
                onClearImage={handleClearImage}
                onFieldChange={onFieldChange}
            />
        </div>
    );
};

export default ProductMobileImageSelector;