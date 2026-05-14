/**
 * @fileoverview useProductPreviewSync Hook
 * Auto-synchronizes preview state when form data or active tab changes
 * 
 * Responsibilities:
 * - Listen for changes in formData, activeTab, whatsappSelected
 * - Trigger preview synchronization via ProductSyncService
 * - Dispatch editor update events
 * 
 * Dependencies (re-runs when any change):
 * - formData: Main form state
 * - previews: Current image previews
 * - activeTab: Current tab (popups | whatsapp | correo)
 * - whatsappSelected: Selected WhatsApp message number (1-3)
 * 
 * @example
 * useProductPreviewSync(formData, previews, activeTab, whatsappSelected);
 */
import { useEffect } from "react";
import { ProductSyncService } from "../services/productSyncService";
import type { ProductFormData, TabType } from "../types/productTab.types";
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
