// src/components/products/SimilarProductCard.tsx

import React from 'react';
import type Producto from '../../models/Product';
import { config } from 'config';

interface Props {
  product: Producto;
}

const SimilarProductCard: React.FC<Props> = ({ product }) => {
  const imgUrl = product.imagenes.filter(img => img.tipo === 'galeria')[0]?.url_imagen;
  const cacheBuster = `?t=${Date.now()}`;
  const finalImageSrc = imgUrl
    ? `${config.apiUrl}${imgUrl}${cacheBuster}`
    : '/placeholder.png';

  return (
    <a
      href={`/productos/${product.link}`}
      className="
        group relative block w-full 
        rounded-xl shadow-lg border border-gray-100 overflow-hidden 
        transition-all duration-500 ease-out
        focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-75
        hover:shadow-[0_20px_45px_-12px_rgba(0,182,255,0.25)] hover:-translate-y-2 hover:border-cyan-300/50
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
            transition-transform duration-700 ease-out
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
          bg-gradient-to-t from-white via-white/95 to-white/80
          backdrop-blur-[4px] border-t border-gray-100/50
          transition-colors duration-500 group-hover:from-cyan-50 group-hover:via-cyan-50/95
        "
      >
        <h3 className="font-bold text-base text-[#0374a2] leading-tight flex-1 line-clamp-2 transition-colors duration-300 group-hover:text-[#005f86]">
          {product.nombre}
        </h3>
        <span
          className="
            flex-shrink-0 bg-gray-100 text-[#003e56] 
            px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wide
            transition-all duration-300 
            group-hover:bg-[#00b6ff] group-hover:text-white group-hover:shadow-md group-hover:scale-105 active:scale-95
          "
        >
          Comprar
        </span>
      </div>
    </a>
  );
};

export default SimilarProductCard;