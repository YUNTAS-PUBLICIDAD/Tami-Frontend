import { useEffect } from "react";
import { ProductSyncService } from "../services/productSyncService";
import type { ProductFormData, TabType } from "../types/productTab.types";

/**
 * Hook que sincroniza automáticamente el preview cuando cambian:
 * - formData
 * - activeTab
 * - whatsappSelected
 * - previews
 * 
 * Se ejecuta automáticamente en respuesta a cambios de dependencias
 */
export const useProductPreviewSync = (
    formData: ProductFormData | null,
    previews: Record<string, string | File | null>,
    activeTab: TabType,
    whatsappSelected: number
) => {
    useEffect(() => {
        if (formData) {
            ProductSyncService.syncPreview(formData, previews, activeTab, whatsappSelected);
        }
    }, [formData, activeTab, whatsappSelected, previews]);
};
