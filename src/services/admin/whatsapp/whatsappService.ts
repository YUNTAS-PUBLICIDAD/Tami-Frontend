import { config, getApiUrl } from "config";
import type {
    WhatsappPlantilla,
    WhatsappPlantillaInput,
    WhatsappPlantillaServiceResponse,
    sendWhatsappCampanaResponse,
    LeadInput
} from "src/models/whatsapp";

function getToken() {
    return localStorage.getItem("token");
}

export async function getWhatsappPlantillaByProductService(product_id: number): Promise<WhatsappPlantillaServiceResponse<WhatsappPlantilla | null>> {
    try {
        const token = getToken();
        if (!token) return { success: false, message: "No autenticado" };

        const response = await fetch(getApiUrl(config.endpoints.whatsapp.getOneByProduct(product_id)), {
            headers: { Authorization: `Bearer ${token}` }
        });
        const result = await response.json();

        return {
            success: response.ok,
            message: result.message || "Plantilla whatsapp obtenida",
            data: result.data || null,
        };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function getWhatsappPlantillaDefaultService(): Promise<WhatsappPlantillaServiceResponse<WhatsappPlantilla | null>> {
    try {
        const token = getToken();
        if (!token) return { success: false, message: "No autenticado" };

        const response = await fetch(getApiUrl(config.endpoints.whatsapp.getOneDefault), {
            headers: { Authorization: `Bearer ${token}` }
        });
        const result = await response.json();

        return {
            success: response.ok,
            message: result.message || "Plantilla por defecto obtenida",
            data: result.data || null,
        };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function saveWhatsappPlantillaService(whatsappData: WhatsappPlantillaInput): Promise<WhatsappPlantillaServiceResponse<WhatsappPlantilla>> {
    try {
        const token = getToken();
        if (!token) return { success: false, message: "No autenticado" };

        const formData = new FormData();
        if (whatsappData.producto_id) formData.append("producto_id", whatsappData.producto_id.toString());
        formData.append("mensaje", whatsappData.mensaje);
        if (whatsappData.imagen_principal) formData.append("imagen_principal", whatsappData.imagen_principal);

        const response = await fetch(getApiUrl(config.endpoints.whatsapp.save), {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        });
        const result = await response.json();

        return { success: response.ok, message: result.message || "Plantilla guardada" };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function saveWhatsappPlantillaDefaultService(whatsappData: WhatsappPlantillaInput): Promise<WhatsappPlantillaServiceResponse<WhatsappPlantilla>> {
    try {
        const token = getToken();
        if (!token) return { success: false, message: "No autenticado" };

        const formData = new FormData();
        formData.append("mensaje", whatsappData.mensaje);
        if (whatsappData.imagen_principal) formData.append("imagen_principal", whatsappData.imagen_principal);

        const response = await fetch(getApiUrl(config.endpoints.whatsapp.saveDefault), {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        });
        const result = await response.json();

        return { success: response.ok, message: result.message || "Plantilla por defecto guardada" };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function sendWhatsappService(leadData: LeadInput): Promise<WhatsappPlantillaServiceResponse<null>> {
    try {
        const token = getToken();
        if (!token) return { success: false, message: "No autenticado" };

        const response = await fetch(getApiUrl(config.endpoints.whatsapp.sendOne), {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(leadData),
        });
        const result = await response.json();

        return { success: response.ok, message: result.message || "WhatsApp enviado" };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function sendWhatsappCampanaService(product_id: number): Promise<sendWhatsappCampanaResponse> {
    try {
        const token = getToken();
        if (!token) return { success: false, message: "No autenticado", total_leads: 0, exitosos: 0, fallidos: 0 };

        const response = await fetch(getApiUrl(config.endpoints.whatsapp.sendCampana), {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ producto_id: product_id }),
        });
        const result = await response.json();

        return {
            success: response.ok,
            message: result.message || "Campaña enviada",
            total_leads: result.total_leads || 0,
            exitosos: result.exitosos || 0,
            fallidos: result.fallidos || 0,
        };
    } catch (error: any) {
        return { success: false, message: error.message, total_leads: 0, exitosos: 0, fallidos: 0 };
    }
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
