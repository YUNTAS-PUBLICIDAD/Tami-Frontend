// src/pages/api/buscar.ts
import type { APIRoute } from "astro";
import { config } from "../../../config";
import type Producto from "../../models/Product";
import type Blog from "../../models/Blog";

function normalizar(texto: string): string {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export const GET: APIRoute = async ({ url }) => {
    const rawQuery = url.searchParams.get("q")?.trim() ?? "";
    const query = normalizar(rawQuery);

    let productos: Producto[] = [];
    let blogs: Blog[] = [];

    try {
        // Fetch productos
        const resProductos = await fetch(`${config.apiUrl}${config.endpoints.productos.list}`);
        if (resProductos.ok) {
            const json = await resProductos.json();
            const todos = json.data ?? [];

            productos = todos.filter((producto: Producto) =>
                [producto.nombre, producto.titulo, producto.subtitulo, producto.descripcion]
                    .some(campo => campo && normalizar(campo).includes(query))
            );
        }

        // Fetch blogs
        const resBlogs = await fetch(`${config.apiUrl}${config.endpoints.blogs.list}`);
        if (resBlogs.ok) {
            const json = await resBlogs.json();
            const todos = json.data ?? [];

            blogs = todos.filter((blog: Blog) =>
                [blog.titulo, blog.subtitulo1, blog.nombre_producto, blog.subtitulo2]
                    .some(campo => campo && normalizar(campo).includes(query))
            );
        }

        return new Response(JSON.stringify({ productos, blogs }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: "Error interno" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
};
