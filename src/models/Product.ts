import type Dimensions from "./Dimensions";
import type Specs from "./Specs";

// export interface ProductApiPOST {
//   nombre: string;
//   titulo: string;
//   subtitulo: string;
//   link: string;
//   descripcion: string;
//   stock: number;
//   precio: number;
//   seccion: string;
//   especificaciones: string[];
//   imagenes: ImagenForm[];
//   textos_alt: string[];
//   relacionados: number[];
//   etiquetas: {
//     meta_titulo: string;
//     meta_descripcion: string;
//   };
// }

// Interface para el formulario de producto
export interface ProductFormularioPOST {
  nombre: string;
  titulo: string;
  subtitulo: string;
  link: string;
  descripcion: string;
  stock: number;
  precio: number;
  seccion: string;
  especificaciones: string[];
  dimensiones: Dimensions;
  imagenes: ImagenForm[];
  relacionados: number[];
  textos_alt: string[];
  imagen_popup?: File | string | null;
  texto_alt_popup?: string;
  imagen_email?: File | string | null;
  asunto: string; 
  imagen_whatsapp?: File |string| null;
  texto_alt_whatsapp?: string;
  video_url?: string;
  etiqueta: {
    keywords: string[];
    meta_titulo: string;
    meta_descripcion: string;
    popup_estilo: string;
  };
}

// Usado en la base de datos o en el GET
export interface ImagenBack {
  id: number;
  url_imagen: string;
  texto_alt_SEO: string;
  imageTitle?: string;
  asunto?: string; 
  tipo?: string; // 'galeria', 'popup', 'email'
  whatsapp_mensaje?: string;
}

// Usado para el formulario de creación/edición
export interface ImagenForm {
  id?: number;
  url_imagen: File | string | null;
  original_path?: string;
  texto_alt_SEO: string;
  imageTitle?: string;
  cacheKey?: number;
}

export default interface Producto {
  id: number;
  nombre: string;
  seccion: string;
  link: string;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  especificaciones: {valor: string}[];
  productos_relacionados: Producto[] | null;
  imagenes: ImagenBack[]; // las adicionales
  producto_imagenes?: ImagenBack[]; // Todas las imágenes incluyendo popup
  stock: number;
  precio: number;
  video_url?: string;
  createdAt: string | null;
  etiqueta: {
    keywords: string
    meta_titulo: string;
    meta_descripcion: string;
    popup_estilo: string;
  };
  dimensiones: {
    largo: string;
    alto: string;
    ancho: string;
  }
}

// valores por defecto para guardar o editar
export const defaultValuesProduct: ProductFormularioPOST = {
  nombre: "",
  titulo: "",
  subtitulo: "",
  descripcion: "",
  link: "",
  stock: 100,
  precio: 199.99,
  seccion: "Negocio",
  especificaciones: [],
  etiqueta: {
    keywords: [""],
    meta_titulo: "",
    meta_descripcion: "",
    popup_estilo: ""
  },
  relacionados: [],
  imagenes: [
    {
      url_imagen: null,
      texto_alt_SEO: "",
    },
    {
      url_imagen: null,
      texto_alt_SEO: "",
    },
    {
      url_imagen: null,
      texto_alt_SEO: "",
    },
    {
      url_imagen: null,
      texto_alt_SEO: "",
    },
    {
      url_imagen: null,
      texto_alt_SEO: "",
    },
  ],
  textos_alt: [],
  dimensiones: {
    alto: "",
    largo: "",
    ancho: ""
  },
  imagen_popup: null,
  texto_alt_popup: "",
  imagen_email: null,
  asunto: "",
  imagen_whatsapp: null,
  texto_alt_whatsapp: "",
  video_url: ""
};