import { config } from "config";
import apiClient from "src/services/apiClient";
import type {
    WhatsappPlantillaServiceResponse,
} from "src/models/whatsapp";

export async function requestQRService(): Promise<WhatsappPlantillaServiceResponse<null>> {
    try {
        const response = await apiClient.post(config.endpoints.whatsapp.requestQR);
        return { success: response.status === 200, message: response.data.message || "QR solicitado" };
    } catch (error: any) {
        return { success: false, message: error.response?.data?.message || error.message };
    }
}

export async function resetSessionService(): Promise<WhatsappPlantillaServiceResponse<null>> {
    try {
        const response = await apiClient.post(config.endpoints.whatsapp.resetSession);
        return { success: response.status === 200, message: response.data.message || "Sesión reseteada" };
    } catch (error: any) {
        return { success: false, message: error.response?.data?.message || error.message };
    }
}
