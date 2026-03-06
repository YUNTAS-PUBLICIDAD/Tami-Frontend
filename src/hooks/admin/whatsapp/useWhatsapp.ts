import { useState, useCallback } from "react";
import type {
    WhatsappPlantillaServiceResponse,
} from "src/models/whatsapp";
import {
    requestQRService,
    resetSessionService,
    getTemplateByProductService,
    updateTemplateByProductService,
    deleteTemplateByProductService
} from "src/services/admin/whatsapp/whatsappService";

interface UseWhatsappReturn {
    isLoading: boolean;
    isRequesting: boolean;
    error: string | null;
    clearError: () => void;
    requestQR: () => Promise<WhatsappPlantillaServiceResponse<null>>;
    resetSession: () => Promise<WhatsappPlantillaServiceResponse<null>>;
    getTemplateByProduct: (productoId: number | string) => Promise<WhatsappPlantillaServiceResponse<string>>;
    updateTemplateByProduct: (productoId: number | string, template: string) => Promise<WhatsappPlantillaServiceResponse<null>>;
    deleteTemplateByProduct: (productoId: number | string) => Promise<WhatsappPlantillaServiceResponse<null>>;
}

export function useWhatsapp(): UseWhatsappReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [isRequesting, setIsRequesting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const clearError = () => setError(null);

    const requestQR = useCallback(async () => {
        setIsRequesting(true);
        setError(null);
        const result = await requestQRService();
        setIsRequesting(false);
        return result;
    }, []);

    const resetSession = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        const result = await resetSessionService();
        setIsLoading(false);
        return result;
    }, []);

    const getTemplateByProduct = useCallback(async (productoId: number | string) => {
        setIsLoading(true);
        setError(null);
        const result = await getTemplateByProductService(productoId);
        setIsLoading(false);
        return result;
    }, []);

    const updateTemplateByProduct = useCallback(async (productoId: number | string, template: string) => {
        setIsLoading(true);
        setError(null);
        const result = await updateTemplateByProductService(productoId, template);
        setIsLoading(false);
        return result;
    }, []);

    const deleteTemplateByProduct = useCallback(async (productoId: number | string) => {
        setIsLoading(true);
        setError(null);
        const result = await deleteTemplateByProductService(productoId);
        setIsLoading(false);
        return result;
    }, []);

    return {
        isLoading,
        isRequesting,
        error,
        clearError,
        requestQR,
        resetSession,
        getTemplateByProduct,
        updateTemplateByProduct,
        deleteTemplateByProduct
    };
}
