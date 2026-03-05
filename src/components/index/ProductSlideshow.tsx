import { config, getApiUrl } from "config";
import type Producto from "src/models/Product";
import { useEffect, useRef, useState } from "react";

const ApiUrl = config.apiUrl;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

const ProductSlideshow = (): JSX.Element | null => {
  const [productsArray, setProductsArray] = useState<Producto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const [mobileIndex, setMobileIndex] = useState(0);
  const mobileIntervalRef = useRef<number | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const animRef = useRef<number | null>(null);
  const offsetRef = useRef<number>(0);
  const isPausedRef = useRef<boolean>(false);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(getApiUrl(config.endpoints.productos.list));
        if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
        const data = await res.json();

        const items: Producto[] = Array.isArray(data)
          ? data.slice(-6)
          : Array.isArray(data.data)
            ? data.data.slice(-6)
            : [];

        setProductsArray(items);
      } catch (err) {
        console.error("Error al obtener productos:", err);
        setProductsArray([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();

    const checkScreen = () => setIsMobile(window.innerWidth < 1024);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  useEffect(() => {
    if (!isMobile || productsArray.length === 0) return;

    if (mobileIntervalRef.current) {
      window.clearInterval(mobileIntervalRef.current);
    }

    mobileIntervalRef.current = window.setInterval(() => {
      setMobileIndex((prev) => (prev + 1) % productsArray.length);
    }, 4200);

    return () => {
      if (mobileIntervalRef.current) {
        window.clearInterval(mobileIntervalRef.current);
        mobileIntervalRef.current = null;
      }
    };
  }, [isMobile, productsArray.length]);

  useEffect(() => {
    if (isMobile) return;
    if (!containerRef.current || productsArray.length === 0) return;

    const el = containerRef.current;
    const step = 0.45;
    offsetRef.current = 0;

    const animate = () => {
      if (!isPausedRef.current) {
        const fullWidth = el.scrollWidth / 2;
        offsetRef.current -= step;
        if (Math.abs(offsetRef.current) >= fullWidth) {
          offsetRef.current = 0;
        }
        el.style.transform = `translateX(${offsetRef.current}px)`;
      }
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      animRef.current = null;
    };
  }, [isMobile, productsArray]);

  const handleMouseEnter = () => {
    if (!isMobile) {
      isPausedRef.current = true;
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      isPausedRef.current = false;
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    if (mobileIntervalRef.current) {
      window.clearInterval(mobileIntervalRef.current);
      mobileIntervalRef.current = null;
    }
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isMobile) return;
    touchEndX.current = e.touches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!isMobile) return;
    if (touchStartX.current == null || touchEndX.current == null) {
      if (!mobileIntervalRef.current) {
        mobileIntervalRef.current = window.setInterval(() => {
          setMobileIndex((prev) => (prev + 1) % productsArray.length);
        }, 4200);
      }
      touchStartX.current = null;
      touchEndX.current = null;
      return;
    }

    const delta = touchStartX.current - touchEndX.current;
    const threshold = 50;
    if (Math.abs(delta) > threshold) {
      if (delta > 0) {
        setMobileIndex((prev) => (prev + 1) % productsArray.length);
      } else {
        setMobileIndex(
          (prev) => (prev - 1 + productsArray.length) % productsArray.length
        );
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
    if (!mobileIntervalRef.current) {
      mobileIntervalRef.current = window.setInterval(() => {
        setMobileIndex((prev) => (prev + 1) % productsArray.length);
      }, 4200);
    }
  };

  const getImageUrl = (item: Producto) => {
    const url = item.imagenes?.[0]?.url_imagen;
    return typeof url === "string"
      ? url.startsWith("http")
        ? url
        : `${ApiUrl.replace(/\/$/, "")}${url}`
      : `https://placehold.co/300x300/orange/white?text=${encodeURIComponent(
        (item.titulo as string) ?? "Producto"
      )}`;
  };

  const getLinkHref = (item: Producto) =>
    `/productos/${item.link ?? slugify(String(item.titulo))}`;

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-9 w-9 border-t-2 border-b-2 border-white mr-3" />
        <span className="text-white font-medium">Cargando productos...</span>
      </div>
    );
  }

  if (!productsArray.length) return null;

  if (isMobile) {
    return (
      <div
        className="relative w-full overflow-hidden pb-12"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        aria-label="Carrusel productos destacado - móvil"
      >
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#2A938B]/35 to-transparent z-20 pointer-events-none" />
        {/* se elimino el div de la derecha */}
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${mobileIndex * 100}%)` }}
        >
          {productsArray.map((item) => (
            <div
              key={item.id}
              className="flex-shrink-0 w-full px-4 flex justify-center"
            >
              <div className="bg-white rounded-xl overflow-hidden shadow-lg w-full max-w-[320px] border border-gray-100 transition-all duration-300 hover:shadow-[0_15px_35px_-10px_rgba(0,120,111,0.3)] hover:-translate-y-1">
                <div className="relative">
                  <img
                    src={getImageUrl(item)}
                    alt={String(item.titulo)}
                    title={String(item.titulo)}
                    className="w-full h-80 object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-[#00786F]/90 backdrop-blur-sm p-4 flex flex-col gap-2">
                    <h3 className="text-white font-bold text-sm uppercase leading-tight">
                      {item.titulo}
                    </h3>
                    <div className="flex justify-end mt-auto">
                      <a
                        href={getLinkHref(item)}
                        aria-label={`Comprar ${item.titulo}`}
                        className="bg-white border-2 border-white text-[#00786F] hover:bg-transparent hover:text-white px-4 py-3 rounded-md font-bold text-xs transition-all uppercase inline-block"
                      >
                        Comprar
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 flex gap-2 z-30" style={{ bottom: 10 }}>
          {productsArray.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setMobileIndex(i);
                if (mobileIntervalRef.current) {
                  window.clearInterval(mobileIntervalRef.current);
                  mobileIntervalRef.current = window.setInterval(() => {
                    setMobileIndex((prev) => (prev + 1) % productsArray.length);
                  }, 4200);
                }
              }}
              aria-label={`Ir al producto ${i + 1}`}
              className="flex items-center justify-center p-5 group"
            >
              <span
                className={`rounded-full transition-all ${i === mobileIndex ? "bg-teal-700 w-6 h-2" : "bg-gray-400 w-2 h-2"}`}
              />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full overflow-hidden"
      aria-label="Carrusel productos destacado - desktop"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="absolute left-0 top-0 bottom-0 w-36 pointer-events-none z-30" style={{ background: "linear-gradient(90deg, rgba(2,78,75,0.95) 0%, rgba(42,147,139,0.45) 35%, rgba(42,147,139,0.15) 60%, transparent 100%)" }} />
      <div className="absolute right-0 top-0 bottom-0 w-36 pointer-events-none z-30" style={{ background: "linear-gradient(270deg, rgba(13,45,43,0.85) 0%, rgba(13,45,43,0.35) 35%, rgba(13,45,43,0.12) 60%, transparent 100%)" }} />

      <div
        ref={containerRef}
        className="flex gap-6 will-change-transform"
      >
        {[...productsArray, ...productsArray].map((item, idx) => (
          <div key={`${item.id}-${idx}`} className="flex-shrink-0 w-1/3 px-3">
            <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100/80 transition-all duration-500 ease-out hover:shadow-[0_20px_45px_-15px_rgba(0,120,111,0.4)] hover:-translate-y-1.5 hover:border-teal-300/50">
              <div className="relative">
                <img
                  src={getImageUrl(item)}
                  alt={String(item.titulo)}
                  title={String(item.titulo)}
                  className="w-full h-80 object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 bg-[#00786F]/90 backdrop-blur-sm p-4 flex flex-col gap-2">
                  <h3 className="text-white font-bold text-sm uppercase leading-tight">
                    {item.titulo}
                  </h3>
                  <div className="flex justify-end mt-auto">
                    <a
                      href={getLinkHref(item)}
                      aria-label={`Comprar ${item.titulo}`}
                      className="bg-white border-2 border-white text-[#00786F] hover:bg-transparent hover:text-white px-4 py-3 rounded-md font-bold text-xs transition-all uppercase inline-block"
                    >
                      Comprar
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductSlideshow;