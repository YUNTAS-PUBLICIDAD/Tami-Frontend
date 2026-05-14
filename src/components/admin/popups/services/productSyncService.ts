/**
 * Product Sync Service
 * Manages preview synchronization with preview components
 */

import { ProductFormData, TabType, ProductPreviewSettings, WhatsAppPreviewData, EmailPreviewData } from "../types/productTab.types";

export class ProductSyncService {
  /**
   * Sync popup preview with current form data
   */
  static syncPopupPreview(
    data: ProductFormData,
    previews: Record<string, string>,
    overrides: Record<string, any> = {}
  ): void {
    const previewSettings: ProductPreviewSettings = {
      popup_image_url: overrides.imagen_popup || previews.imagen_popup || data.imagen_popup,
      popup_image2_url: overrides.imagen_popup2 || previews.imagen_popup2 || data.imagen_popup2,
      button_bg_color: data.etiqueta.popup_button_color,
      button_text_color: data.etiqueta.popup_text_color,
      button_text: data.etiqueta.popup_button_text,
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
    previews: Record<string, string>,
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
    previews: Record<string, string>,
    overrides: Record<string, any> = {}
  ): void {
    const emailImage = overrides.imagen_email !== undefined ? overrides.imagen_email : (previews.imagen_email || data.imagen_email);
    
    window.dispatchEvent(new CustomEvent("update-email-preview", {
      detail: {
        body: data.mensaje_email || "",
        title: data.asunto || "",
        image: emailImage instanceof File ? null : emailImage,
        btnText: data.email_btn_text,
        btnLink: data.email_btn_link,
        btnBgColor: data.email_btn_bg_color,
        btnTextColor: data.email_btn_text_color
      }
    }));
  }

  /**
   * Sync preview based on active tab
   */
  static syncPreview(
    data: ProductFormData,
    previews: Record<string, string>,
    activeTab: TabType,
    whatsappSelected: number,
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
      this.syncEmailPreview(data, previews, overrides);
    }
  }

  /**
   * Dispatch editor update events
   */
  static updateEditors(data: ProductFormData): void {
    window.dispatchEvent(new CustomEvent("update-whatsapp-editor-producto", { detail: data.texto_alt_whatsapp }));
    window.dispatchEvent(new CustomEvent("update-whatsapp-editor-producto-2", { detail: data.mensaje_whatsapp_2 }));
    window.dispatchEvent(new CustomEvent("update-whatsapp-editor-producto-3", { detail: data.mensaje_whatsapp_3 }));
    window.dispatchEvent(new CustomEvent("update-email-editor-producto", { detail: data.mensaje_email }));
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
