// src/pages/api/blogs.ts
import type { APIRoute } from "astro";
import { config } from "config";

const ApiUrl = config.apiUrl;

// GET: obtener blogs desde la API remota
export const GET: APIRoute = async () => {
  try {
    const response = await fetch(`${ApiUrl}/api/v1/blogs`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      const text = await response.text();
      console.error("Error en la respuesta GET:", text);
      return new Response(
          JSON.stringify({ error: "Respuesta no es JSON", detalle: text }),
          { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error en el fetch GET:", error);
    return new Response(
        JSON.stringify({ error: "Error en el GET", detalle: error }),
        { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

// POST: crear blog con autenticación
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

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      const text = await response.text();
      console.error("Error en la respuesta POST:", text);
      return new Response(
          JSON.stringify({ error: "Respuesta no es JSON", detalle: text }),
          { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error en el fetch POST:", error);
    return new Response(
        JSON.stringify({ error: "Hubo un error con la conexión", detalle: error }),
        { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};