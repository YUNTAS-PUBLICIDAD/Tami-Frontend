// src/components/products/SimilarProductCard.tsx

import React from 'react';
import type Producto from '../../models/Product';
import { config } from '../../../config';

interface Props {
  product: Producto;
}

const SimilarProductCard: React.FC<Props> = ({ product }) => {
  const [cacheBuster, setCacheBuster] = React.useState("");

  React.useEffect(() => {
    setCacheBuster(`?t=${Date.now()}`);
  }, []);

  const imgUrl = product.imagenes?.filter((img) => img.tipo === "galeria")[0]?.url_imagen;

  let finalImageSrc = "/placeholder.png";

  if (imgUrl) {
    if (imgUrl.startsWith("http")) {
      finalImageSrc = `${imgUrl}${cacheBuster}`;
    } else {
      finalImageSrc = `${config.apiUrl}${imgUrl}${cacheBuster}`;
    }
  }

  return (

    <a
      href={`/catalogo-maquinarias/${product.link}`}
  
      className="
        group relative block w-full 

        hover:scale-105
        overflow-hidden

        rounded-2xl shadow-lg border border-gray-100
        transition-all duration-300 ease-out
        focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-75
        hover:shadow-2xl hover:shadow-cyan-500/20 hover:border-cyan-400/60
      "
      title={`Ver detalles de ${product.titulo}`}
    >

  <div className="relative w-full  aspect-square bg-white min-h-[320px] sm:min-h-[360px]">
  <img
    src={finalImageSrc}
    alt={product.nombre}
    title={product.nombre}
   className="
              w-full h-full object-contain p-4 
              transition-transform duration-500 ease-out
              group-hover:scale-105
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
          transition-all duration-300 group-hover:from-cyan-50 group-hover:via-cyan-50/95 group-hover:via-white/95
        "
      >
        <p className="font-bold text-base text-[#0374a2] leading-tight flex-1 line-clamp-2 transition-colors duration-300 group-hover/card:text-[#005f86]">
          {product.nombre}
        </p>
        <span
          className="
            flex-shrink-0 bg-gray-100 text-[#003e56] 
            px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wide
            transition-all duration-300 
            group-hover/card:bg-[#00b6ff] group-hover/card:text-white group-hover/card:shadow-md group-hover/card:scale-105 active:scale-95
          "
        >
          Comprar
        </span>
      </div>
    </a>
  );
};

export default SimilarProductCard;