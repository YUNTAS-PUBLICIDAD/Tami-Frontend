/**
 * @fileoverview useProductSelection Hook
 * Orchestrates complete product selection workflow
 * 
 * Responsibilities:
 * - Fetch product details from API
 * - Transform API response to form data
 * - Sync initial data to editor components
 * - Trigger initial preview synchronization
 * - Handle selection errors with user feedback
 * - Manage selectedProductId state
 * 
 * @example
 * const { selectedProductId, handleProductSelect } = useProductSelection(
 *   setFormData,
 *   setPreviews,
 *   activeTab,
 *   whatsappSelected
 * );
 */
import { useState, useCallback } from "react";
import Swal from "sweetalert2";
import apiClient from "../../../../services/apiClient";
import { config } from "../../../../../config";
import { ProductFormBuilderService } from "../services/productFormBuilder";
import { ProductSyncService } from "../services/productSyncService";
import type { ProductFormData, TabType } from "../types/productTab.types";

/**
 * @typedef {Object} UseProductSelectionReturn
 * @property {string} selectedProductId - Currently selected product ID (empty string if none)
 * @property {Function} setSelectedProductId - Direct setter for product ID
 * @property {Function} handleProductSelect - Async handler to fetch and load product
 */
interface UseProductSelectionReturn {
    selectedProductId: string;
    setSelectedProductId: (id: string) => void;
    handleProductSelect: (productId: string) => Promise<void>;
}
export const useProductSelection = (
    setFormData: (data: ProductFormData | null | ((prev: ProductFormData | null) => ProductFormData | null)) => void,
    setPreviews: (previews: Record<string, string | File | null> | ((prev: Record<string, string | File | null>) => Record<string, string | File | null>)) => void,
    activeTab: TabType,
    whatsappSelected: number
): UseProductSelectionReturn => {
    const [selectedProductId, setSelectedProductId] = useState<string>("");

    const handleProductSelect = useCallback(
        async (productId: string) => {
            setSelectedProductId(productId);

            // Clear data if no product selected
            if (!productId) {
                setFormData(null);
                setPreviews({});
                return;
            }

            try {
                // Fetch complete product details
                const response = await apiClient.get(config.endpoints.productos.detail(productId));
                const product = response.data.data || response.data;

                // Build initial form data using service
                const initialData = ProductFormBuilderService.buildInitialFormData(product, config.apiUrl);
                setFormData(initialData);

                // Update editors with initial values
                ProductSyncService.updateEditors(initialData);

                // Sync preview with initial data
                ProductSyncService.syncPreview(initialData, {}, activeTab, whatsappSelected);
            } catch (error) {
                console.error("Error fetching product details:", error);
                setSelectedProductId("");
                
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "No se pudieron obtener los detalles del producto."
                });
            }
        },
        [setFormData, setPreviews, activeTab, whatsappSelected]
    );

    return { selectedProductId, setSelectedProductId, handleProductSelect };
};
