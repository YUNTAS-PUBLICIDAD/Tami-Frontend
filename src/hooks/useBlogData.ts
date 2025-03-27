import { useState, useEffect } from "react";
import { config, getApiUrl } from "config";
import type Blog from "src/models/Blog";

export function useBlog(idPost: string) {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBlog() {
      try {
        const res = await fetch(getApiUrl(config.endpoints.blogs.detail(idPost)));
        if (!res.ok) throw new Error("Error al obtener el contenido del blog");

        const { data }: { data: Blog } = await res.json();
        setBlog(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      }
    }

    fetchBlog();
  }, [idPost]);

  return { blog, error };
}
