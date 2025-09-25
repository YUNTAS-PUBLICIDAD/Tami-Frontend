import { config, getApiUrl } from "config";
import type { ProductApiPOST } from "src/models/Product";

export async function getProducts() {
  try {
    const token = localStorage.getItem("token");
    const url = getApiUrl(config.endpoints.productos.list);
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Error al obtener productos");

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error al obtener productos:", error);
  }
}
export async function getPublicProducts() {
  try {
    const url = getApiUrl(config.endpoints.productos.list); // /api/v1/productos
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) throw new Error("Error al obtener productos públicos");

    return await response.json(); // debe retornar { data: Producto[] }
  } catch (error) {
    console.error("Error al obtener productos públicos:", error);
    return { data: [] };
  }
}
export async function deleteProduct(id: number) {
  try {
    const token = localStorage.getItem("token"); // Asegúrate de que el token esté almacenado en el localStorage
    const response = await fetch(
      getApiUrl(config.endpoints.productos.delete(id)), // Cambia la URL según tu API
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    if (response.ok) {
      return "✅ Producto eliminado exitosamente";
    } else {
      return "❌ Error al eliminar el producto";
    }
  } catch (error) {
    return `Error al obtener productos: \n ${error}`;
  }
}

export async function createProduct(producto: ProductApiPOST) {}
