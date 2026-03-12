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

/** Funciones para manejar templates de whatsapp */
export async function getTemplateByProductService(productoId: number | string): Promise<WhatsappPlantillaServiceResponse<string>> {
    try {
        const response = await apiClient.get(config.endpoints.whatsapp.getTemplateByProduct(productoId));
        return { success: response.status === 200, message: "Plantilla obtenida", data: response.data.data.template };
    } catch (error: any) {
        return { success: false, message: error.response?.data?.message || error.message };
    }
}

export async function updateTemplateByProductService(productoId: number | string, template: string): Promise<WhatsappPlantillaServiceResponse<null>> {
    try {
        const response = await apiClient.put(config.endpoints.whatsapp.updateTemplateByProduct(productoId), { content: template });
        return { success: response.status === 200, message: response.data.message || "Plantilla actualizada" };
    } catch (error: any) {
        return { success: false, message: error.response?.data?.message || error.message };
    }
}

export async function deleteTemplateByProductService(productoId: number | string): Promise<WhatsappPlantillaServiceResponse<null>> {
    try {
        const response = await apiClient.delete(config.endpoints.whatsapp.deleteTemplateByProduct(productoId));
        return { success: response.status === 200, message: response.data.message || "Plantilla eliminada" };
    } catch (error: any) {
        return { success: false, message: error.response?.data?.message || error.message };
    }
}
