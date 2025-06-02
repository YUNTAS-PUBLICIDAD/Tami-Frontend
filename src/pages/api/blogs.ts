// src/pages/api/blogs.ts
import type { APIRoute } from "astro";
import { config } from "config";

const ApiUrl = config.apiUrl;

export const POST: APIRoute = async ({ request }) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${ApiUrl}/api/v1/blogs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: request.body,
    });

    // Verificar si la respuesta es JSON
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      const text = await response.text(); // Captura respuesta en texto (puede ser HTML de error)
      console.error("Error en la respuesta de la API:", text);
      return new Response(
        JSON.stringify({ error: "Respuesta no es JSON", detalle: text }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error en el fetch o en la API externa:", error);
    return new Response(
      JSON.stringify({
        error: "Hubo un error con la conexión",
        detalle: error,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
