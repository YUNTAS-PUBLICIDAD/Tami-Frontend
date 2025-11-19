// src/components/ReactProductoPage.tsx
import { useState, useRef } from "react"; 
import Hero from "./index/Hero.tsx";
import FetchListadoProductos from "./products/FetchListadoProductos.tsx";

export default function ReactProductoPage() {
  const [filtroCategoria, setFiltroCategoria] = useState<string | null>(null);
  
  const listaProductosRef = useRef<HTMLDivElement>(null);

  const handleFiltroClick = (categoria: string | null) => {
    
    setFiltroCategoria(categoria);
    
   
    listaProductosRef.current?.scrollIntoView({ 
      behavior: "smooth", 
      block: "start"      
    });
  };

  return (
    <>
      <Hero 
        filtroCategoria={filtroCategoria} 
        setFiltroCategoria={handleFiltroClick} 
      />
      
      <FetchListadoProductos 
        ref={listaProductosRef} 
        filtroCategoriaPadre={filtroCategoria} 
        setFiltroCategoriaPadre={setFiltroCategoria}
      />
    </>
  );
}