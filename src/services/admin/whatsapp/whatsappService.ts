import { config, getApiUrl } from "config";
import type {
    WhatsappPlantillaServiceResponse,
} from "src/models/whatsapp";

function getToken() {
    return localStorage.getItem("token");
}

export async function requestQRService(): Promise<WhatsappPlantillaServiceResponse<null>> {
    try {
        const token = getToken();
        if (!token) return { success: false, message: "No autenticado" };

        const response = await fetch(getApiUrl(config.endpoints.whatsapp.requestQR), {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` }
        });
        const result = await response.json();

        return { success: response.ok, message: result.message || "QR solicitado" };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function resetSessionService(): Promise<WhatsappPlantillaServiceResponse<null>> {
    try {
        const token = getToken();
        if (!token) return { success: false, message: "No autenticado" };

        const response = await fetch(getApiUrl(config.endpoints.whatsapp.resetSession), {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` }
        });
        const result = await response.json();

        return { success: response.ok, message: result.message || "Sesión reseteada" };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
