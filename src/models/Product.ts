import type Dimensions from "./Dimensions";
import type Specs from "./Specs";

export interface ProductPOST {
  nombre: string;
  titulo: string;
  subtitulo: string;
  lema: string;
  descripcion: string;
  imagen_principal: File | null;
  stock: number;
  precioProducto: number;
  seccion: string;
  especificaciones: Record<string, string>;
  dimensiones: Dimensions;
  imagenes: Imagen[];
  relacionados: number[];
}

interface Imagen {
  url_imagen: File | null;
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
  especificaciones: any;
  productos_relacionados: object[] | null;
  imagenes: string[] | null;
  nombreProducto: string;
  stock: number;
  precio: number;
  createdAt: string;
}