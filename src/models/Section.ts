import type Producto from "./Product";

export default interface Section {
  nombreSeccion: string;
  productosDeLaSeccion: Producto[];
}