import React, { useEffect, useState } from 'react'
import boxSize from "@icons/box-size.svg";
import ArrowProducts from "../../assets/icons/flecha-product.svg";
import type Producto from '../../models/Product'
import { insertJsonLd } from "../../utils/schema-markup-generator";
import { config } from 'config';

interface Props {
    producto: Producto
}

const ProductPage: React.FC<Props> = ({ producto }) => {
    const [productViewer, setProductViewer] = useState<string>(producto.imagenes[0].url_imagen);

    useEffect(() => {
        insertJsonLd("product", producto);
    }, [producto]);

    return (
        <div className="w-full">
            {/* -------------------- HERO -------------------- */}
            <div
                className="pt-16 md:pt-32 md:pb-16 bg-gradient-to-b from-teal-700 to-teal-400 text-white relative overflow-hidden xl:h-screen"
            >
                <div className="max-w-6xl md:w-1/2 px-4 md:px-24 py-8 md:py-12 relative z-10">
                    <div className="flex items-center gap-6 mb-4">
                        <div className="w-5 md:w-6 h-5 md:h-6">
                            <img
                                src={ArrowProducts.src}
                                alt="Flecha"
                                title="Flecha"
                                className="w-full h-full"
                                loading="lazy"
                            />
                        </div>
                        <h2 className="text-xl uppercase md:text-2xl font-bold">
                            {producto.titulo}
                        </h2>
                    </div>

                    <h1
                        className="text-2xl md:text-4xl/14 uppercase font-bold mb-6 md:mb-8"
                        id="product-subtitle"
                    >
                        {producto.subtitulo}
                    </h1>

                    <button
                        id="btnQuotationHero"
                        className="bg-white text-teal-600 px-8 md:px-12 py-2 md:py-3 w-full rounded-full font-bold text-lg md:text-3xl hover:bg-opacity-90 transition cursor-pointer"
                    >
                        ¡COTÍZALO!
                    </button>
                </div>

                {/* Imagen decorativa derecha */}
                <div
                    className="hidden md:flex absolute right-0 top-32 w-full md:w-1/2 h-full bg-white
                  rounded-bl-[30%] md:rounded-bl-[50%] rounded-tl-[40%] md:rounded-tl-[60%]
                  rounded-tr-[15%] md:rounded-tr-[25%] items-center justify-center"
                >
                    <img
                        src={`${config.apiUrl}${producto.imagenes[0].url_imagen || "/placeholder.png"}`}
                        alt={producto.nombre}
                        title={producto.nombre}
                        className="w-3/4 md:w-4/5 h-3/4 md:h-4/5 object-contain mx-auto"
                        loading="lazy"
                    />
                </div>
            </div>

            {/* -------------------- MAIN CONTENT -------------------- */}
            <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 mt-6 md:py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    {/* Galería izquierda */}
                    <div className="space-y-4 w-full max-w-[440px]">
                        {/* Imagen principal */}
                        <div
                            className="w-full aspect-[1/1] bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center"
                        >
                            <img
                                title={producto.nombre}
                                src={`${config.apiUrl}${productViewer}`}
                                alt={producto.titulo}
                                className="w-full h-full object-contain "
                                loading="lazy"
                            />
                        </div>
                        {/* Miniaturas */}
                        <div className="grid grid-cols-4 gap-2 w-full">
                            {
                                producto.imagenes.slice(0, 4).map((image, index) => (
                                    <div
                                        key={index}
                                        className={`aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer opacity-80 hover:opacity-100 hover:scale-105 transition-all duration-300 ${image.url_imagen === productViewer && 'border-2 border-teal-700'}`}
                                        onClick={() => {
                                            setProductViewer(image.url_imagen)
                                        }}
                                    >
                                        <img
                                            title={image.imageTitle || image.texto_alt_SEO}
                                            src={`${config.apiUrl}${image.url_imagen}`}
                                            alt={`${image.texto_alt_SEO}`}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    </div>
                                ))
                            }
                        </div>

                    </div>

                    {/* Información producto */}
                    <div>
                        <div className="mb-6">
                            <h3 className="text-3xl font-black mb-2 text-teal-800">
                                {producto.titulo}
                            </h3>
                            <h1 className="font-bold mb-2 text-lg">Información del producto:</h1>
                            <p className="text-gray-700 text-justify break-words">
                                {producto.descripcion}
                            </p>
                        </div>

                        {/* Especificaciones */}
                        <div className="bg-gray-100 rounded-lg mb-6 p-4 md:p-8">
                            <h3 className="font-bold mb-2 text-lg">Detalles del producto</h3>
                            <h3 className="font-bold mb-2">Especificaciones técnicas:</h3>
                            <ul className="list-disc pl-5 space-y-2 text-gray-700" id="specs-list">
                                {producto.especificaciones.map((spec) => <li>{spec.valor}</li>)}
                            </ul>

                            <h3 className="font-bold mt-4 mb-4">Dimensiones:</h3>
                            <div className="flex items-start gap-4 md:gap-12">
                                <div className="w-24 md:w-32">
                                    <img
                                        src={boxSize.src}
                                        title="Box Size"
                                        alt="Box Size"
                                        className="w-full h-auto"
                                        loading="lazy"
                                    />
                                </div>
                                <ul className="space-y-2 md:space-y-4" id="product-dimensions">
                                    <li className="flex items-center gap-2">
                                        <span className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold">H</span>
                                        Alto - {producto.dimensiones.alto} cm
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold">L</span>
                                        Largo - {producto.dimensiones.largo} cm
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold">A</span>
                                        Ancho - {producto.dimensiones.ancho} cm
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <button
                            id="btnQuotationDetail"
                            className="w-full bg-teal-500 text-white py-4 rounded-full font-bold text-xl hover:bg-teal-600 transition cursor-pointer"
                        >
                            COTIZACIÓN
                        </button>
                    </div>
                </div>

                {/* -------------------- PRODUCTOS SIMILARES -------------------- */}
                <div className="mt-8 md:mt-12">
                    <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-teal-500">
                        PRODUCTOS SIMILARES
                    </h2>
                    <div
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6"
                        id="related-products-container"
                    >
                        {
                            producto?.productos_relacionados?.map((related) => (
                                <a
                                    href={`/productos/${related.link}`}
                                    className="group cursor-pointer"
                                    title={`Ver detalles de ${producto.titulo}`}
                                >
                                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-2">
                                        <img
                                            src={`${config.apiUrl}${related.imagenes?.[0]?.url_imagen || "/placeholder.png"}`}
                                            alt={related.nombre}
                                            title={related.nombre}
                                            className="w-full h-full object-cover group-hover:scale-105 transition"
                                            loading="lazy"
                                        />
                                    </div>
                                    <h3 className="text-center font-bold text-xs md:text-sm">
                                        {related.nombre}
                                    </h3>
                                </a>
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductPage