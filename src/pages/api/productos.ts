import { config } from "../../../config";

export async function GET(context: any) {
  try {
    const res = await fetch(`${config.apiUrl}${config.endpoints.productos.list}`);
    if (!res.ok) {
      return new Response(JSON.stringify({ data: [], error: true }), { status: 500 });
    }
    const json = await res.json();
    // Si la respuesta es un array, úsala directamente; si es un objeto con data, úsala; si no, array vacío
    let data = [];
    if (Array.isArray(json)) {
      data = json;
    } else if (Array.isArray(json.data)) {
      data = json.data;
    }
    return new Response(JSON.stringify({ data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ data: [], error: true }), { status: 500 });
  }
}
