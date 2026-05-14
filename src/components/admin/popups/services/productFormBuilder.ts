/**
 * @fileoverview ProductFormBuilderService
 * Transforms ProductFormData state into FormData for API submission
 * 
 * Responsibilities:
 * - Build FormData from ProductFormData state
 * - Handle file serialization (File objects → FormData)
 * - Transform nested fields (etiqueta, gallery images)
 * - Mark deleted fields with delete_* flags
 * - Handle URL cleanup (remove baseURL from existing images)
 * - Build initial ProductFormData from API response
 * - Convert relative URLs to full URLs for preview
 * 
 * Methods:
 * - buildProductFormData(formData, productId): FormData for save
 * - buildInitialFormData(product, apiUrl): ProductFormData from API
 * - getFullImageUrl(url, apiUrl): Converts relative to full URL
 */

import { ProductFormData } from "../types/productTab.types";
import { config } from "../../../../../config";

export class ProductFormBuilderService {
  /**
   * Build FormData object for product update
   * Serializes ProductFormData into multipart/form-data for API submission
   * 
   * Handles:
   * - Simple string fields (nombre, titulo, descripcion, etc.)
   * - Numeric fields (stock, precio)
   * - File uploads (popup images, whatsapp images, email image)
   * - Nested fields (button colors, links in etiqueta)
   * - Deletion flags (delete_* fields)
   * - Gallery images (existing and new)
   * 
   * @param {ProductFormData} formData - Complete form state
   * @param {string} selectedProductId - Product ID for API endpoint
   * @returns {FormData} Serialized data ready for multipart POST
   */
  static buildProductFormData(
    formData: ProductFormData,
    selectedProductId: string
  ): FormData {
    const formDataToSend = new FormData();

    // Base product fields (required)
    formDataToSend.append("nombre", formData.nombre || "");
    formDataToSend.append("titulo", formData.titulo || "");
    formDataToSend.append("subtitulo", formData.subtitulo || "");
    formDataToSend.append("descripcion", formData.descripcion || "");
    formDataToSend.append("seccion", formData.seccion || "");
    formDataToSend.append("link", formData.link || "");
    formDataToSend.append("stock", String(formData.stock ?? 0));
    formDataToSend.append("precio", String(formData.precio ?? 0));

    // Gallery images reference
    if (Array.isArray(formData.producto_imagenes)) {
      formData.producto_imagenes
        .filter((img: any) => img?.tipo === "galeria" || !img?.tipo)
        .forEach((img: any, idx: number) => {
          let urlLimpia = img.url_imagen || "";
          if (typeof urlLimpia === "string" && urlLimpia.includes(config.apiUrl)) {
            urlLimpia = urlLimpia.replace(config.apiUrl, "");
          }
          if (typeof urlLimpia === "string") {
            urlLimpia = urlLimpia.split("?")[0];
          }

          formDataToSend.append(`imagenes_existentes[${idx}][url]`, urlLimpia || "");
          if (img.id != null) {
            formDataToSend.append(`imagenes_existentes[${idx}][id]`, String(img.id));
          }
          formDataToSend.append(`imagenes_existentes[${idx}][alt]`, img.texto_alt_SEO || "");
        });
    }

    // Popup Images - Desktop
    this.appendImageField(formDataToSend, "imagen_popup", formData.imagen_popup);
    formDataToSend.append("texto_alt_popup", formData.texto_alt_popup || "");

    this.appendImageField(formDataToSend, "imagen_popup2", formData.imagen_popup2);
    formDataToSend.append("texto_alt_popup2", formData.texto_alt_popup2 || "");
    formDataToSend.append("texto_alt_popup_2", formData.texto_alt_popup2 || ""); // Backend compat

    // Popup Images - Mobile
    this.appendImageField(formDataToSend, "imagen_popup_mobile", formData.imagen_popup_mobile);
    if (formData.delete_imagen_popup_mobile === 1) {
      formDataToSend.append("delete_imagen_popup_mobile", "1");
    }
    formDataToSend.append("texto_alt_popup_mobile", formData.texto_alt_popup_mobile || "");

    this.appendImageField(formDataToSend, "imagen_popup_mobile2", formData.imagen_popup_mobile2);
    if (formData.delete_imagen_popup_mobile2 === 1) {
      formDataToSend.append("delete_imagen_popup_mobile2", "1");
    }
    formDataToSend.append("texto_alt_popup_mobile2", formData.texto_alt_popup_mobile2 || "");

    // Email Configuration
    this.appendImageField(formDataToSend, "imagen_email", formData.imagen_email);
    if (formData.delete_imagen_email === 1) {
      formDataToSend.append("delete_imagen_email", "1");
    }
    formDataToSend.append("asunto", formData.asunto || "");
    formDataToSend.append("mensaje_email", formData.mensaje_email || "");
    formDataToSend.append("email_btn_text", formData.email_btn_text || "Ver Productos");
    formDataToSend.append("email_btn_link", formData.email_btn_link || "https://tami.com/productos");
    formDataToSend.append("email_btn_bg_color", formData.email_btn_bg_color || "#0b1c3c");
    formDataToSend.append("email_btn_text_color", formData.email_btn_text_color || "#ffffff");

    // WhatsApp Configuration
    this.appendImageField(formDataToSend, "imagen_whatsapp", formData.imagen_whatsapp);
    if (formData.delete_imagen_whatsapp === 1) {
      formDataToSend.append("delete_imagen_whatsapp", "1");
    }
    formDataToSend.append("texto_alt_whatsapp", formData.texto_alt_whatsapp || "");
    formDataToSend.append("mensaje_whatsapp", formData.texto_alt_whatsapp || "");

    // WhatsApp Message 2
    this.appendImageField(formDataToSend, "imagen_whatsapp_2", formData.imagen_whatsapp_2);
    if (formData.delete_imagen_whatsapp_2 === 1) {
      formDataToSend.append("delete_imagen_whatsapp_2", "1");
    }
    formDataToSend.append("mensaje_whatsapp_2", formData.mensaje_whatsapp_2 || "");

    // WhatsApp Message 3
    this.appendImageField(formDataToSend, "imagen_whatsapp_3", formData.imagen_whatsapp_3);
    if (formData.delete_imagen_whatsapp_3 === 1) {
      formDataToSend.append("delete_imagen_whatsapp_3", "1");
    }
    formDataToSend.append("mensaje_whatsapp_3", formData.mensaje_whatsapp_3 || "");

    // WhatsApp Timing
    formDataToSend.append("whatsapp_time_1", String(formData.whatsapp_time_1 || 0));
    formDataToSend.append("whatsapp_time_2", String(formData.whatsapp_time_2 || 0));
    formDataToSend.append("whatsapp_time_3", String(formData.whatsapp_time_3 || 0));

    // Desktop image deletion flags
    if (!(formData.imagen_popup instanceof File) && formData.delete_imagen_popup === 1) {
      formDataToSend.append("delete_imagen_popup", "1");
    }
    if (!(formData.imagen_popup2 instanceof File) && formData.delete_imagen_popup2 === 1) {
      formDataToSend.append("delete_imagen_popup2", "1");
      formDataToSend.append("delete_imagen_popup_2", "1");
    }

    // Etiqueta fields
    formDataToSend.append("etiqueta[meta_titulo]", formData.etiqueta?.meta_titulo || "");
    formDataToSend.append("etiqueta[meta_descripcion]", formData.etiqueta?.meta_descripcion || "");
    formDataToSend.append("etiqueta[popup_estilo]", formData.etiqueta?.popup_estilo || "estilo1");
    formDataToSend.append("etiqueta[popup_button_text]", formData.etiqueta?.popup_button_text || "¡COTIZA AHORA!");
    formDataToSend.append("etiqueta[popup_button_color]", formData.etiqueta?.popup_button_color || "#008B8B");
    formDataToSend.append("etiqueta[popup_text_color]", formData.etiqueta?.popup_text_color || "#000000");

    // API flags
    formDataToSend.append("_method", "PUT");
    formDataToSend.append("only_popup", "1");

    // Detail customization
    formDataToSend.append("detalle_titulo_tamano", String(formData.detalle_titulo_tamano || 24));
    formDataToSend.append("detalle_titulo_color", formData.detalle_titulo_color || "#015f86");
    formDataToSend.append("detalle_titulo_estilo", formData.detalle_titulo_estilo || "negrita");

    // Dimensiones
    if (formData.dimensiones) {
      formDataToSend.append("dimensiones[alto]", String(formData.dimensiones.alto || "0"));
      formDataToSend.append("dimensiones[largo]", String(formData.dimensiones.largo || "0"));
      formDataToSend.append("dimensiones[ancho]", String(formData.dimensiones.ancho || "0"));
    }

    // Especificaciones
    if (formData.especificaciones) {
      let specsToSend = formData.especificaciones;
      if (Array.isArray(specsToSend)) {
        const specsObj: Record<string, string> = {};
        specsToSend.forEach((s: any) => {
          if (s?.nombre && s?.valor) specsObj[s.nombre] = s.valor;
        });
        specsToSend = specsObj;
      }
      formDataToSend.append("especificaciones", typeof specsToSend === 'string' ? specsToSend : JSON.stringify(specsToSend));
    }

    // Keywords
    if (formData.etiqueta?.keywords) {
      const keywords = formData.etiqueta.keywords;
      const kwArray = Array.isArray(keywords)
        ? keywords
        : String(keywords).split(",").map((k: string) => k.trim()).filter(Boolean);
      formDataToSend.append("keywords", JSON.stringify(kwArray));
    }

    return formDataToSend;
  }

