/**
 * @fileoverview useProductEventListeners Hook
 * Manages global window events for cross-component communication
 * 
 * Responsibilities:
 * - Listen for editor updates (WhatsApp, Email)
 * - Listen for external commands (reset, save)
 * - Dispatch WhatsApp selector sync event
 * - Properly cleanup listeners on unmount
 * 
 * Events Handled:
 * - update-whatsapp-preview (1): WhatsApp message 1 content changes
 * - update-whatsapp-preview-2: WhatsApp message 2 content changes
 * - update-whatsapp-preview-3: WhatsApp message 3 content changes
 * - update-email-preview: Email body content changes
 * - reset-product-selection: Clear all form data
 * - request-save-product-popup: External save trigger
 * 
 * @example
 * useProductEventListeners({
 *   whatsappSelected: 1,
 *   onWhatsappUpdate: (msgNum, text) => updateField(text),
 *   onEmailUpdate: (text) => updateField(text),
 *   onReset: () => clearForm(),
 *   onExternalSave: () => handleSave()
 * });
 */
import { useEffect, useCallback } from "react";
import type { ProductFormData } from "../types/productTab.types";

/**
 * @typedef {Object} UseProductEventListenersProps
 * @property {number} whatsappSelected - Currently selected WhatsApp message (1-3)
 * @property {Function} onWhatsappUpdate - Callback when WhatsApp message content changes
 * @property {Function} onEmailUpdate - Callback when email content changes
 * @property {Function} onReset - Callback to reset all form data
 * @property {Function} onExternalSave - Callback to save product
 */
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
   * Memoized handler for WhatsApp updates
   */
  const handleWhatsappUpdate = useCallback((e: any) => {
    if (typeof e.detail === "string") {
      if (whatsappSelected === 1) onWhatsappUpdate(1, e.detail);
      else if (whatsappSelected === 2) onWhatsappUpdate(2, e.detail);
      else if (whatsappSelected === 3) onWhatsappUpdate(3, e.detail);
    }
  }, [whatsappSelected, onWhatsappUpdate]);

  /**
   * Memoized handler for Email updates
   */
  const handleEmailUpdate = useCallback((e: any) => {
    if (typeof e.detail === "string") {
      onEmailUpdate(e.detail);
    }
  }, [onEmailUpdate]);

  /**
   * Consolidated event listeners - editor updates (WhatsApp, Email)
   */
  useEffect(() => {
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
  }, [handleWhatsappUpdate, handleEmailUpdate]);

  /**
   * Consolidated event listeners - reset and external save
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
