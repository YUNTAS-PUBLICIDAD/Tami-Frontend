import type Dimensions from "./Dimensions";
import type Specs from "./Specs";

export interface ProductApiPOST {
  nombre: string;
  titulo: string;
  subtitulo: string;
  lema: string;
  link: string;
  descripcion: string;
  stock: number;
  precio: number;
  seccion: string;
  especificaciones: Object
  imagenes: File[];
  textos_alt: string[];
  relacionados: number[];
}

export interface ProductFormularioPOST {
  nombre: string;
  titulo: string;
  subtitulo: string;
  lema: string;
  descripcion: string;
  stock: number;
  precio: number;
  seccion: string;
  especificaciones: Record<string, string>;
  // dimensiones: Dimensions;
  imagenes: Imagen[];
  relacionados: number[];
  textos_alt: string[];
}

interface Imagen {
  url_imagen: File | string | null;
  texto_alt_SEO: string;
}

export default interface Producto {
  id: number;
  nombre: string;
  seccion: string;
  link: string;
  titulo: string;
  subtitulo: string;
  lema: string;
  descripcion: string;
  especificaciones: { [clave: string]: string };
  productos_relacionados: object[] | null;
  imagenes: Imagen[]; // las adicionales
  stock: number;
  precio: number;
  createdAt: string | null;
}