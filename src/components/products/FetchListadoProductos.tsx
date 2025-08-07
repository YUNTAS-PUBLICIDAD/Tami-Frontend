import { config, getApiUrl } from "config";
import { useEffect, useState, type JSX } from "react";
import type Producto from "src/models/Product";

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

  const obtenerDatos = async () => {
    try {
      const response = await fetch(getApiUrl(config.endpoints.productos.all));
      if (!response.ok) throw new Error("Error al obtener productos");

      const data = await response.json();
      const productos = data; // Accedemos al array de productos en `data`

      // Mapeamos los datos del backend al modelo `Product`
      const productosMapeados: Producto[] = productos.map((producto: any) => {
        const primeraImagen = producto.imagenes && producto.imagenes.length > 0
          ? producto.imagenes[0].url_imagen
          : null;

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
          imagenes: producto.imagenes || [],
          stock: producto.stock,
          precio: parseFloat(producto.precio),
          seccion: producto.seccion,
          createdAt: producto.created_at
        };
      });

      // Construimos las secciones
      const seccionesArray: SeccionProps[] = [
        {
          nombreSeccion: "Negocio",
          productosDeLaSeccion: productosMapeados
            .filter((p: Producto) => p.seccion === "Negocio")
        },
        {
          nombreSeccion: "Decoración",
          productosDeLaSeccion: productosMapeados
            .filter((p: Producto) => p.seccion === "Decoración")
        },
        {
          nombreSeccion: "Maquinaria",
          productosDeLaSeccion: productosMapeados
            .filter((p: Producto) => p.seccion === "Maquinaria")
        },
      ];

      // Generar los componentes Seccion y actualizar el estado `mostrar`
      setMostrar(
        seccionesArray.map((seccion, i) => <Seccion key={i} {...seccion} />)
      );
    } catch (error) {
      console.error("Error cargando productos:", error);
    }
  };

  useEffect(() => {
    obtenerDatos();
  }, []);

  return <section className="w-full grid grid-rows-auto">{mostrar}</section>;
}

function Seccion({ nombreSeccion, productosDeLaSeccion }: SeccionProps) {
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
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4
                       gap-2 xs:gap-4 sm:gap-6 md:gap-8
                       mt-4 sm:mt-6">
            {productosDeLaSeccion.length > 0 ? (
                productosDeLaSeccion.map((producto) => (
                    <ProductCard key={producto.id} producto={producto} />
                ))
            ) : (
                <p className="text-gray-400 text-lg col-span-full text-center py-8">
                  No hay productos en esta sección.
                </p>
            )}
          </div>
        </div>
      </div>
  );
}

function ProductCard({ producto }: Props) {
  return (
    <a
      href={`/productos/detalle?link=${producto.link}`}
      title={`Ver detalles de ${producto.nombre}`}
      className="my-4 sm:my-6 md:my-10 flex flex-col items-center group hover:cursor-pointer w-full"
    >
      <div className="bg-gray-300 rounded-[15%] place-self-center w-4/5 h-4/5 md:h-56 md:w-56 md:p-0 mb-3 overflow-hidden">
        <img
            src={
              (() => {
                const src = typeof producto.imagenes[0]?.url_imagen === "string"
                    ? (producto.imagenes[0].url_imagen.startsWith("https")
                        ? producto.imagenes[0].url_imagen
                        : `${ApiUrl.replace(/\/$/, "")}${producto.imagenes[0].url_imagen}`)
                    : `https://placehold.co/100x150/orange/white?text=${encodeURIComponent(producto.nombre)}`;
                console.log(`[DEBUG] Imagen de ${producto.nombre}:`, src);
                return src;
              })()
            }
            alt={producto.imagenes[0]?.texto_alt_SEO || producto.nombre}
            title={producto.imagenes[0]?.texto_alt_SEO || producto.imagenes[0]?.imageTitle}
            className="h-full w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-150"
        />
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
}