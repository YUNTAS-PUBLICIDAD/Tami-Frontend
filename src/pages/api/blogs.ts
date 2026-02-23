// src/pages/api/blogs.ts
import type { APIRoute } from "astro";
import { apiClient } from "../../services/apiClient";
import { config } from "config";

// GET: obtener blogs desde la API remota
export const GET: APIRoute = async () => {
  try {
    const response = await apiClient.get(config.endpoints.blogs);

    return new Response(JSON.stringify(response.data), {
      status: response.status || 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error en el API Route GET blogs:", error);
    return new Response(
      JSON.stringify({
        error: "Error al obtener los blogs",
        message: error.message,
        data: error.response?.data
      }),
      {
        status: error.response?.status || 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};

// POST: crear blog con autenticación
export const POST: APIRoute = async ({ request }) => {
  try {
    // Nota: El apiClient inyectará automáticamente el token desde localStorage
    // en el interceptor de peticiones si está presente.

    // Si la petición original tiene FormData, Axios lo manejará correctamente.
    const formData = await request.formData();

    const response = await apiClient.post(config.endpoints.blogs.create, formData);

    return new Response(JSON.stringify(response.data), {
      status: response.status || 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error en el API Route POST blogs:", error);
    return new Response(
      JSON.stringify({
        error: "Error al crear el blog",
        message: error.message,
        data: error.response?.data
      }),
      {
        status: error.response?.status || 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};
