import { config, getApiUrl } from "config";
import type Producto from "src/models/Product";
import { useEffect, useState } from "react";

const ApiUrl = config.apiUrl;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

const ProductSlideshow = () => {
  const [productsArray, setProductsArray] = useState<Producto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [slideIndex, setSlideIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          getApiUrl(config.endpoints.productos.list)
        );
        console.log("Fetch response:", response);
        if (!response.ok) {
          throw new Error(`Error en la petición: ${response.status}`);
        }
        const data = await response.json();
        setProductsArray(data.slice(-3));
      } catch (error) {
        console.error("Error al obtener los productos:", error);
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
    if (productsArray.length === 0) return;

    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % productsArray.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [productsArray.length]);

  if (productsArray.length === 0) return null;

  const getLinkHref = (item: Producto) =>
    `/productos/${item.link ?? slugify(item.titulo)}`;

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-9 w-9 border-t-2 border-b-2 border-white mr-3"></div>
        <span className="text-white font-medium">Cargando productos...</span>
      </div>
    );
  }

  //Mobile
  if (isMobile) {
    return (
      <div className="relative w-full">
        {/* Contenedor de slides */}
        <div className="flex justify-center px-4">
          {productsArray.map((item, index) => (
            <div
              key={item.id}
              className={`transition-all duration-500 ${
                slideIndex === index
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-95 absolute"
              }`}
              style={{
                display: slideIndex === index ? "block" : "none",
              }}
            >
              <div className="bg-white rounded-xl overflow-hidden shadow-lg w-[280px] sm:w-[320px] mx-auto">
                <div className="relative">
                  <img
                    src={(() => {
                      const url = item.imagenes[0]?.url_imagen;
                      return typeof url === "string"
                        ? url.startsWith("http")
                          ? url
                          : `${ApiUrl.replace(/\/$/, "")}${url}`
                        : `https://placehold.co/300x300/orange/white?text=${encodeURIComponent(
                            item.titulo
                          )}`;
                    })()}
                    alt={item.titulo}
                    title={item.titulo}
                    className="w-full h-80 object-cover"
                  />
                  {/* Overlay inferior - 2 columnas */}
                  <div className="absolute inset-x-0 bottom-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-between px-4 py-3">
                    <h3 className="text-teal-700 font-bold text-sm uppercase flex-1">
                      {item.titulo}
                    </h3>
                    <a
                      href={getLinkHref(item)}
                      className="bg-white border-2 border-teal-700 text-teal-700 hover:bg-teal-700 hover:text-white px-4 py-1.5 rounded-md font-semibold transition-all text-xs whitespace-nowrap ml-2"
                    >
                      Comprar
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Controles de navegación (solo mobile) */}
        <div className="flex justify-center items-center gap-6 mt-6">
          {/* Flecha izquierda */}
          <button
            onClick={() =>
              setSlideIndex(
                (prev) =>
                  (prev - 1 + productsArray.length) % productsArray.length
              )
            }
            className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all"
            aria-label="Anterior"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Indicadores */}
          <div className="flex gap-2">
            {productsArray.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlideIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  slideIndex === i ? "bg-white w-8" : "bg-white/40 w-2"
                }`}
                aria-label={`Ir a producto ${i + 1}`}
              />
            ))}
          </div>

          {/* Flecha derecha */}
          <button
            onClick={() =>
              setSlideIndex((prev) => (prev + 1) % productsArray.length)
            }
            className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all"
            aria-label="Siguiente"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  //Desktop
  return (
    <div className="relative w-full overflow-hidden">
      {/* Gradientes de desvanecimiento en los bordes */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#2A938B] to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#0D2D2B] to-transparent z-10 pointer-events-none"></div>

      {/* Contenedor de slides con animación */}
      <div className="relative">
        <div
          className="flex gap-6 transition-transform duration-700 ease-in-out"
          style={{
            transform: `translateX(-${slideIndex * (100 / 3)}%)`,
          }}
        >
          {productsArray.map((item) => (
            <div key={item.id} className="flex-shrink-0 w-1/3 px-3">
              <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className="relative">
                  <img
                    src={(() => {
                      const url = item.imagenes[0]?.url_imagen;
                      return typeof url === "string"
                        ? url.startsWith("http")
                          ? url
                          : `${ApiUrl.replace(/\/$/, "")}${url}`
                        : `https://placehold.co/300x300/orange/white?text=${encodeURIComponent(
                            item.titulo
                          )}`;
                    })()}
                    alt={item.titulo}
                    title={item.titulo}
                    className="w-full h-80 object-cover"
                  />
                  {/* Overlay inferior - 2 columnas */}
                  <div className="absolute inset-x-0 bottom-0 bg-white/80 backdrop-blur-sm flex items-center justify-between px-4 py-3">
                    <h3 className="text-teal-700 font-bold text-sm uppercase flex-1">
                      {item.titulo}
                    </h3>
                    <a
                      href={getLinkHref(item)}
                      className="bg-white border-2 border-teal-700 text-teal-700 hover:bg-teal-700 hover:text-white px-4 py-1.5 rounded-md font-semibold transition-all text-xs whitespace-nowrap ml-2"
                    >
                      Comprar
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {/* Duplicar productos para efecto infinito */}
          {productsArray.map((item) => (
            <div
              key={item.id}
              className="flex-shrink-0 w-1/3 px-3"
            >
              <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className="relative">
                  <img
                    src={(() => {
                      const url = item.imagenes[0]?.url_imagen;
                      return typeof url === "string"
                        ? url.startsWith("http")
                          ? url
                          : `${ApiUrl.replace(/\/$/, "")}${url}`
                        : `https://placehold.co/300x300/orange/white?text=${encodeURIComponent(
                            item.titulo
                          )}`;
                    })()}
                    alt={item.titulo}
                    title={item.titulo}
                    className="w-full h-80 object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-white/80 backdrop-blur-sm flex items-center justify-between px-4 py-3">
                    <h3 className="text-teal-700 font-bold text-sm uppercase flex-1">
                      {item.titulo}
                    </h3>
                    <a
                      href={getLinkHref(item)}
                      className="bg-white border-2 border-teal-700 text-teal-700 hover:bg-teal-700 hover:text-white px-4 py-1.5 rounded-md font-semibold transition-all text-xs whitespace-nowrap ml-2"
                    >
                      Comprar
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductSlideshow;
