import { useEffect, useState } from "react";
import CardBlog from "./CardBlog";
import type Blog from "src/models/Blog";
import { getApiUrl, config } from "config";

const BlogList = ({ searchTerm }: { searchTerm: string }) => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiUrlBlogs = getApiUrl(config.endpoints.blogs.list);

    const fetchBlogs = async () => {
      try {
        const res = await fetch(apiUrlBlogs);
        if (!res.ok) throw new Error("HTTP error blogs!");

        const data = await res.json();
        if (!data.success || !Array.isArray(data.data)) {
          throw new Error("No se pudieron obtener los blogs");
        }

        setBlogs(data.data);
      } catch (err) {
        setError(
            "Error al obtener blogs: " +
            (err instanceof Error ? err.message : "Error desconocido")
        );
      }
    };

    fetchBlogs();
  }, []);
  const filteredBlogs = blogs.filter((blog) => {
    const search = searchTerm.toLowerCase();
    return (
        blog.titulo.toLowerCase().includes(search) ||
        blog.nombre_producto?.toLowerCase().includes(search)
    );
  });

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