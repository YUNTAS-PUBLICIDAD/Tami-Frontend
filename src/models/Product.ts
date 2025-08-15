import type Dimensions from "./Dimensions";
import type Specs from "./Specs";

export interface ProductApiPOST {
  nombre: string;
  titulo: string;
  subtitulo: string;
  link: string;
  descripcion: string;
  stock: number;
  precio: number;
  seccion: string;
  especificaciones: Object
  imagenes: File[];
  textos_alt: string[];
  relacionados: number[];
  etiquetas: {
    meta_titulo: string;
    meta_descripcion: string;
  };
}

export interface ProductFormularioPOST {
  nombre: string;
  titulo: string;
  subtitulo: string;
  link: string;
  descripcion: string;
  stock: number;
  precio: number;
  seccion: string;
  especificaciones: Record<string, string>;
  // dimensiones: Dimensions;
  imagenes: ImagenForm[];
  relacionados: number[];
  textos_alt: string[];
  etiqueta: {
    meta_titulo: string;
    meta_descripcion: string;
  };
}

// Usado en la base de datos o en el GET
export interface ImagenBack {
  url_imagen: string;
  texto_alt_SEO: string;
  imageTitle?: string;
}

// Usado para el formulario de creación/edición
export interface ImagenForm {
  url_imagen: File | string | null;
  texto_alt_SEO: string;
  imageTitle?: string;
}

export default interface Producto {
  id: number;
  nombre: string;
  seccion: string;
  link: string;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  especificaciones: { [clave: string]: string };
  productos_relacionados: object[] | null;
  imagenes: ImagenBack[]; // las adicionales
  stock: number;
  precio: number;
  createdAt: string | null;
  etiqueta: {
    meta_titulo: string;
    meta_descripcion: string;
  };
}