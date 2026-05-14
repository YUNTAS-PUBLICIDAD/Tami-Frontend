/**
 * useProductSave Hook
 * Manages product save logic and API communication
 */

import { useState, useCallback } from "react";
import apiClient from "../../../services/apiClient";
import { config } from "../../../../config";
import Swal from "sweetalert2";
import { ProductFormBuilderService } from "../services/productFormBuilder";
import type { ProductFormData } from "../types/productTab.types";

interface UseProductSaveReturn {
  isSaving: boolean;
  handleSave: (selectedProductId: string, formData: ProductFormData | null) => Promise<void>;
}

export const useProductSave = (): UseProductSaveReturn => {
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Save product with all form data
   */
  const handleSave = useCallback(
    async (selectedProductId: string, formData: ProductFormData | null) => {
      if (!selectedProductId || !formData) return;

      setIsSaving(true);
      try {
        // Build FormData using service
        const formDataToSend = ProductFormBuilderService.buildProductFormData(
          formData,
          selectedProductId
        );

        const response = await apiClient.post(
          config.endpoints.productos.update(selectedProductId),
          formDataToSend,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        if (response.status === 200 || response.status === 201) {
          Swal.fire({
            icon: "success",
            title: "Configuración guardada",
            text: "El pop-up del producto ha sido actualizado.",
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          throw new Error(`Error al guardar: ${response.status}`);
        }
      } catch (error: any) {
        console.error("❌ Error saving product popup:", error);

        let errorMessage = "No se pudo guardar la configuración.";

        if (error.response?.data?.errors) {
          // Format Laravel validation errors
          const errors = error.response.data.errors;
          errorMessage = Object.keys(errors)
            .map((key) => `${key}: ${errors[key].join(", ")}`)
            .join("\n");
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = error.message || "Error desconocido.";
        }

        Swal.fire({
          icon: "error",
          title: "Error de Guardado",
          text: `❌ ${errorMessage}`,
        });
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  return {
    isSaving,
    handleSave
  };
};
