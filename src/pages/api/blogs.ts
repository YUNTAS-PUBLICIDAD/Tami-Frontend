// src/pages/api/blogs.ts
import type { APIRoute } from "astro";
import { config, getApiUrl } from "../../../config";

const buildBlogHeaders = () => {
  const apiKey =
    process.env.BLOGS_API_KEY ||
    process.env.BLOGS_API_TOKEN ||
    process.env.BLOGS_API_SECRET;

  if (!apiKey) {
    return undefined;
  }

  return {
    Authorization: `Bearer ${apiKey}`,
  };
};

const emptyBlogsResponse = () =>
  new Response(JSON.stringify([]), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

// GET: obtener blogs desde la API remota
export const GET: APIRoute = async () => {
  try {
    const response = await fetch(getApiUrl(config.endpoints.blogs.list), {
      headers: buildBlogHeaders(),
    });

    if (response.status === 401 || response.status === 403) {
      console.warn(
        `⚠️ API de blogs devolvió ${response.status} - Devolviendo array vacío para evitar romper el despliegue`
      );
      return emptyBlogsResponse();
    }

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: "Error al obtener los blogs",
          status: response.status,
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status || 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error en el API Route GET blogs:", error);

    return emptyBlogsResponse();
  }
};

// POST: crear blog con autenticación
export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();

    const response = await fetch(getApiUrl(config.endpoints.blogs.create), {
      method: "POST",
      headers: buildBlogHeaders(),
      body: formData,
    });

    const payload = await response.json();

    return new Response(JSON.stringify(payload), {
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
