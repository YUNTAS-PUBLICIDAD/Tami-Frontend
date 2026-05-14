/**
 * useProductEventListeners Hook
 * Manages global window events and external communications
 */

import { useEffect } from "react";
import type { ProductFormData } from "../types/productTab.types";

interface UseProductEventListenersProps {
  whatsappSelected: number;
  onWhatsappUpdate: (messageNumber: 1 | 2 | 3, text: string) => void;
  onEmailUpdate: (text: string) => void;
  onReset: () => void;
  onExternalSave: () => void;
}

export const useProductEventListeners = ({
  whatsappSelected,
  onWhatsappUpdate,
  onEmailUpdate,
  onReset,
  onExternalSave
}: UseProductEventListenersProps): void => {
  /**
   * Listen for WhatsApp and Email editor updates
   */
  useEffect(() => {
    const handleWhatsappUpdate = (e: any) => {
      if (typeof e.detail === "string") {
        if (whatsappSelected === 1) onWhatsappUpdate(1, e.detail);
        else if (whatsappSelected === 2) onWhatsappUpdate(2, e.detail);
        else if (whatsappSelected === 3) onWhatsappUpdate(3, e.detail);
      }
    };

    const handleEmailUpdate = (e: any) => {
      if (typeof e.detail === "string") {
        onEmailUpdate(e.detail);
      }
    };

    window.addEventListener("update-whatsapp-preview", handleWhatsappUpdate);
    window.addEventListener("update-whatsapp-preview-2", handleWhatsappUpdate);
    window.addEventListener("update-whatsapp-preview-3", handleWhatsappUpdate);
    window.addEventListener("update-email-preview", handleEmailUpdate);

    return () => {
      window.removeEventListener("update-whatsapp-preview", handleWhatsappUpdate);
      window.removeEventListener("update-whatsapp-preview-2", handleWhatsappUpdate);
      window.removeEventListener("update-whatsapp-preview-3", handleWhatsappUpdate);
      window.removeEventListener("update-email-preview", handleEmailUpdate);
    };
  }, [whatsappSelected, onWhatsappUpdate, onEmailUpdate]);

  /**
   * Listen for reset and external save events
   */
  useEffect(() => {
    const handleReset = () => {
      onReset();
    };

    const handleExternalSave = () => {
      onExternalSave();
    };

    window.addEventListener("reset-product-selection", handleReset);
    window.addEventListener("request-save-product-popup", handleExternalSave);

    return () => {
      window.removeEventListener("reset-product-selection", handleReset);
      window.removeEventListener("request-save-product-popup", handleExternalSave);
    };
  }, [onReset, onExternalSave]);

  /**
   * Dispatch WhatsApp selector sync event
   */
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("sync-whatsapp-selector", { detail: whatsappSelected })
    );
  }, [whatsappSelected]);
};
