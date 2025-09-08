import { config, getApiUrl } from "config";
import type Producto from "src/models/Product";
import { useEffect, useState } from "react";

const ApiUrl = config.apiUrl;

// Genera slug si no hay `link`
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
                const response = await fetch(getApiUrl(config.endpoints.productos.list));
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

    

    if (isMobile) {
        if (isLoading) {
            return (
                <div className="w-full flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-9 w-9 border-t-2 border-b-2 border-teal-500"></div>
                    <span className="text-teal-500 font-medium">Cargando productos...</span>
                </div>
            );
        }
        return (
            <div className="flex justify-center px-8 mb-20 relative min-h-[280px] h-[320px]">
                {productsArray.map((item, index) => (
                    <div
                        key={item.id}
                        className={`w-72 p-6 bg-gradient-to-b to-white flex flex-col items-center text-center transition-all duration-500 absolute ${slideIndex === index
                                ? "opacity-100 scale-100 relative"
                                : "opacity-0 scale-95 pointer-events-none"
                            }`}
                    >
                        <img
                            src={
                                (() => {
                                    if (item.imagenes[0]?.url_imagen instanceof File) {
                                        return URL.createObjectURL(item.imagenes[0].url_imagen);
                                    }
                                    const url = item.imagenes[0]?.url_imagen;
                                    return typeof url === "string"
                                        ? url.startsWith("http")
                                            ? url
                                            : `${ApiUrl.replace(/\/$/, "")}${url}`
                                        : `https://placehold.co/300x300/orange/white?text=${encodeURIComponent(item.titulo)}`;
                                })()
                            }
                            alt={item.titulo}
                            title={item.titulo}
                            className="w-32 h-32 rounded-2xl object-cover mb-4"
                        />
                        <h3 className="text-xl font-bold text-teal-600 tracking-wide mb-2">
                            {item.titulo}
                        </h3>
                        <a
                            href={getLinkHref(item)}
                            className="mt-2 bg-teal-570 hover:bg-teal-800 text-white px-4 py-2 rounded-full transition-all"
                        >
                            Información
                        </a>
                    </div>
                ))}

                {/* Flechas */}
                <button
                    onClick={() =>
                        setSlideIndex((prev) => (prev - 1 + productsArray.length) % productsArray.length)
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
                            className={`h-3 w-3 rounded-full bg-gray-300 ${slideIndex === i ? "bg-teal-600" : ""
                                }`}
                        />
                    ))}
                </div>
            </div>
        );
    }

    // Desktop
    return (
        <div className="w-full grid grid-cols-3 gap-8 overflow-x-auto lg:overflow-visible scroll-smooth px-4 mb-20">
            {productsArray.map((item) => (
                <div
                    key={item.id}
                    className="bg-gradient-to-b to-white text-center justify-items-center text-teal-700 h-full group relative flex flex-col items-center p-6 transition-all duration-300 hover:cursor-pointer"
                >
                    <a
                        href={getLinkHref(item)}
                        className="w-full h-full font-extrabold text-xl flex flex-col items-center gap-6"
                    >
                        <img
                            src={
                                (() => {
                                    if (item.imagenes[0]?.url_imagen instanceof File) {
                                        return URL.createObjectURL(item.imagenes[0].url_imagen);
                                    }
                                    const url = item.imagenes[0]?.url_imagen;
                                    return typeof url === "string"
                                        ? url.startsWith("http")
                                            ? url
                                            : `${ApiUrl.replace(/\/$/, "")}${url}`
                                        : `https://placehold.co/300x300/orange/white?text=${encodeURIComponent(item.titulo)}`;
                                })()
                            }
                            alt={item.titulo}
                            title={item.titulo}
                            className="w-4/5 place-self-center transition-transform duration-300 ease-in-out mb-10 group-hover:scale-100"
                        />
                        <h3 className="text-xl font-bold text-teal-700 tracking-wide">
                            {item.titulo}
                        </h3>
                        <div className="my-8 place-self-center border border-teal-700 rounded-full px-5 py-2 w-fit group-hover:cursor-pointer group-hover:bg-teal-700 group-hover:text-white transition-colors duration-300">
                            Información
                        </div>
                    </a>
                </div>
            ))}
        </div>
    );
};

export default ProductSlideshow;