// src/components/blog/CardBlog.tsx

import React from "react";
import type Blog from "src/models/Blog";
import { config } from "config";

interface CardBlogProps {
  blog: Blog;
}

const CardBlog: React.FC<CardBlogProps> = React.memo(({ blog }) => {

  const imageUrl = blog.miniatura
    ? `${config.apiUrl}${blog.miniatura}`
    : "/images/default-blog.webp";
  
  const altText = blog.titulo || "Imagen del blog";

  return (
    <a
      href={`/blog/details?id=${blog.id}`}
      title="Ver detalles del blog"
      className="mb-6 block"
    >
      <div className="bg-white border border-gray-300 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 w-full p-4 md:p-6 flex items-center justify-center">
            <figure className="w-full h-48 md:h-56 bg-gray-300 rounded-lg overflow-hidden">
              <img
                src={imageUrl} 
                alt={altText} 
                title={altText} 
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </figure>
          </div>
          <div className="md:w-2/3 w-full p-6 md:p-8 flex flex-col justify-center">
            {blog.nombre_producto && (
              <div className="mb-4">
                <span className="inline-block bg-teal-700 text-white text-sm font-medium px-4 py-1.5 rounded-md">
                  {blog.nombre_producto}
                </span>
              </div>
            )}
            <h2 className="text-teal-700 text-xl md:text-2xl font-bold mb-3 leading-tight">
              {blog.subtitulo1}
            </h2>
            <p className="text-gray-700 text-base leading-relaxed mb-4">
              {blog.subtitulo2}
            </p>
            {blog.created_at && (
              <p className="text-gray-500 text-sm">
                {new Date(blog.created_at).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
        </div>
      </div>
    </a>
  );
});

export default CardBlog;