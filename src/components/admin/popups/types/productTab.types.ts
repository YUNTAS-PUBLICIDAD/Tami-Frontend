/**
 * ProductTab Types & Interfaces
 * Centralized type definitions for TabProducto and related components
 */

export interface ProductImage {
  id?: number;
  tipo?: string;
  url_imagen: string;
  texto_alt_SEO?: string;
  asunto?: string;
  email_mensaje?: string;
  email_btn_text?: string;
  email_btn_link?: string;
  email_btn_bg_color?: string;
  email_btn_text_color?: string;
  whatsapp_mensaje?: string;
  whatsapp_mensaje_2?: string;
  whatsapp_mensaje_3?: string;
  whatsapp_time_1?: number;
  whatsapp_time_2?: number;
  whatsapp_time_3?: number;
  whatsapp_image_url_2?: string;
  whatsapp_image_url_3?: string;
}

export interface ProductEtiqueta {
  meta_titulo?: string;
  meta_descripcion?: string;
  popup_estilo?: string;
  popup_button_text?: string;
  popup_button_color?: string;
  popup_text_color?: string;
  keywords?: string | string[];
}

export interface ProductDimensiones {
  alto?: string | number;
  largo?: string | number;
  ancho?: string | number;
}

export interface ProductEspecificacion {
  nombre?: string;
  valor?: string;
}

export interface ProductFormData {
  // Base product fields
  id?: string | number;
  nombre?: string;
  titulo?: string;
  subtitulo?: string;
  descripcion?: string;
  seccion?: string;
  link?: string;
  stock?: number;
  precio?: number;

  // Existing images reference
  producto_imagenes?: ProductImage[];

  // Popup Images - Desktop
  imagen_popup: string | File | null;
  texto_alt_popup: string;
  imagen_popup2: string | File | null;
  texto_alt_popup2: string;

  // Popup Images - Mobile
  imagen_popup_mobile: string | File | null;
  texto_alt_popup_mobile: string;
  imagen_popup_mobile2: string | File | null;
  texto_alt_popup_mobile2: string;

  // Email Configuration
  imagen_email: string | File | null;
  asunto: string;
  mensaje_email: string;
  email_btn_text: string;
  email_btn_link: string;
  email_btn_bg_color: string;
  email_btn_text_color: string;

  // WhatsApp Configuration
  imagen_whatsapp: string | File | null;
  texto_alt_whatsapp: string;
  mensaje_whatsapp_2: string;
  imagen_whatsapp_2: string | File | null;
  mensaje_whatsapp_3: string;
  imagen_whatsapp_3: string | File | null;
  whatsapp_time_1: number;
  whatsapp_time_2: number;
  whatsapp_time_3: number;

  // Deletion flags
  delete_imagen_popup?: number;
  delete_imagen_popup2?: number;
  delete_imagen_popup_mobile?: number;
  delete_imagen_popup_mobile2?: number;
  delete_imagen_email?: number;
  delete_imagen_whatsapp?: number;
  delete_imagen_whatsapp_2?: number;
  delete_imagen_whatsapp_3?: number;

  // Etiqueta (metadata)
  etiqueta: ProductEtiqueta;

  // Optional fields
  dimensiones?: ProductDimensiones;
  especificaciones?: ProductEspecificacion[] | Record<string, string>;

  // Detail view customization
  detalle_titulo_tamano?: number;
  detalle_titulo_color?: string;
  detalle_titulo_estilo?: string;
}

export interface ProductPreviewSettings {
  popup_image_url: string | File | null;
  popup_image2_url: string | File | null;
  button_bg_color: string;
  button_text_color: string;
  button_text: string;
  popup_mobile_image_url: string | File | null;
  popup_mobile_image2_url: string | File | null;
}

export interface WhatsAppPreviewData {
  text: string;
  image: string | File | null;
}

export interface EmailPreviewData {
  body: string;
  title: string;
  image: string | File | null;
  btnText: string;
  btnLink: string;
  btnBgColor: string;
  btnTextColor: string;
}

export interface PopupPreviewData {
  settings: ProductPreviewSettings;
}

export type TabType = 'popups' | 'etiqueta' | 'whatsapp' | 'correo';

export interface ProductTabState {
  products: any[];
  loadingProducts: boolean;
  selectedProductId: string;
  formData: ProductFormData | null;
  isSaving: boolean;
  previews: Record<string, string>;
  activeTab: TabType;
  whatsappSelected: number;
}
