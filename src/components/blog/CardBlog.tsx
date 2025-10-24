// src/components/blog/CardBlog.tsx

import React from "react";
import type Blog from "src/models/Blog";
import { config } from "config";

interface CardBlogProps {
  blog: Blog;
}

const CardBlog: React.FC<CardBlogProps> = React.memo(({ blog }) => {
  const miniatura = blog.miniatura ? `${apiUrl}${blog.miniatura}` : "/images/default-blog.webp";
  const altImg = blog.titulo || "Imagen del blog";
  return (
    <a
      href={`/blog/details?id=${blog.id}`}
      title="Ver detalles del blog"
      className="my-5 flex flex-col lg:flex-row items-center transition-transform duration-300 ease-in-out hover:scale-105 bg-teal-800 text-white shadow-md overflow-hidden rounded-xl"
    >
      <figure className="lg:w-1/3 w-full h-48 flex items-center justify-center bg-white rounded-l-xl overflow-hidden">
        <img
          src={miniatura}
          alt={altImg}
          title={altImg}
          loading="lazy"
          className="w-full h-full object-cover transition-all duration-300"
        />
      </figure>
      <div className="lg:w-2/3 w-full p-6">
        {blog.nombre_producto ? (
          <div className="flex items-center mb-2">
            <span className="border border-white rounded px-2 py-1 mr-2 ml-3">
              {blog.nombre_producto}
            </span>
          </div>
        </div>
      </div>
    </a>
  );
});
  

export default CardBlog;
