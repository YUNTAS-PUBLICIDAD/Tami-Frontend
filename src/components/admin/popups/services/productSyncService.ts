/**
 * @fileoverview ProductSyncService
 * Orchestrates preview updates across all preview components
 * 
 * Responsibilities:
 * - Construct preview settings from form data and overrides
 * - Dispatch custom events to update preview components
 * - Handle tab-specific preview synchronization
 * - Dispatch editor update events
 * - Update WhatsApp image previews
 * 
 * Methods:
 * - syncPreview(formData, previews, activeTab, whatsappSelected): Main orchestrator
 * - syncPopupPreview(data, previews, overrides): Popup settings
 * - syncWhatsAppPreview(data, previews, selected, overrides): WhatsApp settings
 * - syncEmailPreview(data, previews, overrides): Email settings
 * - updateWhatsAppImagePreview(field, url): WhatsApp image update
 * - updateEditors(formData): Dispatch editor sync events
 */

import type { ProductFormData, TabType, ProductPreviewSettings, WhatsAppPreviewData, EmailPreviewData } from "../types/productTab.types";

export class ProductSyncService {
  /**
   * Sync popup preview with current form data
   * Constructs ProductPreviewSettings and dispatches update-popup-preview event
   * 
   * Handles:
   * - Desktop and mobile image URLs
   * - Button styling (colors and text)
   * - File object cleanup (converts File to null)
   * - Override support for newly uploaded files
   * 
   * @param {ProductFormData} data - Current form state
   * @param {Record<string, string>} previews - Base64 preview URLs
   * @param {Record<string, any>} overrides - Temporary overrides (e.g., newly uploaded files)
   */
  static syncPopupPreview(
    data: ProductFormData,
    previews: Record<string, string | File | null>,
    overrides: Record<string, any> = {}
  ): void {
    const previewSettings: ProductPreviewSettings = {
      popup_image_url: overrides.imagen_popup || previews.imagen_popup || data.imagen_popup,
      popup_image2_url: overrides.imagen_popup2 || previews.imagen_popup2 || data.imagen_popup2,
      button_bg_color: data.etiqueta?.popup_button_color || "#008B8B",
      button_text_color: data.etiqueta?.popup_text_color || "#000000",
      button_text: data.etiqueta?.popup_button_text || "",
      popup_mobile_image_url: overrides.imagen_popup_mobile !== undefined 
        ? overrides.imagen_popup_mobile 
        : (previews.imagen_popup_mobile || data.imagen_popup_mobile),
      popup_mobile_image2_url: overrides.imagen_popup_mobile2 !== undefined 
        ? overrides.imagen_popup_mobile2 
        : (previews.imagen_popup_mobile2 || data.imagen_popup_mobile2)
    };

    // Clean up File objects
    if (previewSettings.popup_image_url instanceof File) previewSettings.popup_image_url = null;
    if (previewSettings.popup_image2_url instanceof File) previewSettings.popup_image2_url = null;
    if (previewSettings.popup_mobile_image_url instanceof File) previewSettings.popup_mobile_image_url = null;
    if (previewSettings.popup_mobile_image2_url instanceof File) previewSettings.popup_mobile_image2_url = null;

    window.dispatchEvent(
      new CustomEvent("update-popup-preview", {
        detail: { settings: previewSettings },
      })
    );
  }

  /**
   * Sync WhatsApp preview based on selected message
   */
  static syncWhatsAppPreview(
    data: ProductFormData,
    previews: Record<string, string | File | null>,
    whatsappSelected: number,
    overrides: Record<string, any> = {}
  ): void {
    let waText = "";
    let waImage: string | File | null = null;

    if (whatsappSelected === 1) {
      waText = data.texto_alt_whatsapp || "";
      waImage = overrides.imagen_whatsapp !== undefined ? overrides.imagen_whatsapp : (previews.imagen_whatsapp || data.imagen_whatsapp);
    } else if (whatsappSelected === 2) {
      waText = data.mensaje_whatsapp_2 || "";
      waImage = overrides.imagen_whatsapp_2 !== undefined ? overrides.imagen_whatsapp_2 : (previews.imagen_whatsapp_2 || data.imagen_whatsapp_2);
    } else if (whatsappSelected === 3) {
      waText = data.mensaje_whatsapp_3 || "";
      waImage = overrides.imagen_whatsapp_3 !== undefined ? overrides.imagen_whatsapp_3 : (previews.imagen_whatsapp_3 || data.imagen_whatsapp_3);
    }

    const eventName = 
      whatsappSelected === 1 ? "update-whatsapp-preview" :
      whatsappSelected === 2 ? "update-whatsapp-preview-2" :
      "update-whatsapp-preview-3";

    window.dispatchEvent(new CustomEvent(eventName, {
      detail: {
        text: waText,
        image: waImage instanceof File ? null : waImage
      }
    }));

    // Sync selector
    window.dispatchEvent(new CustomEvent("sync-whatsapp-selector", { detail: whatsappSelected }));
  }

