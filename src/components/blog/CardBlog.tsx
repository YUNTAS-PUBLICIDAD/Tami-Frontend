// src/components/blog/CardBlog.tsx

import React from "react";
import type Blog from "src/models/Blog"; 
import { config } from "config";

interface CardBlogProps {
  blog: Blog;
}

const CardBlog: React.FC<CardBlogProps> = React.memo(({ blog }) => {
  const imageUrl = blog.miniatura ? `${config.apiUrl}${blog.miniatura}` : "https://via.placeholder.com/330x530?text=TAMI";
  const altText = blog.titulo || "Imagen del blog";

  const formattedDate = new Date(blog.created_at || Date.now()).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <a 
      href={`/blog/details?id=${blog.id}`} 
      className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row border border-gray-200 hover:shadow-xl transition-shadow duration-300 w-full h-full"
    >
      <div className="w-full md:w-[330px] flex-shrink-0 bg-gray-100 flex items-center justify-center p-4 rounded-l-2xl">
        <img 
          src={imageUrl} 
          alt={altText} 
          title={altText}
          className="w-full h-full object-contain rounded-lg" 
          loading="lazy"
        />
      </div>

      <div className="p-8 flex flex-col flex-grow">
        <span className="inline-block bg-[#07625b] text-white text-sm font-semibold px-4 py-1 rounded-md mb-4 w-fit">
          Producto
        </span>
        <h3 className="font-bold text-2xl text-[#07625b] mb-3">
          {blog.titulo || "Tecnología e Innovación"}
        </h3>
        <p className="text-gray-600 text-base mb-6 flex-grow">
          {blog.subtitulo1 || "Ofrecemos calidad y soluciones avanzadas para tu negocio."}
        </p>
        <p className="text-gray-500 text-sm mt-auto">
          {formattedDate}
        </p>
      </div>
    </a>
  );
});

export default CardBlog;