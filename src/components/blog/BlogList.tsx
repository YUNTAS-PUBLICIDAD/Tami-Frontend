import { useEffect, useState } from "react";
import CardBlog from "./CardBlog";
import type Blog from "src/models/Blog";
import { getApiUrl, config } from "config";

const BlogList = ({ searchTerm }: { searchTerm: string }) => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiUrl = getApiUrl(config.endpoints.blogs.list);

    const fetchBlogs = async () => {
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        if (data.success) {
          setBlogs(data.data);
        } else {
          setError("No se pudieron obtener los blogs");
        }
      } catch (err) {
        setError(
          "Error al obtener los blogs: " +
          (err instanceof Error ? err.message : "Error desconocido")
        );
      }
    };

    fetchBlogs();
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