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
  const [openCategorias, setOpenCategorias] = useState(false);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Filtros
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<string | null>(null);
  const [mostrarCategorias, setMostrarCategorias] = useState(true);
  const [orden, setOrden] = useState<"asc" | "desc" | "">("");

  useEffect(() => {
    console.log("productos:", productos.length);
    console.log(
      "secciones únicas:",
      [...new Set(productos.map((p) => String(p.seccion)))]
    );
  }, [productos]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const categoriaUrl = params.get("categoria");

    if (categoriaUrl) {
      setFiltroCategoria(categoriaUrl);
    }
  }, []);

  // Actualizar la URL dinámicamente cuando el usuario cambia el filtro
  useEffect(() => {
    const url = new URL(window.location.href);
    if (filtroCategoria) {
      url.searchParams.set("categoria", filtroCategoria);
    } else {
      url.searchParams.delete("categoria");
    }
    // pushState cambia la URL sin recargar la página web
    window.history.pushState({}, "", url.toString());
  }, [filtroCategoria]);

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
        seccion: normalize(producto.seccion),
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
      const secciones = ["Maquinaria", "Negocio", "Decoracion", "Purificacion"];

      return secciones.map((nombreSeccion) => ({
        nombre: nombreSeccion, // Mantenemos el nombre para renderizar el H2 correcto
        productosDeLaSeccion: productos.filter(
          (p) => normalize(p.seccion) === normalize(nombreSeccion)
        ),
      }));
    },
    []
  );

  /* -------------------- FILTROS Y ORDENAMIENTO -------------------- */
  const normalize = (text: string) =>
    text
      ?.toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .trim();

  const productosFiltrados = useMemo(() => {
    let filtrados = [...productos];

    console.log("filtroCategoria:", filtroCategoria);

    // Filtro por nombre
    if (filtroNombre.trim()) {
      filtrados = filtrados.filter((p) =>
        p.nombre.toLowerCase().includes(filtroNombre.toLowerCase())
      );
    }

    // Filtro por categoría
    if (filtroCategoria) {
      filtrados = filtrados.filter(
        (p) => normalize(p.seccion) === normalize(filtroCategoria)
      );
      console.log(
        "productos filtrados:",
        filtrados.map((p) => ({
          nombre: p.nombre,
          seccion: p.seccion
        }))
      );
    }

    // Ordenamiento
    if (orden === "asc") {
      filtrados = [...filtrados].sort((a, b) =>
        a.nombre.localeCompare(b.nombre)
      );
    } else if (orden === "desc") {
      filtrados = [...filtrados].sort((a, b) =>
        b.nombre.localeCompare(a.nombre)
      );
    }

    return filtrados;
  }, [productos, filtroNombre, filtroCategoria, orden]);

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
    <div className="flex flex-col gap-4 p-8 w-full max-w-[1440px] mx-auto">
      
      {/* CORRECCIÓN SEO: Inclusión obligatoria del H1 del Catálogo */}
      <h1 className="text-3xl md:text-5xl font-extrabold text-[#015f86] uppercase mb-4 tracking-wide text-center md:text-left border-b pb-4 border-gray-200">
        Catálogo de Maquinarias Industriales y Comerciales
      </h1>

      <div className="flex flex-col md:flex-row gap-8 w-full">
        {/* FILTROS DESKTOP - CORRECCIÓN SEO: Eliminados H2 y H3 de la barra lateral */}
        <aside className="md:w-4/12 xl:w-3/12 hidden sm:block">
          <div className="p-4 border rounded-xl shadow-[0_0_10px_rgba(0,0,0,0.25)] shadow-[#00B6FF] space-y-4" style={{ borderColor: '#00B6FF' }}>
            <p className="uppercase text-[#009688] font-bold text-center text-3xl mb-2" style={{ textDecoration: 'underline', textUnderlineOffset: '6px' }}>
              FILTROS
            </p>
            {/* Filtro nombre */}
            <div>
              <p className="font-bold text-[#009688] text-lg uppercase mb-1">NOMBRE</p>
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
                <p className="font-bold text-[#009688] text-lg uppercase">CATEGORIAS</p>
                <span className="text-[#009688] text-xl font-bold">&#9660;</span>
              </div>
              <div className="flex flex-col gap-4">
                <button
                  type="button"
                  onClick={() => setFiltroCategoria(filtroCategoria === 'Negocio' ? null : 'Negocio')}
                  className={`py-3 px-0 rounded-xl text-lg font-bold uppercase shadow-md w-full transition-all duration-300 active:scale-95 hover:brightness-110 hover:shadow-lg hover:-translate-y-0.5 ${filtroCategoria === 'Negocio' ? 'ring-2 ring-white scale-[1.02]' : ''}`}
                  style={{ background: '#00B6FF', color: '#fff', boxShadow: '0 4px 12px rgba(0,182,255,0.2)' }}
                >
                  NEGOCIO
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroCategoria(filtroCategoria === 'Maquinaria' ? null : 'Maquinaria')}
                  className={`py-3 px-0 rounded-xl text-lg font-bold uppercase shadow-md w-full transition-all duration-300 active:scale-95 hover:brightness-110 hover:shadow-lg hover:-translate-y-0.5 ${filtroCategoria === 'Maquinaria' ? 'ring-2 ring-white scale-[1.02]' : ''}`}
                  style={{ background: '#04B088', color: '#fff', boxShadow: '0 4px 12px rgba(4,176,136,0.2)' }}
                >
                  MAQUINARIA
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroCategoria(filtroCategoria === 'decoracion' ? null : 'decoracion')}
                  className={`py-3 px-0 rounded-xl text-lg font-bold uppercase shadow-md w-full transition-all duration-300 active:scale-95 hover:brightness-110 hover:shadow-lg hover:-translate-y-0.5 ${filtroCategoria === 'decoracion' ? 'ring-2 ring-white scale-[1.02]' : ''}`}
                  style={{ background: '#5D39FB', color: '#fff', boxShadow: '0 4px 12px rgba(93,57,251,0.2)' }}
                >
                  decoracion
                </button>
              </div>
            </div>
            {/* Limpiar filtros */}
            <div className="flex justify-center pt-8">
              <button
                onClick={() => {
                  setFiltroNombre("");
                  setFiltroCategoria(null);
                  setOrden("");
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
                onClick={() => setOpenCategorias(prev => !prev)}
                aria-label="Mostrar u ocultar categorías"
                className="flex-1 py-2 rounded-lg font-bold uppercase text-[#009688] bg-white shadow hover:bg-[#e0f7fa] border border-[#009688]"
              >
                CATEGORÍAS {openCategorias ? "✕" : "☰"}
              </button>
              <button
                type="button"
                className="flex-1 py-2 rounded-lg font-bold uppercase text-[#009688] bg-white shadow hover:bg-[#e0f7fa] border border-[#009688]"
                onClick={() => {
                  setFiltroNombre("");
                  setFiltroCategoria(null);
                  setOrden("");
                }}
              >
                LIMPIAR
              </button>
            </div>
            {openCategorias && (
              <div className="flex flex-col gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setFiltroCategoria(filtroCategoria === 'decoracion' ? null : 'decoracion')}
                  className={`py-3 rounded-xl text-base font-bold uppercase shadow-md w-full transition-all duration-150 active:scale-95 hover:opacity-90 hover:shadow-lg ${filtroCategoria === 'decoracion' ? 'ring-2 ring-white' : ''}`}
                  style={{ background: '#5D39FB', color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
                >
                  decoracion
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

        {/* SECCIÓN PRINCIPAL DE PRODUCTOS */}
        <section className="w-full xl:w-9/12 flex flex-col gap-6 p-4 rounded-md shadow-[0_0_7px_rgba(0,0,0,0.25)] shadow-[#00786F] sm:shadow-none sm:rounded-none m-auto bg-gray-50/50 sm:bg-transparent">
          <div className="flex flex-col sm:flex-row justify-end items-center pb-4">
            {/* Dropdown de Ordenamiento */}
            <div className="relative group">
              <div className="flex flex-col min-[400px]:flex-row items-center gap-2">
                <label htmlFor="ordenar" className="text-gray-600 font-medium text-sm whitespace-nowrap">
                  Ordenar por:
                </label>
                <div className="relative">
                  <select
                    id="ordenar"
                    value={orden}
                    onChange={(e) => setOrden(e.target.value as "asc" | "desc" | "")}
                    className="appearance-none cursor-pointer bg-white border border-gray-300 text-gray-700 py-2 pl-4 pr-10 rounded-full focus:outline-none focus:ring-2 focus:ring-[#009688] focus:border-transparent text-sm font-semibold shadow-sm transition-all hover:border-[#009688]"
                  >
                    <option value="">Por defecto</option>
                    <option value="asc">Orden Alfabético (A-Z)</option>
                    <option value="desc">Orden Alfabético (Z-A)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 group-hover:text-[#009688] transition-colors">
                    <FaChevronDown className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Grid de Secciones con H2 limpios e inyectados */}
          <div className="grid grid-rows-auto space-y-12">
            {seccionesArray.map(
              (seccion) =>
                seccion.productosDeLaSeccion.length > 0 && (
                  <MemoizedSeccion 
                    key={seccion.nombre} 
                    nombre={seccion.nombre} 
                    productosDeLaSeccion={seccion.productosDeLaSeccion} 
                  />
                )
            )}
          </div>

          {/* Mensaje si no hay productos */}
          {productosFiltrados.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              <p className="text-xl">No se encontraron productos. Intenta con otra búsqueda.</p>
            </div>
          )}
        </section>
      </div>
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
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-2 xs:gap-3 sm:gap-6 md:gap-8">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                  <div key={item} className="my-4 sm:my-6 md:my-10 flex flex-col items-center">
                    <div className="bg-gray-300 animate-pulse rounded-[15%] w-4/5 h-4/5 md:h-56 md:w-56 mb-3"></div>
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

/* -------------------- SECCIÓN (H2) -------------------- */
const Seccion = React.memo(function Seccion({
  nombre,
  productosDeLaSeccion,
}: {
  nombre: string;
  productosDeLaSeccion: Producto[];
}) {
  const productCards = useMemo(() => {
    return productosDeLaSeccion.map((producto) => (
      <MemoizedProductCard key={producto.id} producto={producto} />
    ));
  }, [productosDeLaSeccion]);

  const getSeccionDisplay = (nombreSeccion: string) => {
    const normalized = nombreSeccion
      ?.toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .trim();

    switch (normalized) {
      case "maquinaria":
        return "Equipos de Sellado, Empaque y Embalaje";
      case "negocio":
        return "Herramientas de Soldadura Profesional";
      case "decoracion":
        return "Mobiliario LED Comercial y Tecnología";
      case "purificacion":
        return "Sistemas de Purificación de Agua";
      default:
        return nombreSeccion;
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* CORRECCIÓN SEO: Inyección controlada de H2 semánticos por categoría */}
      <h2 className="text-xl md:text-3xl font-extrabold text-[#015f86] uppercase tracking-wide border-b pb-2 border-gray-200">
        {getSeccionDisplay(nombre)}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-6 justify-items-center">
        {productCards}
      </div>
    </div>
  );
});
const MemoizedSeccion = Seccion;

/* -------------------- INTERSECTION OBSERVER -------------------- */
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
    case 'decoracion': return '#5D39FB';
    case 'Maquinaria': return '#04B088';
    default: return '#0374A2';
  }
};

const CARD_RADIUS = 16;

/* -------------------- PRODUCT CARD (H3) -------------------- */
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
      href={`/catalogo-maquinarias/${producto.link}`}
      title={`Ver detalles de ${producto.nombre}`}
      className="w-full"
    >
      <div
        ref={targetRef}
        className="group flex flex-row md:flex-col w-full max-w-[380px] min-h-[140px] md:min-h-auto bg-white rounded-xl shadow-md border relative overflow-hidden transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)]"
        style={{ borderColor: categoriaColor, borderRadius: CARD_RADIUS }}
      >
        {/* MOBILE */}
        <div className="flex-col w-full md:hidden h-auto">
          <div
            className="relative flex items-center justify-center w-full h-[180px] bg-[#f8f8f8] overflow-hidden shrink-0"
            style={{ borderRadius: `${CARD_RADIUS}px ${CARD_RADIUS}px 0 0` }}
          >
            {!imageLoaded && <div className="absolute inset-0 bg-gray-300 animate-pulse" />}
            {hasIntersected && (
              <img
                src={imageSrc}
                alt={producto.nombre}
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
              />
            )}
          </div>

          <div
            className="flex flex-col items-center justify-between w-full h-auto py-2 px-1 relative overflow-hidden"
            style={{ background: categoriaColor, borderRadius: `0 0 ${CARD_RADIUS}px ${CARD_RADIUS}px` }}
          >
            <div className="flex-1 flex items-center justify-center px-2 pt-2 pb-2 pr-24 overflow-hidden">
              {/* ESTRUCTURA SEO CORRECTA: H3 para el producto individual */}
              <h3 className="text-sm sm:text-base w-full font-bold uppercase text-white text-center break-words leading-tight line-clamp-4">
                {producto.nombre}
              </h3>
            </div>
            <button className="absolute right-0 bottom-0 bg-white font-bold text-xs text-[#0374A2] px-4 py-2 rounded-tl-xl rounded-br-none shadow-sm border-none active:scale-95 transition-transform">
              Comprar
            </button>
          </div>
        </div>

        {/* DESKTOP */}
        <div className="hidden w-full h-full md:flex md:flex-col">
          <div className="relative w-full h-[280px] flex items-center justify-center overflow-hidden">
            {!imageLoaded && <div className="absolute inset-0 bg-gray-300 animate-pulse flex items-center justify-center" />}
            {hasIntersected && (
              <img
                src={imageSrc}
                alt={producto.nombre}
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
                className={`block object-cover w-full h-full transition-all bg-[#f8f8f8] duration-500 ease-out group-hover:scale-105 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
              />
            )}
          </div>
          <div
            className="relative w-full h-12 min-h-12 flex items-center m-0 p-0 overflow-hidden"
            style={{ background: categoriaColor, borderRadius: `0 0 ${CARD_RADIUS}px ${CARD_RADIUS}px` }}
          >
            <div className="w-full h-full flex items-center pl-4 pr-20 py-1 overflow-hidden">
              {/* ESTRUCTURA SEO CORRECTA: H3 para el producto individual */}
              <h3 className="text-[13px] xl:text-[14px] font-medium uppercase text-white leading-tight break-words line-clamp-2">
                {producto.nombre}
              </h3>
            </div>
            <button className="absolute right-0 bottom-0 bg-white font-bold text-xs text-[#0374A2] px-4 py-2 rounded-tl-xl rounded-br-none shadow-sm border-none active:scale-95 transition-transform">
              Comprar
            </button>
          </div>
        </div>
      </div>
    </a>
  );
});
const MemoizedProductCard = ProductCard;