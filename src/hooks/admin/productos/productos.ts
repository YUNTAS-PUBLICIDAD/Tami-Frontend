import apiClient from "../../../services/apiClient";
import { config } from "../../../../config.ts";
import type { ProductFormularioPOST } from "src/models/Product";

export async function getProducts() {
  try {
    const response = await apiClient.get(config.endpoints.productos.list);
    return response.data;
  } catch (error) {
    console.error("Error al obtener productos:", error);
  }
}

export async function getPublicProducts() {
  try {
    const response = await apiClient.get(config.endpoints.productos.list);
    return response.data;
  } catch (error) {
    console.error("Error al obtener productos públicos:", error);
    return { data: [] };
  }
}

export async function deleteProduct(id: number) {
  try {
    const response = await apiClient.delete(config.endpoints.productos.delete(id));

    if (response.status === 200 || response.status === 204) {
      return "✅ Producto eliminado exitosamente";
    } else {
      return "❌ Error al eliminar el producto";
    }
  } catch (error) {
    return `Error al obtener productos: \n ${error}`;
  }
}


export async function createProduct(producto: ProductFormularioPOST) {
  try {
    const response = await apiClient.post(config.endpoints.productos.create, producto);
    return response.data;
  } catch (error) {
    console.error("Error al crear producto:", error);
    throw error;
  }
}
