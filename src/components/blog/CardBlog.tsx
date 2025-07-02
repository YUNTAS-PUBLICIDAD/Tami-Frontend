import { MdOutlineArrowForwardIos } from "react-icons/md";
import type Blog from "src/models/Blog";
import React, { useEffect, useState } from "react";
import { config } from "config";

interface CardBlogProps {
  blog: Blog;
}

const CardBlog: React.FC<CardBlogProps> = ({ blog }) => {
  const apiUrl = config.apiUrl;
  const productosUrl = config.endpoints.productos;

  const [productName, setProductName] = useState<string>("");

  useEffect(() => {
    if (blog.producto_id) {
      fetch(`${apiUrl}${productosUrl.list}/${blog.producto_id}`)
          .then((res) => res.json())
          .then((data) => {
            setProductName(data.data?.titulo || "Producto no disponible");
          })
          .catch((err) => {
            console.error("Error fetching product:", err);
            setProductName("Producto no disponible");
          });
    }
  }, [blog.producto_id]);

  return (
      <a
          href={`/blog/details?id=${blog.id}`}
          className="my-5 flex flex-col lg:flex-row items-center transition-transform duration-300 ease-in-out hover:scale-105 bg-teal-800 text-white shadow-md overflow-hidden"
      >
        <figure className="lg:w-1/3 w-full">
          <img
              src={`${apiUrl}${blog.imagenes[0]?.ruta_imagen}`}
              alt={blog.titulo}
              loading="lazy"
              className="w-full h-48 object-cover"
          />
        </figure>
        <div className="lg:w-2/3 w-full p-6">
          <div className="flex items-center mb-2">
          <span className="border border-white rounded px-2 py-1 mr-2 ml-3">
            {productName}
          </span>
          </div>
          <h2 className="text-2xl font-bold mb-2 ml-3">{blog.subtitulo1}</h2>
          <div className="flex flex-row items-center gap-2">
            <MdOutlineArrowForwardIos className="text-5xl" />
            <p className="text-gray-300">{blog.subtitulo2}</p>
          </div>
        </div>
      </a>
  );
};

export default CardBlog;