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
import { useEffect, useRef } from "react";
import { ProductSyncService } from "../services/productSyncService";
import type { ProductFormData, TabType } from "../types/productTab.types";
export const useProductPreviewSync = (
    formData: ProductFormData | null,
    previews: Record<string, string | File | null>,
    activeTab: TabType,
    whatsappSelected: number,
    emailSelected: number = 1
) => {
    // Time-gate para evitar doble sincronización en menos de 100ms
    // (ej: cuando el callback de FileReader y el useEffect se ejecutan casi al mismo tiempo)
    const lastSyncRef = useRef(0);

    useEffect(() => {
        if (formData) {
            const now = Date.now();
            if (now - lastSyncRef.current > 100) {
                ProductSyncService.syncPreview(formData, previews, activeTab, whatsappSelected, emailSelected);
                lastSyncRef.current = now;
            }
        }
    }, [formData, activeTab, whatsappSelected, previews, emailSelected]);
};
