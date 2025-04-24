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

export interface Product {
  id: number;
  name: string;
  title: string;
  subtitle: string;
  tagline: string;
  description: string;
  specs: any;
  dimensions: any;
  relatedProducts: number[] | null;
  images: string[] | null;
  image: string;
  nombreProducto: string;
  stockProducto: number;
  precioProducto: number;
  seccion: string;
  createdAt: string;
}
