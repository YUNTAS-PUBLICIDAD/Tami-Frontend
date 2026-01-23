import { useState, useCallback } from "react";
import type {
    WhatsappPlantillaServiceResponse,
} from "src/models/whatsapp";
import {
    requestQRService,
    resetSessionService,
} from "src/services/admin/whatsapp/whatsappService";

interface UseWhatsappReturn {
    isLoading: boolean;
    isRequesting: boolean;
    error: string | null;
    clearError: () => void;
    requestQR: () => Promise<WhatsappPlantillaServiceResponse<null>>;
    resetSession: () => Promise<WhatsappPlantillaServiceResponse<null>>;
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

    return {
        isLoading,
        isRequesting,
        error,
        clearError,
        requestQR,
        resetSession
    };
}
