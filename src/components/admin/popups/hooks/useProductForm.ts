/**
 * @fileoverview useProductForm Hook
 * Manages complete product form state including field updates, image uploads, and preview generation
 * 
 * Responsibilities:
 * - Maintains ProductFormData state (50+ form fields)
 * - Manages image preview state (base64 strings from FileReader)
 * - Provides field update handlers (both simple and nested fields)
 * - Handles file uploads with FileReader API for instant preview
 * - Marks images for deletion with delete_* flags
 * 
 * @example
 * const { formData, handleFieldChange, handleFileChange } = useProductForm();
 */

import { useState, useCallback } from "react";
import type { ProductFormData } from "../types/productTab.types";

/**
 * @typedef {Object} UseProductFormReturn
 * @property {ProductFormData | null} formData - Complete form state (null when no product selected)
 * @property {Function} setFormData - Setter for form data (accepts direct value or updater function)
 * @property {Record<string, string | File | null>} previews - Base64 preview strings for images
 * @property {Function} setPreviews - Setter for preview state
 * @property {Function} handleFieldChange - Update a single form field
 * @property {Function} handleClearImage - Remove image and mark for deletion
 * @property {Function} handleFileChange - Upload file, generate preview, update form
 */
interface UseProductFormReturn {
  formData: ProductFormData | null;
  setFormData: (data: ProductFormData | null | ((prev: ProductFormData | null) => ProductFormData | null)) => void;
  previews: Record<string, string | File | null>;
  setPreviews: (previews: Record<string, string | File | null> | ((prev: Record<string, string | File | null>) => Record<string, string | File | null>)) => void;
  
  // Field operations
  handleFieldChange: (field: string, value: any, isEtiqueta?: boolean) => void;
  handleClearImage: (field: string) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, field: string, onSync: (data: ProductFormData, overrides: Record<string, any>) => void) => void;
}

export const useProductForm = (): UseProductFormReturn => {
  const [formData, setFormData] = useState<ProductFormData | null>(null);
  const [previews, setPreviews] = useState<Record<string, string | File | null>>({});

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