  /**
   * Helper to append image field - handles File and string URLs
   */
  private static appendImageField(
    formData: FormData,
    fieldName: string,
    fieldValue: string | File | null
  ): void {
    if (fieldValue instanceof File) {
      formData.append(fieldName, fieldValue);
    }
  }

  /**
   * Build initial form data from product response
   */
  static buildInitialFormData(product: any, apiUrl: string): ProductFormData {
    const imagenPopup = product.producto_imagenes?.find((img: any) => img.tipo === "popup");
    const imagenPopup2 = product.producto_imagenes?.find((img: any) => {
      const tipo = (img.tipo || "").toLowerCase();
      return tipo === "popup2" || tipo === "popup_2";
    });
    const imagenPopupMobile = product.producto_imagenes?.find((img: any) => img.tipo === "popup_mobile");
    const imagenPopupMobile2 = product.producto_imagenes?.find((img: any) => img.tipo === "popup_mobile2");
    const imagenEmail = product.producto_imagenes?.find((img: any) => img.tipo === "email");
    const imagenWhatsapp = product.producto_imagenes?.find((img: any) => img.tipo === "whatsapp");

    return {
      ...product,
      imagen_popup: imagenPopup ? this.getFullImageUrl(imagenPopup.url_imagen, apiUrl) : null,
      texto_alt_popup: imagenPopup?.texto_alt_SEO || "",
      imagen_popup2: imagenPopup2 ? this.getFullImageUrl(imagenPopup2.url_imagen, apiUrl) : null,
      texto_alt_popup2: imagenPopup2?.texto_alt_SEO || "",
      imagen_popup_mobile: imagenPopupMobile ? this.getFullImageUrl(imagenPopupMobile.url_imagen, apiUrl) : null,
      texto_alt_popup_mobile: imagenPopupMobile?.texto_alt_SEO || "",
      imagen_popup_mobile2: imagenPopupMobile2 ? this.getFullImageUrl(imagenPopupMobile2.url_imagen, apiUrl) : null,
      texto_alt_popup_mobile2: imagenPopupMobile2?.texto_alt_SEO || "",

      imagen_email: imagenEmail ? this.getFullImageUrl(imagenEmail.url_imagen, apiUrl) : null,
      asunto: imagenEmail?.asunto || "",
      mensaje_email: imagenEmail?.email_mensaje || "",
      email_btn_text: imagenEmail?.email_btn_text || "Ver Productos",
      email_btn_link: imagenEmail?.email_btn_link || "https://tami.com/productos",
      email_btn_bg_color: imagenEmail?.email_btn_bg_color || "#0b1c3c",
      email_btn_text_color: imagenEmail?.email_btn_text_color || "#ffffff",

      imagen_whatsapp: imagenWhatsapp ? this.getFullImageUrl(imagenWhatsapp.url_imagen, apiUrl) : null,
      texto_alt_whatsapp: imagenWhatsapp?.whatsapp_mensaje || "",
      mensaje_whatsapp_2: imagenWhatsapp?.whatsapp_mensaje_2 || "",
      mensaje_whatsapp_3: imagenWhatsapp?.whatsapp_mensaje_3 || "",
      whatsapp_time_1: imagenWhatsapp?.whatsapp_time_1 || 0,
      whatsapp_time_2: imagenWhatsapp?.whatsapp_time_2 || 0,
      whatsapp_time_3: imagenWhatsapp?.whatsapp_time_3 || 0,
      imagen_whatsapp_2: imagenWhatsapp?.whatsapp_image_url_2 ? this.getFullImageUrl(imagenWhatsapp.whatsapp_image_url_2, apiUrl) : null,
      imagen_whatsapp_3: imagenWhatsapp?.whatsapp_image_url_3 ? this.getFullImageUrl(imagenWhatsapp.whatsapp_image_url_3, apiUrl) : null,

      delete_imagen_popup: 0,
      delete_imagen_popup2: 0,
      delete_imagen_popup_mobile: 0,
      delete_imagen_popup_mobile2: 0,
      delete_imagen_email: 0,
      delete_imagen_whatsapp: 0,
      delete_imagen_whatsapp_2: 0,
      delete_imagen_whatsapp_3: 0,
      etiqueta: {
        ...product.etiqueta,
        popup_button_color: product.etiqueta?.popup_button_color || "#008B8B",
        popup_text_color: product.etiqueta?.popup_text_color || "#000000",
        popup_button_text: product.etiqueta?.popup_button_text || "¡COTIZA AHORA!",
      }
    };
  }

  /**
   * Get full image URL with API base
   */
  static getFullImageUrl(url: string, apiUrl: string): string {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${apiUrl}${url}`;
  }
}