  /**
   * Sync email preview
   */
  static syncEmailPreview(
    data: ProductFormData,
    previews: Record<string, string | File | null>,
    overrides: Record<string, any> = {},
    selectedIndex: number = 1
  ): void {
    // Choose fields based on selected index (1..3)
    const idx = selectedIndex || 1;
    const imgKey = `imagen_email_${idx}`;
    const asuntoKey = `asunto_${idx}` as keyof ProductFormData;
    const mensajeKey = `mensaje_email_${idx}` as keyof ProductFormData;
    const btnTextKey = `email_btn_text_${idx}` as keyof ProductFormData;
    const btnLinkKey = `email_btn_link_${idx}` as keyof ProductFormData;
    const btnBgKey = `email_btn_bg_color_${idx}` as keyof ProductFormData;
    const btnTextColorKey = `email_btn_text_color_${idx}` as keyof ProductFormData;

    const emailImage = overrides[imgKey] !== undefined ? overrides[imgKey] : (previews[imgKey] || (data as any)[imgKey]);

    const payload = {
      body: (data as any)[mensajeKey] || "",
      title: (data as any)[asuntoKey] || "",
      image: emailImage instanceof File ? null : emailImage,
      btnText: (data as any)[btnTextKey],
      btnLink: (data as any)[btnLinkKey],
      btnBgColor: (data as any)[btnBgKey],
      btnTextColor: (data as any)[btnTextColorKey]
    };

    // Dispatch a general update for the preview (popups manager listens to this)
    window.dispatchEvent(new CustomEvent("update-email-preview", { detail: payload }));

    // Also dispatch per-index events if other parts listen specifically
    window.dispatchEvent(new CustomEvent(`update-email-preview-${idx}`, { detail: payload }));

  }

  /**
   * Sync preview based on active tab
   */
  static syncPreview(
    data: ProductFormData,
    previews: Record<string, string | File | null>,
    activeTab: TabType,
    whatsappSelected: number,
    emailSelected: number = 1,
    overrides: Record<string, any> = {}
  ): void {
    // Always sync popup preview
    this.syncPopupPreview(data, previews, overrides);

    // Switch preview type based on active tab
    window.dispatchEvent(new CustomEvent("switch-preview-type", { detail: activeTab }));

    // Sync specific tab preview
    if (activeTab === "whatsapp") {
      this.syncWhatsAppPreview(data, previews, whatsappSelected, overrides);
    } else if (activeTab === "correo") {
      this.syncEmailPreview(data, previews, overrides, emailSelected);
    }
  }

  /**
   * Dispatch editor update events
   */
  static updateEditors(data: ProductFormData): void {
    window.dispatchEvent(new CustomEvent("update-whatsapp-editor-producto", { detail: data.texto_alt_whatsapp }));
    window.dispatchEvent(new CustomEvent("update-whatsapp-editor-producto-2", { detail: data.mensaje_whatsapp_2 }));
    window.dispatchEvent(new CustomEvent("update-whatsapp-editor-producto-3", { detail: data.mensaje_whatsapp_3 }));
    // Email editors for 3 variants
    window.dispatchEvent(new CustomEvent("update-email-editor-producto-1", { detail: (data as any).mensaje_email_1 }));
    window.dispatchEvent(new CustomEvent("update-email-editor-producto-2", { detail: (data as any).mensaje_email_2 }));
    window.dispatchEvent(new CustomEvent("update-email-editor-producto-3", { detail: (data as any).mensaje_email_3 }));
  }

  /**
   * Dispatch sync selector event
   */
  static syncWhatsAppSelector(whatsappSelected: number): void {
    window.dispatchEvent(new CustomEvent("sync-whatsapp-selector", { detail: whatsappSelected }));
  }

  /**
   * Dispatch individual WhatsApp image preview events
   */
  static updateWhatsAppImagePreview(field: string, url: string): void {
    if (field === "imagen_whatsapp") {
      window.dispatchEvent(new CustomEvent("update-whatsapp-preview", { detail: { image: url } }));
    } else if (field === "imagen_whatsapp_2") {
      window.dispatchEvent(new CustomEvent("update-whatsapp-preview-2", { detail: { image: url } }));
    } else if (field === "imagen_whatsapp_3") {
      window.dispatchEvent(new CustomEvent("update-whatsapp-preview-3", { detail: { image: url } }));
    }
  }
}
