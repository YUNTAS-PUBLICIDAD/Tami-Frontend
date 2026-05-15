import type Producto from "../models/Product";
import { config, getApiUrl } from "../../config";

const normalizeProductsResponse = (responseData: unknown): Producto[] => {
    if (Array.isArray(responseData)) return responseData as Producto[];
    const responseObj = responseData as any;
    if (Array.isArray(responseObj.data)) return responseObj.data;
    if (Array.isArray(responseObj.data?.data)) return responseObj.data.data;
    if (Array.isArray(responseObj.data?.productos)) return responseObj.data.productos;
    if (Array.isArray(responseObj.data?.data?.productos)) return responseObj.data.data.productos;
    return [];
};

export const ProductoService = {
    getAllProductos: async (signal?: AbortSignal): Promise<Producto[]> => {
        try {
            const url = getApiUrl(config.endpoints.productos.list);
            const response = await fetch(url, { signal });
            if (!response.ok) {
                if (response.status === 403) {
                    console.warn("⚠️ API de productos devolvió 403 (Prohibido)");
                    return [];
                }
                throw new Error(`Error al obtener productos: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return normalizeProductsResponse(data);
        } catch (error: any) {
            if (error?.name === "AbortError") {
                console.warn("🛑 Fetch cancelado");
            } else {
                console.error("🚨 Error en ProductoService.getAllProductos:", error);
            }
            return [];
        }
    },
};

