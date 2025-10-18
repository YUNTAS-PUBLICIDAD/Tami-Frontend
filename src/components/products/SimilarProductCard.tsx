// src/components/products/SimilarProductCard.tsx

import React from 'react';
import type Producto from '../../models/Product';
import { config } from 'config';

interface Props {
  product: Producto;
}

const SimilarProductCard: React.FC<Props> = ({ product }) => {
  return (
    <a
      href={`/productos/${product.link}`}
      className="
        group cursor-pointer flex flex-col h-full 
        bg-white backdrop-blur-sm rounded-xl 
        border border-white/20 shadow-lg 
        transition-all duration-300 hover:bg-white/20
      "
      title={`Ver detalles de ${product.titulo}`}
    >
      {/* Contenedor de la imagen con el difuminado */}
      <div className="relative w-full h-60 bg-white/5 flex items-center justify-center overflow-hidden rounded-t-xl">
        <img
          src={`${config.apiUrl}${product.imagenes?.[0]?.url_imagen ?? '/placeholder.png'}`}
          alt={product.nombre}
          title={product.nombre}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 p-4"
          loading="lazy"
        />
        {/* Capa de difuminado blanco */}
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-[#015e81] to-transparent pointer-events-none"></div>
      </div>
      
      {/* Contenedor de texto y botón */}
      <div className="p-4 flex items-center justify-between mt-auto">
        <h3 className="font-bold text-base text-[#2f91b9] leading-tight w-2/3">
          {product.nombre}
        </h3>
        <button className="bg-gray-200 text-gray-900 px-5 py-2 rounded-lg font-bold text-sm hover:bg-gray-300 transition-colors">
          Comprar
        </button>
      </div>
    </a>
  );
};

export default SimilarProductCard;