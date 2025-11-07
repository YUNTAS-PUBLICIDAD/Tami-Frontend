import { config, getApiUrl } from "config";
import { useEffect, useState, useCallback, useMemo, useRef, type JSX } from "react";
import React from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import type Producto from "src/models/Product";

const CACHE_KEY = "productos_cache";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

interface CacheData {
  data: Producto[];
  timestamp: number;
}

const getCachedData = (): Producto[] | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp }: CacheData = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) {
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
    const cacheData: CacheData = { data, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch {
    // Si localStorage está lleno, lo ignoramos
  }
};

const ApiUrl = config.apiUrl;

export default function ListadoDeProductos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Filtros
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<string | null>(null);
  const [mostrarCategorias, setMostrarCategorias] = useState(true);

  const obtenerDatos = useCallback(async (useCache = true) => {
    try {
      abortControllerRef.current?.abort();
      setLoading(true);
      setError(null);
      setRefreshing(true);

      // Usar caché si está vigente
      if (useCache) {
        const cachedData = getCachedData();
        if (cachedData) {
          setProductos(cachedData);
          setLoading(false);
          setRefreshing(false);
          return;
        }
      }

      abortControllerRef.current = new AbortController();
      const response = await fetch(getApiUrl(config.endpoints.productos.list), {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error("Error al obtener productos");

      const data = await response.json();

      // Mapear productos a tu modelo
      const productosMapeados: Producto[] = data.map((producto: any) => ({
        id: producto.id,
        nombre: producto.nombre,
        link: producto.link,
        titulo: producto.titulo,
        subtitulo: producto.subtitulo,
        lema: producto.lema,
        descripcion: producto.descripcion,
        especificaciones: producto.especificaciones || {},
        productos_relacionados: producto.productos_relacionados || [],
        imagenes: Array.isArray(producto.imagenes)
          ? producto.imagenes.map((img: any) => ({
            url_imagen: img.url_imagen || img.url || "",
            texto_alt_SEO: img.texto_alt_SEO || img.alt || "",
            imageTitle: img.imageTitle || "",
          }))
          : [],
        stock: producto.stock,
        precio: parseFloat(producto.precio),
        seccion: producto.seccion,
        createdAt: producto.created_at,
      }));

      setCachedData(productosMapeados);
      setProductos(productosMapeados);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Error cargando productos:", err);
        setError("Error al cargar los productos. Por favor, intenta nuevamente.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    obtenerDatos();
    return () => abortControllerRef.current?.abort();
  }, [obtenerDatos]);

  const procesarSecciones = useCallback(
    (productos: Producto[]) => {
      const secciones = ["Negocio", "Decoración", "Maquinaria"];
      return secciones.map((nombreSeccion) => ({
        productosDeLaSeccion: productos.filter((p) => p.seccion === nombreSeccion),
      }));
    },
    []
  );

  /* -------------------- FILTROS -------------------- */
  const productosFiltrados = useMemo(() => {
    let filtrados = [...productos];
    if (filtroNombre.trim()) {
      filtrados = filtrados.filter((p) =>
        p.nombre.toLowerCase().includes(filtroNombre.toLowerCase())
      );
    }
    if (filtroCategoria) {
      filtrados = filtrados.filter((p) => p.seccion === filtroCategoria);
    }
    return filtrados;
  }, [productos, filtroNombre, filtroCategoria]);

  const seccionesArray = useMemo(
    () => procesarSecciones(productosFiltrados),
    [productosFiltrados, procesarSecciones]
  );

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <section className="w-full flex flex-col items-center justify-center py-16">
        <p className="text-red-600 text-lg mb-4">{error}</p>
        <button
          onClick={() => obtenerDatos(false)}
          disabled={refreshing}
          className={`px-6 py-2 rounded-lg transition-colors ${refreshing
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-teal-600 hover:bg-teal-700 text-white"
            }`}
        >
          {refreshing ? "Cargando..." : "Reintentar"}
        </button>
      </section>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 p-8">
      {/* FILTROS DESKTOP*/}
      <aside className="md:w-4/12 xl:w-3/12 hidden sm:block">

        <div className="p-4 border rounded-xl shadow-[0_0_10px_rgba(0,0,0,0.25)] shadow-[#00B6FF] space-y-4" style={{ borderColor: '#00B6FF' }}>
          <h1 className="uppercase text-[#009688] font-bold text-center text-3xl mb-2" style={{ textDecoration: 'underline', textUnderlineOffset: '6px' }}>
            FILTROS
          </h1>
          {/* Filtro nombre */}
          <div>
            <h2 className="font-bold text-[#009688] text-lg uppercase mb-1">NOMBRE</h2>

            <input
              type="text"
              value={filtroNombre}
              onChange={(e) => setFiltroNombre(e.target.value)}

              placeholder="Buscar"
              className="p-3 shadow rounded-lg w-full outline-none focus:ring-2 focus:ring-[#009688] text-[#009688] font-semibold bg-white mb-4"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}

            />
          </div>
          {/* Categorías */}
          <div>

            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-[#009688] text-lg uppercase">CATEGORIAS</h2>
              <span className="text-[#009688] text-xl font-bold">&#9660;</span>
            </div>
            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() => setFiltroCategoria(filtroCategoria === 'Negocio' ? null : 'Negocio')}
                className={`py-3 px-0 rounded-xl text-lg font-bold uppercase shadow-md w-full transition-all duration-150 active:scale-95 hover:opacity-90 hover:shadow-lg ${filtroCategoria === 'Negocio' ? 'ring-2 ring-white' : ''}`}
                style={{ background: '#00B6FF', color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
              >
                NEGOCIO
              </button>
              <button
                type="button"
                onClick={() => setFiltroCategoria(filtroCategoria === 'Maquinaria' ? null : 'Maquinaria')}
                className={`py-3 px-0 rounded-xl text-lg font-bold uppercase shadow-md w-full transition-all duration-150 active:scale-95 hover:opacity-90 hover:shadow-lg ${filtroCategoria === 'Maquinaria' ? 'ring-2 ring-white' : ''}`}
                style={{ background: '#04B088', color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
              >
                MAQUINARIA
              </button>
              <button
                type="button"
                onClick={() => setFiltroCategoria(filtroCategoria === 'Decoración' ? null : 'Decoración')}
                className={`py-3 px-0 rounded-xl text-lg font-bold uppercase shadow-md w-full transition-all duration-150 active:scale-95 hover:opacity-90 hover:shadow-lg ${filtroCategoria === 'Decoración' ? 'ring-2 ring-white' : ''}`}
                style={{ background: '#5D39FB', color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
              >
                DECORACIÓN
              </button>
            </div>
          </div>
          {/* Limpiar filtros */}
          <div className="flex justify-center pt-8">

            <button
              onClick={() => {
                setFiltroNombre("");
                setFiltroCategoria(null);
              }}

              className="py-3 px-6 uppercase bg-white text-[#009688] font-bold text-lg rounded-xl shadow-md transition-all duration-150 hover:bg-[#e0f7fa] hover:shadow-lg active:scale-95 border border-[#009688]"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
            >
              LIMPIAR FILTROS

            </button>
          </div>
        </div>
      </aside>

      {/* FILTROS MOBILE */}
      <div className="block w-full m-auto sm:hidden relative">

        <div className="p-4 flex flex-col gap-4 border rounded shadow-[0_0_10px_rgba(0,0,0,0.25)] shadow-[#00786F] bg-white">

          <input
            type="text"
            value={filtroNombre}
            onChange={(e) => setFiltroNombre(e.target.value)}

            placeholder="Buscar"
            className="p-3 shadow rounded-lg w-full outline-none focus:ring-2 focus:ring-[#009688] text-[#009688] font-semibold bg-white mb-2"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
          />
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              className="flex-1 py-2 rounded-lg font-bold uppercase text-[#009688] bg-white shadow hover:bg-[#e0f7fa] border border-[#009688]"
              onClick={() => setMostrarCategorias((prev) => !prev)}
            >
              CATEGORIAS
            </button>
            <button
              type="button"
              className="flex-1 py-2 rounded-lg font-bold uppercase text-[#009688] bg-white shadow hover:bg-[#e0f7fa] border border-[#009688]"
              onClick={() => {
                setFiltroNombre("");
                setFiltroCategoria(null);
              }}
            >
              LIMPIAR FILTRO
            </button>
          </div>
          {mostrarCategorias && (
            <div className="flex flex-col gap-3 mt-2">
              <button
                type="button"
                onClick={() => setFiltroCategoria(filtroCategoria === 'Decoración' ? null : 'Decoración')}
                className={`py-3 rounded-xl text-base font-bold uppercase shadow-md w-full transition-all duration-150 active:scale-95 hover:opacity-90 hover:shadow-lg ${filtroCategoria === 'Decoración' ? 'ring-2 ring-white' : ''}`}
                style={{ background: '#5D39FB', color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
              >
                DECORACIÓN
              </button>
              <button
                type="button"
                onClick={() => setFiltroCategoria(filtroCategoria === 'Maquinaria' ? null : 'Maquinaria')}
                className={`py-3 rounded-xl text-base font-bold uppercase shadow-md w-full transition-all duration-150 active:scale-95 hover:opacity-90 hover:shadow-lg ${filtroCategoria === 'Maquinaria' ? 'ring-2 ring-white' : ''}`}
                style={{ background: '#04B088', color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
              >
                MAQUINARIA
              </button>
              <button
                type="button"
                onClick={() => setFiltroCategoria(filtroCategoria === 'Negocio' ? null : 'Negocio')}
                className={`py-3 rounded-xl text-base font-bold uppercase shadow-md w-full transition-all duration-150 active:scale-95 hover:opacity-90 hover:shadow-lg ${filtroCategoria === 'Negocio' ? 'ring-2 ring-white' : ''}`}
                style={{ background: '#00B6FF', color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
              >
                NEGOCIO
              </button>
            </div>
          )}

        </div>
      </div>

      {/* PRODUCTOS */}
      <section className="w-full xl:w-9/12 grid grid-rows-auto space-y-6 md:space-y-10 p-4
      rounded-md shadow-[0_0_7px_rgba(0,0,0,0.25)] shadow-[#00786F] sm:shadow-none sm:rounded-none m-auto">
        {seccionesArray.map(
          (seccion, i) =>
            seccion.productosDeLaSeccion.length > 0 && (
              <MemoizedSeccion key={`${i}`} {...seccion} />
            )
        )}
      </section>
    </div>
  );
}

/* -------------------- SKELETON -------------------- */
function LoadingSkeleton() {
  return (
    <section className="flex justify-between gap-6 p-10">
      <div className="bg-gray-300 animate-pulse h-56 w-3/12 rounded"></div>
      <div className="w-9/12 grid grid-rows-auto">
        {[1, 2, 3].map((seccion) => (
          <div key={seccion} className="flex justify-center relative">
            <div className="relative w-full place-self-center">
              {/* Grid de productos skeleton */}
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-2 xs:gap-3 sm:gap-6 md:gap-8">
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
      </div>
    </section>
  );
}


/* -------------------- SECCIÓN -------------------- */
const Seccion = React.memo(function Seccion({
  productosDeLaSeccion,
}: {
  productosDeLaSeccion: Producto[];
}) {
  const productCards = useMemo(() => {
    return productosDeLaSeccion.map((producto) => (
      <MemoizedProductCard key={producto.id} producto={producto} />
    ));
  }, [productosDeLaSeccion]);
  
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-6 ">
      {productCards}
    </div>
  );
});
const MemoizedSeccion = Seccion;

/* -------------------- PRODUCT CARD -------------------- */
function useIntersectionObserver(options = {}) {
  const [hasIntersected, setHasIntersected] = useState(false);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setHasIntersected(true);
      },
      { threshold: 0.1, rootMargin: "100px", ...options }
    );
    observer.observe(target);
    return () => observer.unobserve(target);
  }, [options]);

  return { targetRef, hasIntersected };
}


const getCategoriaColor = (categoria: string) => {
  switch (categoria) {
    case 'Negocio': return '#00B6FF';
    case 'Decoración': return '#5D39FB';
    case 'Maquinaria': return '#04B088';
    default: return '#0374A2';
  }
};

const CARD_RADIUS = 16;


const ProductCard = React.memo(function ProductCard({ producto }: { producto: Producto }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { targetRef, hasIntersected } = useIntersectionObserver();

  const imageSrc = useMemo(() => {
    const img = producto.imagenes?.[0]?.url_imagen;
    return img
      ? img.startsWith("http")
        ? img
        : `${ApiUrl.replace(/\/$/, "")}${img}`
      : `https://placehold.co/300x300/e5e7eb/6b7280?text=${encodeURIComponent(producto.nombre)}`;
  }, [producto.imagenes, producto.nombre]);


  const categoriaColor = getCategoriaColor(producto.seccion);


  return (
    <a
      href={`/productos/${producto.link}`}
      title={`Ver detalles de ${producto.nombre}`}

      className="w-full"
    >
      <div
        className="flex flex-row md:flex-col w-full max-w-[380px] min-h-[140px] md:min-h-[340px] bg-white rounded-xl shadow-md border relative overflow-hidden"
        style={{ borderColor: categoriaColor, boxShadow: '0 4px 16px rgba(0,0,0,0.10)', borderRadius: CARD_RADIUS }}
      >
        {/* MOBILE: layout horizontal exacto */}
        <div
          className="flex w-full md:hidden min-h-[190px]"
          style={{ height: "100%" }}
        >
          {/* Imagen a la izquierda */}
          <div
            ref={targetRef}
            className="flex items-center justify-center p-2 w-1/2 h-full"
            style={{ height: "100%" }}
          >
            {!imageLoaded && (
              <div className="bg-gray-300 animate-pulse w-full h-full rounded-l-xl" />
            )}
            {hasIntersected && (
              <img
                src={imageSrc}
                alt={producto.nombre}
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
                className="object-contain w-full h-full rounded-l-xl"
                style={{ background: "#f8f8f8" }}
              />
            )}
          </div>

          {/* Bloque azul a la derecha */}
          <div
            className="flex flex-col justify-between w-1/2 h-full relative"
            style={{
              background: categoriaColor,
              borderRadius: "0 12px 12px 0",
              height: "auto",
              minHeight: "100%",
              alignSelf: "stretch",
              position: "relative"
            }}
          >
            <div className="flex-1 flex items-center justify-center px-2">
              <h3 className="text-base font-bold uppercase text-white text-start break-words">
                {producto.nombre}
              </h3>
            </div>
            <button
              className="bg-white font-bold text-lg text-[#0374A2] px-5 py-2 shadow border-none"
              style={{
                minWidth: "90px",
                minHeight: "40px",
                borderRadius: "16px 0 16px 0",
                position: "absolute",
                right: 0,
                bottom: 0,
                margin: 0,
                padding: 0,
              }}
            >
              Comprar
            </button>
          </div>
        </div>
        {/* DESKTOP: layout vertical */}
        <div className="hidden w-full h-full md:flex md:flex-col">
          <div ref={targetRef} className="w-full h-[250px] flex items-center justify-center pt-2 pb-2">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-300 animate-pulse flex items-center justify-center rounded-xl" />
            )}
            {hasIntersected && (
              <img
                src={imageSrc}
                alt={producto.nombre}
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
                className={`object-contain w-[95%] h-[95%] transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                style={{ background: "#f8f8f8", borderRadius: '12px' }}
              />
            )}
          </div>
          <div className="w-full absolute left-0 bottom-0 overflow-hidden" style={{ background: categoriaColor, borderRadius: `0 0 ${CARD_RADIUS}px ${CARD_RADIUS}px`, height: '80px', minHeight: '80px', position: 'absolute', left: 0, bottom: 0, width: '100%', display: 'flex', alignItems: 'center', margin: 0, padding: 0 }}>
            <div className="flex flex-row w-full h-full items-center" style={{ height: '100%' }}>
              <div className="flex items-center pl-4" style={{ maxWidth: '65%', flex: '0 0 65%', height: '100%' }}>
                <h3 className="text-base font-bold uppercase text-white break-words whitespace-normal">
                  {producto.nombre}
                </h3>
              </div>
            </div>
            <button
              className="bg-white font-bold text-lg text-[#0374A2] px-5 py-2 shadow border-none"
              style={{
                minWidth: '120px',
                minHeight: '48px',
                borderRadius: '16px 0 16px 0',
                position: 'absolute',
                right: 0,
                bottom: 0,
                margin: 0,
                padding: 0,
              }}
            >

              Comprar
            </button>
          </div>
        </div>
      </div>
    </a>
  );
});
const MemoizedProductCard = ProductCard;