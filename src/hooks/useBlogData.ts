import { useState, useEffect } from "react";
import { config } from "config";
import apiClient from "src/services/apiClient";
import type Blog from "src/models/Blog";

export function useBlog(idPost: string) {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBlog() {
      try {
        const res = await apiClient.get(config.endpoints.blogs.detail(idPost));
        setBlog(res.data.data);
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
