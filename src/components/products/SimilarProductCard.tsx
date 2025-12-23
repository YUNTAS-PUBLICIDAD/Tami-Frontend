// src/components/products/SimilarProductCard.tsx

import React from 'react';
import type Producto from '../../models/Product';
import { config } from 'config';

interface Props {
  product: Producto;
}

const SimilarProductCard: React.FC<Props> = ({ product }) => {
  const imgUrl = product.imagenes?.[0]?.url_imagen;
  const cacheBuster = `?t=${Date.now()}`;
  const finalImageSrc = imgUrl 
    ? `${config.apiUrl}${imgUrl}${cacheBuster}` 
    : '/placeholder.png'; 

  return (
    <a
      href={`/productos/${product.link}`}
      className="
        group relative block w-full 
        rounded-xl shadow-lg overflow-hidden 
        transition-all duration-300
        focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-75
        hover:shadow-xl hover:-translate-y-1
      "
      title={`Ver detalles de ${product.titulo}`}
    >
      
      <div className="relative w-full aspect-square bg-white">
        <img
          src={finalImageSrc}
          alt={product.nombre}
          title={product.nombre}
          className="
            w-full h-full object-contain p-4 
            transition-transform duration-500 ease-out
            group-hover:scale-110
          "
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.png';
          }}
        />
      </div>

      <div
        className="
          absolute bottom-0 left-0 w-full p-4
          flex items-center justify-between gap-4
          bg-gradient-to-t from-white via-cyan to-cyan-400/40
          backdrop-blur-[2px]
        "
      >
        <h3 className="font-bold text-base text-[#0374a2] leading-tight flex-1 line-clamp-2">
          {product.nombre}
        </h3>
        <span
          className="
            flex-shrink-0 bg-gray-100 text-[#003e56] 
            px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wide
            transition-all duration-300 
            group-hover:bg-[#00b6ff] group-hover:text-white group-hover:shadow-md
          "
        >
          Comprar
        </span>
      </div>
    </a>
  );
};

export default SimilarProductCard;