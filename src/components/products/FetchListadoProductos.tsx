import { config, getApiUrl } from "config";
import { useEffect, useState, type JSX } from "react";
import type {Product} from "src/models/Product";

interface SeccionProps {
  nombreSeccion: string;
  productosDeLaSeccion: Product[];
}

interface Props {
  producto: Product;
}

export default function ListadoDeProductos() {
  const [mostrar, setMostrar] = useState<JSX.Element[]>([]);

  const obtenerDatos = async () => {
    try {
      const response = await fetch(getApiUrl(config.endpoints.productos.list));
      if (!response.ok) throw new Error("Error al obtener productos");

      const data = await response.json();
      const productos = data.data; // Accedemos al array de productos en `data`

      // Mapeamos los datos del backend al modelo `Product`
      const productosMapeados: Product[] = productos.map((producto: any) => ({
        id: producto.id.toString().trim(),
        nombreProducto: producto.nombreProducto,
        stockProducto: producto.stockProducto,
        precioProducto: parseFloat(producto.precioProducto),
        image: producto.image.startsWith("https")
          ? producto.image
          : `https://apitami.tami-peru.com${producto.image}`,
        seccion: producto.seccion,
      }));

      // Construimos las secciones
      const seccionesArray: SeccionProps[] = [
        {
          nombreSeccion: "Trabajo",
          productosDeLaSeccion: productosMapeados
            .filter((p: Product) => p.seccion === "Trabajo")
            .slice(0, 4),
        },
        {
          nombreSeccion: "Decoración",
          productosDeLaSeccion: productosMapeados
            .filter((p: Product) => p.seccion === "Decoración")
            .slice(0, 4),
        },
        {
          nombreSeccion: "Negocio",
          productosDeLaSeccion: productosMapeados
            .filter((p: Product) => p.seccion === "Negocio")
            .slice(0, 4),
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
    <div className="flex justify-center relative py-10" id={nombreSeccion}>
      <div className="relative w-4/5 place-self-center">
        <h2 className="text-white bg-gradient-to-r from-teal-900 via-teal-700 py-3 w-fit lg:ps-10 ps-5 pe-16 lg:pe-28 text-3xl font-bold">
          {nombreSeccion}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {productosDeLaSeccion.length > 0 ? (
            productosDeLaSeccion.map((producto) => (
              <ProductCard key={producto.id} producto={producto} />
            ))
          ) : (
            <p className="text-gray-400 text-lg">
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
      href={`/products/details?id=${producto.id}`}
      className="my-10 flex flex-col items-center group hover:cursor-pointer"
    >
      <div className="bg-gray-300 rounded-[15%] place-self-center h-56 w-56 p-0 mb-3 overflow-hidden">
        <img
          src={
            producto.image ||
            `https://placehold.co/100x150/orange/white?text=${producto.nombreProducto}`
          }
          alt={producto.nombreProducto}
          className="h-full w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-150"
        />
      </div>
      <div className="flex-grow text-center">
        <h3 className="text-lg font-bold text-teal-700">
          {producto.nombreProducto}
        </h3>
      </div>
      <div className="flex flex-row justify-between text-teal-700 mt-3">
        <svg
          width="50"
          height="50"
          viewBox="0 0 25 25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="group-hover:scale-75 transition-transform duration-300 ease-in-out"
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
        <button className="rounded-full bg-white px-6 font-bold text-xl border-4 border-gray-300 transition-transform duration-300 ease-in-out group-hover:scale-110 content-center">
          Saber Más
        </button>
        <svg
          width="50"
          height="50"
          viewBox="0 0 25 25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="group-hover:scale-75 transition-transform duration-300 ease-in-out"
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
