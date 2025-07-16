import { useEffect, useState } from "react";
import CardBlog from "./CardBlog";
import type Blog from "src/models/Blog";
import { getApiUrl, config } from "config";

interface BlogWithProduct extends Blog {
  producto_titulo?: string;
}

const BlogList = ({ searchTerm }: { searchTerm: string }) => {
  const [blogs, setBlogs] = useState<BlogWithProduct[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiUrlBlogs = getApiUrl(config.endpoints.blogs.list);
    const apiUrlProductos = `${config.apiUrl}${config.endpoints.productos.list}`;

    const fetchBlogsAndAllProducts = async () => {
      try {
        //Fetch blogs
        const blogsRes = await fetch(apiUrlBlogs);
        if (!blogsRes.ok) throw new Error(`HTTP error blogs!`);
        const blogsData = await blogsRes.json();

        if (!blogsData.success && !Array.isArray(blogsData.data)) {
          throw new Error("No se pudieron obtener los blogs");
        }
        const blogsFetched: Blog[] = blogsData.data;

        //Fetch all products (paginated)
        const productosRes = await fetch(`${apiUrlProductos}?per_page=100`); // Ajusta per_page si backend lo soporta
        if (!productosRes.ok) throw new Error(`HTTP error productos!`);
        const productosData = await productosRes.json();
        
        if (!Array.isArray(productosData.data)) {
          throw new Error("No se pudieron obtener los productos");
        }

        const productosMap: Record<number, string> = {};
        for (const p of productosData.data) {
          productosMap[Number(p.id)] = p.titulo || p.nombre || "Sin título";
        }

        //Combinar cada blog con el nombre del producto
        const blogsWithProducts: BlogWithProduct[] = blogsFetched.map((blog) => ({
          ...blog,
          producto_titulo: blog.producto_id
              ? productosMap[Number(blog.producto_id)] || "Producto no disponible"
              : "Producto no disponible",
        }));

        setBlogs(blogsWithProducts);
      } catch (err) {
        setError(
            "Error al obtener blogs/productos: " +
            (err instanceof Error ? err.message : "Error desconocido")
        );
      }
    };

    fetchBlogsAndAllProducts();
  }, []);

  const filteredBlogs = blogs.filter((blog) =>
      blog.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
      <>
        {error ? (
            <p className="text-center text-red-600">{error}</p>
        ) : filteredBlogs.length > 0 ? (
            filteredBlogs.map((blog) => <CardBlog key={blog.id} blog={blog} />)
        ) : (
            <p className="text-center text-teal-800">No se encontraron resultados.</p>
        )}
      </>
  );
};

export default BlogList;