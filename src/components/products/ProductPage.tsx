import React, { useEffect, useState } from 'react'
import boxSize from "@icons/box-size.svg";
import ArrowProducts from "../../assets/icons/flecha-product.svg";
import type Producto from '../../models/Product'
import { insertJsonLd } from "../../utils/schema-markup-generator";
import { config } from '../../../config';
import RelatedBlogs from './RelatedBlogs';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';

import SimilarProductCard from './SimilarProductCard';
import SimilarProductsSection from './SimilarProductSection';

declare global {
    interface Window {
        __detalleProducto?: any;
    }
}

interface Props {
    producto: Producto
}

const ProductPage: React.FC<Props> = ({ producto: initialProducto }) => {
    const [producto, setProducto] = useState<Producto>(initialProducto);
    const [productViewer, setProductViewer] = useState<string>(producto.imagenes?.[0]?.url_imagen ?? '/placeholder.png');

    const productTitleParts = (producto.titulo || '').trim().split(/\s+/).filter(Boolean);
    const productTitleFirstWord = productTitleParts[0] || '';
    const productTitleRest = productTitleParts.slice(1).join(' ');

    const detailTitleColor = producto.detalle_titulo_color || producto.etiqueta?.titulo_detalle_producto_color || '#2DCCFF';
    const detailTitleSize = Number(producto.detalle_titulo_tamano || producto.etiqueta?.titulo_detalle_producto_size || 24);
    const rawDetailTitleStyle = producto.detalle_titulo_estilo || producto.etiqueta?.titulo_detalle_producto_style || 'negrita';

    const normalizedDetailTitleStyle = (() => {
        switch (rawDetailTitleStyle) {
            case 'normal':
                return 'normal';
            case 'negrita':
            case 'bold':
                return 'bold';
            case 'cursiva':
            case 'italic':
                return 'italic';
            case 'subrayado':
            case 'underline':
                return 'underline';
            case 'negrita_cursiva':
            case 'bold-italic':
                return 'bold-italic';
            default:
                return 'normal';
        }
    })();

    const detalleProductoTituloStyle: React.CSSProperties = {
        color: detailTitleColor,
        fontWeight: normalizedDetailTitleStyle === 'bold-italic' || normalizedDetailTitleStyle === 'bold' ? 800 : 600,
        fontStyle: normalizedDetailTitleStyle === 'italic' || normalizedDetailTitleStyle === 'bold-italic' ? 'italic' : 'normal',
        textDecoration: normalizedDetailTitleStyle === 'underline' ? 'underline' : 'none',
        ...(normalizedDetailTitleStyle === 'underline' && {
            textDecorationColor: 'white',
            textDecorationThickness: '2px',
            textUnderlineOffset: '4px'
        })
    };

    // Cargar datos frescos del producto
    useEffect(() => {
        const fetchFreshProductData = async () => {
            try {
                const response = await fetch(`${config.apiUrl.replace(/\/$/, "")}/api/v1/productos/link/${initialProducto.link}`);
                if (response.ok) {
                    const freshData = await response.json();
                    setProducto(freshData.data);
                    setProductViewer(freshData.data.imagenes?.[0]?.url_imagen ?? '/placeholder.png');
                    window.__detalleProducto = freshData.data;
                }
            } catch (error) {
                console.error('Error al cargar datos frescos del producto:', error);
            }
        };

        fetchFreshProductData();
    }, [initialProducto.link]);

    useEffect(() => {
        setProductViewer(producto.imagenes?.[0]?.url_imagen ?? '/placeholder.png');
        insertJsonLd("product", producto);
        window.__detalleProducto = producto;
    }, [producto]);

    const getDimensionBgColor = (letter: string) => {
        return 'bg-[#00b6ff]';
    };

    const getFullImageUrl = (url: string) => {
        if (!url || url === '/placeholder.png') return '/placeholder.png';
        if (url.startsWith('http')) return url;
        return `${config.apiUrl}${url}`;
    };

    const handleWhatsAppClick = () => {
        const phoneNumber = "51978883199";
        const productName = producto.titulo;
        const whatsappConfig = producto.producto_imagenes?.find(img => img.tipo === 'whatsapp');

        let message = "";
        if (whatsappConfig?.whatsapp_mensaje) {
            message = whatsappConfig.whatsapp_mensaje;
        } else {
            message += `Hola 👋, estoy interesado en el producto: *${productName}* ⚡.`;
            message += `\nDescripción: ${producto.descripcion}`;
            message += `\n👉 ¿Podrían enviarme la ficha técnica completa y una cotización personalizada?`;
        }

        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="w-full bg-gray-50">
            <style>{`
                .detalle-producto-titulo-desktop {
                    --detalle-titulo-size: ${detailTitleSize}px;
                }
                @media (min-width: 768px) {
                    .detalle-producto-titulo-desktop {
                        font-size: var(--detalle-titulo-size) !important;
                    }
                }
            `}</style>
            
            {/* -------------------- HERO Section (H1) -------------------- */}
            <div className="
                    relative pt-32 md:pt-40 pb-20 min-h-screen 
                    text-white overflow-hidden flex items-center
                    bg-gradient-to-r from-[#041119] to-[#003d56] 
                ">
                <div className="w-full pl-15 pr-13 md:pl-20 z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="flex flex-col justify-center text-left">
                        {/* H1 Semántico Perfecto */}
                        <h1 className="text-4xl md:text-6xl font-extrabold uppercase mb-6 break-words detalle-producto-titulo-desktop" style={detalleProductoTituloStyle}>
                            <span className="block text-white">{productTitleFirstWord}</span>
                            {productTitleRest && (
                                <span className="block" style={{ color: detailTitleColor }}>
                                    {productTitleRest}
                                </span>
                            )}
                        </h1>

                        <p className="text-lg md:text-2xl opacity-90 mb-10 max-full uppercase tracking-wider font-light break-words">
                            {producto.subtitulo}
                        </p>

                        <button
                            id="btnQuotationHero"
                            className="w-fit bg-[#00b6ff] text-white px-10 py-3 rounded-lg font-bold text-lg uppercase shadow-lg border border-white transform transition-all duration-150 ease-in-out hover:brightness-110 active:brightness-95"
                            onClick={handleWhatsAppClick}
                        >
                            ¡Cotízalo!
                        </button>
                    </div>

                    <div className="relative flex items-center justify-center w-full h-full">
                        <div className="relative w-[90%] aspect-square flex items-center justify-center rounded-full bg-white shadow-2xl overflow-hidden">
                            <img
                                src={getFullImageUrl(producto.imagenes?.[0]?.url_imagen ?? '/placeholder.png')}
                                alt={producto.nombre}
                                title={producto.nombre}
                                className="w-full h-full object-contain object-center"
                                fetchPriority="high"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* -------------------- MAIN PRODUCT DETAILS Section -------------------- */}
            <div className="max-w-full mx-auto px-4 md:px-8 py-20 -mt-full relative z-20">
                <div className="bg-white rounded-3xl shadow-2xl shadow-cyan-100 p-8 md:p-12 border border-gray-400">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                        
                        {/* Visor de imágenes */}
                        <div className="flex flex-col items-center">
                            <div className="w-full max-w-[600px] aspect-square shadow-xl bg-white rounded-2xl overflow-hidden flex items-center justify-center border-2 border-gray-200 mb-6 p-4">
                                <img
                                    title={producto.nombre}
                                    src={getFullImageUrl(productViewer)}
                                    alt={producto.titulo}
                                    className="w-full h-full object-contain"
                                    loading="lazy"
                                />
                            </div>
                            <div className="grid grid-cols-4 gap-4 w-full max-w-xl">
                                {producto.imagenes?.slice(1, 5).map((image) => (
                                    <div
                                        key={image.url_imagen}
                                        className={`aspect-square bg-white rounded-xl overflow-hidden shadow-xl cursor-pointer flex items-center justify-center p-2 border-2 ${image.url_imagen === productViewer ? 'border-blue-500' : 'border-gray-200'} transition-all duration-300`}
                                        onClick={() => setProductViewer(image.url_imagen)}
                                    >
                                        <img
                                            title={image.texto_alt_SEO || producto.nombre}
                                            src={getFullImageUrl(image.url_imagen)}
                                            alt={image.texto_alt_SEO || `Vista de ${producto.nombre}`}
                                            className="w-full h-full object-contain"
                                            loading="lazy"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Contenido Técnico y Descriptivo Estructurado para SEO */}
                        <div>
                            {/* Mantenemos el diseño visual superior idéntico, pero usando un DIV para no duplicar ni interferir en la jerarquía H2 */}
                            <details className="border rounded-xl bg-[#FFFFFF] shadow-sm group mt-8">
                                <summary className="flex items-center justify-between cursor-pointer px-6 py-4 list-none [&::-webkit-details-marker]:hidden">
                                    <h2 className="text-[#015f86] font-extrabold text-xl md:text-2xl m-0">
                                        Descripcion del producto
                                    </h2>
                                    <svg
                                    className="w-5 h-5 transition-transform duration-300 group-open:rotate-180"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24">
                                        <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                        />
                                    </svg>

                                </summary>
                            {/* 1. DESCRIPCIÓN - texto suelto, sin dropdown */}
                            <div
                                className="text-gray-600 text-base leading-relaxed break-words [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 ml-6"
                                dangerouslySetInnerHTML={{
                                        __html: producto.descripcion ?? "",
                                    }}
                                />
                            </details>
                            {/*2. JUNTAMOS LAS ESPECIFICACIONES CON LAS DIMENSIONES */}
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 bg-[#F0F0F0] p-5">
                            <div>
                                <h2 className="font-semibold text-base text-gray-800 mb-3">
                                Especificaciones técnicas
                                </h2>

                                <h3 className="text-gray-500 font-medium text-sm md:text-base mb-3 italic">
                                {(producto as any).especificaciones_subtitulo || "Máximo rendimiento, estabilidad y automatización industrial"}
                                </h3>

                                <div className="w-full flex flex-col overflow-hidden">
                                {producto.especificaciones?.map((spec, index) => {
                                    const separatorIndex = spec.valor.indexOf(':');
                                    let key = spec.valor;
                                    let val = '';

                                    if (separatorIndex !== -1) {
                                    key = spec.valor.substring(0, separatorIndex).trim();
                                    val = spec.valor.substring(separatorIndex + 1).trim();
                                    }

                                    return (
                                    <div
                                        key={index}
                                        className={`flex flex-col py-3 px-4 rounded ${index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}`}
                                    >
                                        <span className="font-semibold text-gray-800 text-sm">{key}</span>
                                        <span className="text-gray-600 text-sm">{val}</span>
                                    </div>
                                    );
                                })}
                                </div>
                            </div>

                            <div>
                                <h2 className="font-semibold text-base text-gray-800 mb-3">
                                Dimensiones del producto
                                </h2>

                                <h3 className="text-gray-500 font-medium text-sm md:text-base mb-4 italic">
                                Alto, largo y ancho
                                </h3>

                                <div className="flex items-center gap-8">
                                <div className="w-24 md:w-32 flex-shrink-0">
                                    <img src={boxSize.src} title="Box Size" alt="Box Size" className="w-full h-auto" loading="lazy" />
                                </div>

                                <ul className="space-y-3">
                                    {producto.dimensiones?.alto && <li>Alto - {producto.dimensiones.alto} cm</li>}
                                    {producto.dimensiones?.largo && <li>Largo - {producto.dimensiones.largo} cm</li>}
                                    {producto.dimensiones?.ancho && <li>Ancho - {producto.dimensiones.ancho} cm</li>}
                                </ul>
                                </div>
                            </div>
                            </div>
                                {/* 4. SECCIÓN ¿POR QUÉ ELEGIRNOS? */}
                            <details className="border rounded-xl bg-[#FFFFFF] shadow-sm group mt-8">

                                <summary className="flex items-center justify-between cursor-pointer px-6 py-4 list-none [&::-webkit-details-marker]:hidden">
                                    <h2 className="text-[#015f86] font-extrabold text-xl md:text-2xl m-0">
                                        ¿Por qué elegirnos?
                                    </h2>
                                    <svg
                                    className="w-5 h-5 transition-transform duration-300 group-open:rotate-180"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24">
                                        <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                        />
                                    </svg>

                                </summary>
                                <div className="px-6 pb-6 pt-2 max-h-[280px] overflow-y-auto pr-2">
                                    <h3 className="text-gray-500 font-medium text-sm md:text-base mb-3 italic">
                                        Calidad garantizada, innovación tecnológica y soporte de confianza
                                    </h3>

                                    <div
                                        className="text-gray-600 text-base leading-relaxed break-words [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6"
                                        dangerouslySetInnerHTML={{
                                        __html: producto.porque_elegirnos ?? "",
                                        }}
                                    />
                                </div>
                            </details>
                            </div>
                        </div>
                    </div>
                </div>

            {/* ---------------------- SECCIÓN DE BLOG (H2) ------------------------------- */}
            <div className="max-w-full mx-auto px-4 md:px-8 py-4">
                {/* RelatedBlogs gestiona solo su <h2>Blog del producto</h2> */}
                <RelatedBlogs productId={producto.id} />
            </div>

            {/* -------------------- PRODUCTOS SIMILARES Section (H2) -------------------- */}
            <div className="max-w-full mx-auto px-4 md:px-8 py-8">
                <SimilarProductsSection
                    products={producto.productos_relacionados || []}
                />
            </div>
        </div>
    );
};

export default ProductPage;