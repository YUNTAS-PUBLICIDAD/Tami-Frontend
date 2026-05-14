/**
 * useProductForm Hook
 * Manages product form state and field changes
 */

import { useState, useCallback } from "react";
import type { ProductFormData } from "../types/productTab.types";

interface UseProductFormReturn {
  formData: ProductFormData | null;
  setFormData: (data: ProductFormData | null | ((prev: ProductFormData | null) => ProductFormData | null)) => void;
  previews: Record<string, string>;
  setPreviews: (previews: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => void;
  
  // Field operations
  handleFieldChange: (field: string, value: any, isEtiqueta?: boolean) => void;
  handleClearImage: (field: string) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, field: string, onSync: (data: ProductFormData, overrides: Record<string, any>) => void) => void;
}

export const useProductForm = (): UseProductFormReturn => {
  const [formData, setFormData] = useState<ProductFormData | null>(null);
  const [previews, setPreviews] = useState<Record<string, string>>({});

  /**
   * Update a form field with optional preview sync
   */
  const handleFieldChange = useCallback(
    (field: string, value: any, isEtiqueta = false) => {
      setFormData((prev: any) => {
        if (!prev) return null;

        const newData = { ...prev };
        if (isEtiqueta) {
          newData.etiqueta = { ...newData.etiqueta, [field]: value };
        } else {
          newData[field] = value;
        }

        return newData;
      });
    },
    []
  );

  /**
   * Remove an image and mark for deletion
   */
  const handleClearImage = useCallback((field: string) => {
    setPreviews((prev) => {
      const newPreviews = { ...prev };
      delete newPreviews[field];
      return newPreviews;
    });

    setFormData((prev: any) => {
      if (!prev) return null;
      
      const newData = {
        ...prev,
        [field]: null,
        [`delete_${field}`]: 1
      };
      
      return newData;
    });
  }, []);

  /**
   * Handle file upload with FileReader for preview
   */
  const handleFileChange = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>,
      field: string,
      onSync: (data: ProductFormData, overrides: Record<string, any>) => void
    ) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const url = reader.result as string;
          
          // Update preview
          setPreviews((prev) => ({ ...prev, [field]: url }));

          // Update form data
          setFormData((prev: any) => {
            if (!prev) return null;

            const newData = {
              ...prev,
              [field]: file,
              [`delete_${field}`]: 0
            };

            // Trigger preview sync with the new URL
            onSync(newData, { [field]: url });
            
            return newData;
          });
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  return {
    formData,
    setFormData,  // Return useState setter directly
    previews,
    setPreviews,  // Return useState setter directly
    handleFieldChange,
    handleClearImage,
    handleFileChange
  };
};
