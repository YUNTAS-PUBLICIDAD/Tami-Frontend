import type { Product } from "./Product";

export default interface Section {
  nombreSeccion: string;
  productosDeLaSeccion: Product[];
}
