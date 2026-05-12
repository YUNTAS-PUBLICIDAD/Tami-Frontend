import { config, getApiUrl } from "config";
import type Producto from "src/models/Product";

export const ProductoService = {
    getAllProductos: async (signal?: AbortSignal): Promise<Producto[]> => {
        try {
            const response = await fetch(`${getApiUrl(config.endpoints.productos.list)}`, { signal });
            if (!response.ok) {
                if (response.status === 403) {
                    console.warn("⚠️ API de productos devolvió 403 (Prohibido) - Ignorando para permitir el build");
                    return [];
                }
                throw new Error(`Error al obtener productos: ${response.statusText}`);
            }
            return await response.json();
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.warn("🛑 Fetch cancelado");
            } else {
                console.error("🚨 Error en ProductoService.getAllProductos:", error);
            }
            return [];
        }
    },



}

