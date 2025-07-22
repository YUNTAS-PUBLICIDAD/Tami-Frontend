import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ redirect, params }) => {
    const slug = params.slug?.toString();

    if (!slug) {
        return redirect("/buscar", 302);
    }

    const query = Array.isArray(slug) ? slug.join(" ") : slug;
    return redirect(`/buscar?q=${encodeURIComponent(query)}`, 302);
};

