import { config, getApiUrl } from "config";
import { useEffect, useState, useCallback, useMemo, useRef, type JSX } from "react";
import React from "react";
import type Producto from "src/models/Product";

const CACHE_KEY = 'productos_cache';
const CACHE_DURATION = 5 * 60 * 1000;

interface CacheData {
  data: Producto[];
  timestamp: number;
}

const getCachedData = (): Producto[] | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const { data, timestamp }: CacheData = JSON.parse(cached);
    const now = Date.now();
    
    if (now - timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    
    return data;
  } catch {
    return null;
  }
};

const setCachedData = (data: Producto[]) => {
  try {
    const cacheData: CacheData = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch {
    // Si el localStorage está lleno, lo ignoramos
  }
};

const ApiUrl = config.apiUrl;

interface SeccionProps {
  nombreSeccion: string;
  productosDeLaSeccion: Producto[];
}

interface Props {
  producto: Producto;
}

export default function ListadoDeProductos() {
  const [mostrar, setMostrar] = useState<JSX.Element[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const obtenerDatos = useCallback(async (useCache = true) => {
    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      setLoading(true);
      setError(null);
      setRefreshing(true);

      if (useCache) {
        const cachedData = getCachedData();
        if (cachedData) {
          const seccionesArray = procesarSecciones(cachedData);
          setMostrar(seccionesArray.map((seccion, i) => 
            <MemoizedSeccion key={`${seccion.nombreSeccion}-${i}`} {...seccion} />
          ));
          setLoading(false);
          setRefreshing(false);
          return;
        }
      }

      // Crear nuevo AbortController para esta request
      abortControllerRef.current = new AbortController();

      // Usar el endpoint original que sí funciona
      const response = await fetch(getApiUrl(config.endpoints.productos.list), {
        signal: abortControllerRef.current.signal
      });
      
      if (!response.ok) throw new Error("Error al obtener productos");

      const data = await response.json();
      // Con el endpoint original, los productos están directamente en data
      const productos = data;

      // Mapeamos los datos del backend al modelo `Product`
      const productosMapeados: Producto[] = productos.map((producto: any) => {
        // El backend devuelve las imágenes en producto.imagenes (puede ser array de objetos)
        let imagenes = [];
        if (Array.isArray(producto.imagenes)) {
          imagenes = producto.imagenes.map((img: any) => ({
            url_imagen: img.url_imagen || img.url || '',
            texto_alt_SEO: img.texto_alt_SEO || img.alt || '',
            imageTitle: img.imageTitle || ''
          }));
        }
        return {
          id: producto.id,
          nombre: producto.nombre,
          link: producto.link,
          titulo: producto.titulo,
          subtitulo: producto.subtitulo,
          lema: producto.lema,
          descripcion: producto.descripcion,
          especificaciones: producto.especificaciones || {},
          productos_relacionados: producto.productos_relacionados || [],
          imagenes,
          stock: producto.stock,
          precio: parseFloat(producto.precio),
          seccion: producto.seccion,
          createdAt: producto.created_at
        };
      });

      // Guardar en cache
      setCachedData(productosMapeados);

      // Construir secciones optimizadas
      const seccionesArray = procesarSecciones(productosMapeados);

      // Generar los componentes Seccion y actualizar el estado `mostrar`
      setMostrar(
        seccionesArray.map((seccion, i) => 
          <MemoizedSeccion key={`${seccion.nombreSeccion}-${i}`} {...seccion} />
        )
      );
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // Request fue cancelada, no mostrar error
        return;
      }
      console.error("Error cargando productos:", error);
      setError("Error al cargar los productos. Por favor, intenta nuevamente.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const procesarSecciones = useMemo(() => (productos: Producto[]): SeccionProps[] => {
    const secciones = ["Negocio", "Decoración", "Maquinaria"];
    return secciones.map(nombreSeccion => ({
      nombreSeccion,
      productosDeLaSeccion: productos.filter(p => p.seccion === nombreSeccion)
    }));
  }, []);

  const debouncedRefetch = useCallback(() => {
    if (refreshing) return;
    obtenerDatos(false); 
  }, [obtenerDatos, refreshing]);

  useEffect(() => {
    obtenerDatos();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [obtenerDatos]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <section className="w-full flex flex-col items-center justify-center py-16">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button 
            onClick={debouncedRefetch}
            disabled={refreshing}
            className={`px-6 py-2 rounded-lg transition-colors ${
              refreshing 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-teal-600 hover:bg-teal-700 text-white'
            }`}
          >
            {refreshing ? 'Cargando...' : 'Reintentar'}
          </button>
        </div>
      </section>
    );
  }

  return <section className="w-full grid grid-rows-auto">{mostrar}</section>;
}

// Componente de Loading Skeleton
function LoadingSkeleton() {
  return (
    <section className="w-full grid grid-rows-auto">
      {[1, 2, 3].map((seccion) => (
        <div key={seccion} className="flex justify-center relative py-6 sm:py-8 md:py-10">
          <div className="relative w-[95%] xs:w-[90%] sm:w-4/5 place-self-center">
            {/* Skeleton del título */}
            <div className="bg-gray-300 animate-pulse h-10 w-48 mb-6 rounded"></div>
            
            {/* Grid de productos skeleton */}
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 xs:gap-4 sm:gap-6 md:gap-8 mt-4 sm:mt-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <div key={item} className="my-4 sm:my-6 md:my-10 flex flex-col items-center">
                  {/* Skeleton de imagen */}
                  <div className="bg-gray-300 animate-pulse rounded-[15%] w-4/5 h-4/5 md:h-56 md:w-56 mb-3"></div>
                  {/* Skeleton del título */}
                  <div className="bg-gray-300 animate-pulse h-4 w-3/4 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}


// Componente de sección memoizado para evitar re-renders innecesarios
const Seccion = React.memo(function Seccion({ nombreSeccion, productosDeLaSeccion }: SeccionProps) {
  // Memoizar la lista de productos para evitar recrear ProductCards innecesariamente
  const productCards = useMemo(() => {
    if (productosDeLaSeccion.length === 0) {
      return (
        <p className="text-gray-400 text-lg col-span-full text-center py-8">
          No hay productos en esta sección.
        </p>
      );
    }
    
    return productosDeLaSeccion.map((producto) => (
      <MemoizedProductCard key={producto.id} producto={producto} />
    ));
  }, [productosDeLaSeccion]);

  return (
      <div className="flex justify-center relative py-6 sm:py-8 md:py-10" id={nombreSeccion}>
        <div className="relative w-[95%] xs:w-[90%] sm:w-4/5 place-self-center">
          {/* Título de sección con gradiente - responsivo en todos los tamaños */}
          <h2 className="text-white bg-gradient-to-r from-teal-900 via-teal-700 py-2 sm:py-3
                       w-fit text-xl xs:text-2xl sm:text-3xl font-bold
                       ps-3 xs:ps-4 sm:ps-5 lg:ps-10
                       pe-8 xs:pe-12 sm:pe-16 lg:pe-28">
            {nombreSeccion}
          </h2>

          {/* Grid de productos - de 1 columna en móvil pequeño a 4 columnas en desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-fr mt-4 sm:mt-6">
            {productCards}
          </div>
        </div>
      </div>
  );
});


const MemoizedSeccion = Seccion;

function useIntersectionObserver(options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px',
        ...options
      }
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [hasIntersected, options]);

  return { targetRef, isIntersecting, hasIntersected };
}

const ProductCard = React.memo(function ProductCard({ producto }: Props) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { targetRef, hasIntersected } = useIntersectionObserver();

  const imageSrc = useMemo(() => {
    if (producto.imagenes && producto.imagenes.length > 0 && producto.imagenes[0].url_imagen) {
      const url = producto.imagenes[0].url_imagen;
      if (url.startsWith("http")) return url;
      return `${ApiUrl.replace(/\/$/, "")}${url}`;
    }
    return `https://placehold.co/300x300/e5e7eb/6b7280?text=${encodeURIComponent(producto.nombre)}`;
  }, [producto.imagenes, producto.nombre]);

  const imageProps = useMemo(() => ({
    alt: producto.imagenes[0]?.texto_alt_SEO || producto.nombre,
    title: producto.imagenes[0]?.texto_alt_SEO || producto.imagenes[0]?.imageTitle
  }), [producto.imagenes, producto.nombre]);

  const handleImageLoad = useCallback(() => setImageLoaded(true), []);
  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
  }, []);

  return (
    <a
      href={`/productos/detalle?link=${producto.link}`}
      title={`Ver detalles de ${producto.nombre}`}
      className="my-4 sm:my-6 md:my-10 flex flex-col items-center group hover:cursor-pointer w-full"
    >
      <div 
        ref={targetRef}
        className="bg-gray-300 rounded-[15%] place-self-center w-4/5 h-4/5 md:h-56 md:w-56 md:p-0 mb-3 overflow-hidden shadow-md group-hover:shadow-xl transition-shadow duration-300 relative"
      >
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gray-300 animate-pulse flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        
        {/* Solo cargar la imagen cuando esté cerca del viewport */}
        {hasIntersected && (
          <img
            src={imageSrc}
            alt={imageProps.alt}
            title={imageProps.title}
            loading="lazy"
            onLoad={handleImageLoad}
            onError={handleImageError}
            className={`h-full w-full object-cover transition-all duration-500 ease-out group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              // Prevenir layout shift mientras carga
              aspectRatio: '1',
            }}
          />
        )}
      </div>
      <div className="flex flex-row justify-center items-center text-teal-700 mt-3">
        <svg
          viewBox="0 0 25 25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="group-hover:scale-75 transition-transform duration-300 ease-in-out w-[40px] h-[40px] md:w-[50px] md:h-[50px]"
        >
          <path
        d="M16 4L8 12L16 20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(-2, 0)"
          ></path>
          <path
        d="M16 4L8 12L16 20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(5, 0)"
          ></path>
        </svg>
        <div className="flex-grow text-center group w-full px-2">
          <h3 className="text-base sm:text-lg font-bold text-teal-700 leading-snug break-words whitespace-normal group-hover:scale-105 transition-transform duration-300 ease-in-out">
            {producto.nombre}
          </h3>
        </div>
        <svg
          viewBox="0 0 25 25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="group-hover:scale-75 transition-transform duration-300 ease-in-out w-[40px] h-[40px] md:w-[50px] md:h-[50px]"
        >
          <path
        d="M8 4L16 12L8 20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(2, 0)"
          ></path>
          <path
        d="M8 4L16 12L8 20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(-5, 0)"
          ></path>
        </svg>
      </div>
    </a>
  );
});

// Alias memoizado para usar en el componente Seccion
const MemoizedProductCard = ProductCard;