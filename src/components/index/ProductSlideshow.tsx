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

    const checkScreen = () => setIsMobile(window.innerWidth < 640);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  if (productsArray.length === 0) return null;

  const getLinkHref = (item: Producto) =>
    `/productos/detalle?link=${item.link ?? slugify(item.titulo)}`;

  // ------------------------------
  // 👉 Mobile Layout
  // ------------------------------
  if (isMobile) {
    if (isLoading) {
      return (
        <div className="w-full flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-9 w-9 border-t-2 border-b-2 border-teal-500 mr-3"></div>
          <span className="text-teal-500 font-medium">
            Cargando productos...
          </span>
        </div>
      );
    }

    return (
      <div className="flex justify-center px-8 mb-20 relative min-h-[280px] h-[320px]">
        {productsArray.map((item, index) => (
          <div
            key={item.id}
            className={`w-72 p-6 bg-gradient-to-b to-white flex flex-col items-center text-center transition-all duration-500 absolute ${
              slideIndex === index
                ? "opacity-100 scale-100 relative"
                : "opacity-0 scale-95 pointer-events-none"
            }`}
          >
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
              className="w-32 h-32 rounded-2xl object-cover mb-4"
            />
            <h3 className="text-xl font-bold text-teal-600 tracking-wide mb-2">
              {item.titulo}
            </h3>
            <a
              href={getLinkHref(item)}
              className="mt-2 bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-full transition-all"
            >
              Información
            </a>
          </div>
        ))}

        {/* Flechas */}
        <button
          onClick={() =>
            setSlideIndex(
              (prev) => (prev - 1 + productsArray.length) % productsArray.length
            )
          }
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-teal-600 text-white p-2 rounded-full shadow-md"
        >
          &#8592;
        </button>
        <button
          onClick={() =>
            setSlideIndex((prev) => (prev + 1) % productsArray.length)
          }
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-teal-600 text-white p-2 rounded-full shadow-md"
        >
          &#8594;
        </button>

        {/* Indicadores */}
        <div className="absolute bottom-[-1.5rem] left-1/2 -translate-x-1/2 flex gap-2">
          {productsArray.map((_, i) => (
            <span
              key={i}
              className={`h-3 w-3 rounded-full ${
                slideIndex === i ? "bg-teal-600" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  // 👉 Desktop Layout
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 ">
      {productsArray.map((item) => (
        <div
          key={item.id}
          className="relative bg-white rounded-2xl overflow-hidden shadow-lg group hover:shadow-xl transition-shadow duration-300 max-w-[440px] mx-auto"
        >
          {/* Imagen de producto */}
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
            className="w-full h-80 object-cover object-center"
          />

          {/* Overlay inferior más espacioso */}
          <div className="absolute inset-x-0 bottom-0 h-1/5 bg-white/60 backdrop-blur-sm flex items-center justify-between px-5 py-3">
            <h3 className="text-teal-700 font-semibold text-sm md:text-base max-w-[60%] ">
              {item.titulo}
            </h3>
            <a
              href={getLinkHref(item)}
              className="bg-white text-teal-700 border border-teal-700 hover:bg-teal-700 hover:text-white text-xs md:text-sm font-medium px-3 py-1.5 transition-all"
            >
              Comprar
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductSlideshow;
