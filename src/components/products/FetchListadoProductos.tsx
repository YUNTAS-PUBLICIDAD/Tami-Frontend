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
        <div className="p-4 border rounded-xl shadow-[0_0_10px_rgba(0,0,0,0.25)] shadow-[#00786F] space-y-4">
          <h1 className="uppercase underline text-teal-700 font-bold text-center text-3xl">
            Filtros
          </h1>
          {/* Filtro nombre */}
          <div>
            <h2 className="font-bold text-teal-700 text-lg uppercase">Nombre</h2>
            <input
              type="text"
              value={filtroNombre}
              onChange={(e) => setFiltroNombre(e.target.value)}
              placeholder="Buscar..."
              className="p-2 shadow-md rounded-md w-full outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>
          {/* Categorías */}
          <div>
            <button
              type="button"
              className="w-full flex justify-between items-center text-teal-700 hover:cursor-pointer"
              onClick={() => setMostrarCategorias((prev) => !prev)}
            >
              <h2 className="font-bold text-lg uppercase">Categorías</h2>
              {mostrarCategorias ? <FaChevronDown /> : <FaChevronUp />}
            </button>

            {mostrarCategorias && (
              <div className="flex flex-wrap gap-3 text-white font-semibold pt-3">
                {[
                  { name: "Negocio", color: "#00B6FF" },
                  { name: "Decoración", color: "#5D39FB" },
                  { name: "Maquinaria", color: "#04B088" },
                ].map(({ name, color }) => (
                  <button
                    key={name}
                    onClick={() =>
                      setFiltroCategoria(filtroCategoria === name ? null : name)
                    }
                    style={{
                      backgroundColor: filtroCategoria === name ? "#fff" : color,
                      color: filtroCategoria === name ? color : ''
                    }}
                    className={`py-2 px-5 rounded-xl text-lg uppercase shadow-md hover:opacity-90 transition-all}`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Limpiar filtros */}
          <div className="flex justify-center pt-10">
            <button
              onClick={() => {
                setFiltroNombre("");
                setFiltroCategoria(null);
              }}
              className="py-2 px-4 uppercase bg-white text-teal-700 border-2 border-teal-500 font-bold text-lg rounded-lg shadow-md hover:bg-teal-50 transition"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </aside>

      {/* FILTROS MOBILE */}
      <div className="block w-full m-auto sm:hidden relative">
        <div className="p-4 flex items-center gap-4 border rounded shadow-[0_0_10px_rgba(0,0,0,0.25)] shadow-[#00786F] space-y-4 ">
          <button
            type="button"
            className="flex items-center gap-5 text-teal-700 hover:cursor-pointer mb-0"
            onClick={() => setMostrarCategorias((prev) => !prev)}
          >
            <h1 className="uppercase underline text-teal-700 font-bold text-center text-xs mb-0">Filtros</h1>
            {mostrarCategorias ? <FaChevronDown size={12} /> : <FaChevronUp size={12} />}
          </button>

          {mostrarCategorias && (
            <div className="absolute left-0 top-20 flex flex-col gap-3 font-semibold px-8 py-2 bg-white border rounded-4xl z-10 shadow-[0_0_10px_rgba(0,0,0,0.25)] shadow-[#00786F] ">
              <h2 className="font-bold text-2xl uppercase text-[#00786F] text-center">Categorías</h2>
              {[
                { name: "Negocio", color: "#00B6FF" },
                { name: "Decoración", color: "#5D39FB" },
                { name: "Maquinaria", color: "#04B088" },
              ].map(({ name, color }) => (
                <button
                  key={name}
                  onClick={() =>
                    setFiltroCategoria(filtroCategoria === name ? null : name)
                  }
                  style={{
                    backgroundColor: filtroCategoria === name ? "#fff" : color,
                    color: filtroCategoria === name ? color : ''
                  }}
                  className={`py-2 px-5 text-white rounded text-xl uppercase shadow-md hover:opacity-90 transition-all}`}
                >
                  {name}
                </button>
              ))}
              {/* Limpiar filtros */}
              <div className="flex justify-center py-4">
                <button
                  onClick={() => {
                    setFiltroNombre("");
                    setFiltroCategoria(null);
                  }}
                  className="p-2 uppercase bg-white text-teal-700 border-2 border-teal-500 font-bold text-xs rounded shadow-md hover:bg-teal-50 transition"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          )}

          <input
            type="text"
            value={filtroNombre}
            onChange={(e) => setFiltroNombre(e.target.value)}
            placeholder="Buscar..."
            className="py-1.5 px-6 shadow-lg text-xs rounded-md w-full outline-none focus:ring-2 focus:ring-teal-400"
          />
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

  const gradientColors: Record<string, string> = {
    Negocio: "from-[#00B6FF]/50 to-white text-[#0374A2]",
    Decoración: "from-[#5D39FB]/50 to-white text-[#5D39FB]",
    Maquinaria: "from-[#00786F]/50 to-white text-[#00786F]",
    Default: "from-[#0374A2]/50 to-white text-[#0374A2]",
  };

  const gradient = gradientColors[producto.seccion] || gradientColors.Default;

  return (
    <a
      href={`/productos/${producto.link}`}
      title={`Ver detalles de ${producto.nombre}`}
      className="flex flex-col items-center group hover:cursor-pointer w-full relative h-[150px] md:h-[360px]"
    >
      <div ref={targetRef} className="h-full w-full relative">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-300 animate-pulse flex items-center justify-center rounded-xl" />
        )}
        {hasIntersected && (
          <img
            src={imageSrc}
            alt={producto.nombre}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            className={`rounded-xl object-contain w-full h-[150px] md:h-[360px] transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"
              }`}
            style={{ aspectRatio: "1" }}
          />
        )}
        <div
          className={`absolute bottom-0 w-full flex justify-center bg-gradient-to-b ${gradient} shadow-lg rounded-xl backdrop-blur-xs`}
        >
          <div className="flex justify-between items-center gap-2 w-full p-3 min-h-[40px] md:min-h-[100px]">
            <h3 className="text-xs md:text-base font-bold uppercase">{producto.nombre}</h3>
            <button className="bg-white py-1 px-3 rounded-md font-semibold text-xs sm:text-sm shadow hover:bg-gray-100">
              Comprar
            </button>
          </div>
        </div>
      </div>
    </a>
  );
});
const MemoizedProductCard = ProductCard;