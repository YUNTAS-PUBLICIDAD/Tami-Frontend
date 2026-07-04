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
    producto?: Producto
}

const ProductPage: React.FC<Props> = ({ producto: initialProducto }) => {
    const [producto, setProducto] = useState<Producto | null>(initialProducto || null);
    const [loading, setLoading] = useState<boolean>(!initialProducto);
    const [productViewer, setProductViewer] = useState<string>(initialProducto?.imagenes?.[0]?.url_imagen ?? '/placeholder.png');

    const productTitleParts = (producto?.titulo || '').trim().split(/\s+/).filter(Boolean);
    const productTitleFirstWord = productTitleParts[0] || '';
    const productTitleRest = productTitleParts.slice(1).join(' ');

    const detailTitleColor = producto?.detalle_titulo_color || producto?.etiqueta?.titulo_detalle_producto_color || '#015f86';
    const detailTitleSize = Number(producto?.detalle_titulo_tamano || producto?.etiqueta?.titulo_detalle_producto_size || 24);
    const rawDetailTitleStyle = producto?.detalle_titulo_estilo || producto?.etiqueta?.titulo_detalle_producto_style || 'negrita';

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

    // Cargar datos del producto (iniciales o frescos)
    useEffect(() => {
        const fetchProductData = async () => {
            let productLink = initialProducto?.link;
            
            if (!productLink) {
                const params = new URLSearchParams(window.location.search);
                productLink = params.get('link')?.trim();
            }

            if (!productLink) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${config.apiUrl.replace(/\/$/, "")}/api/v1/productos/link/${productLink}`);
                if (response.ok) {
                    const freshData = await response.json();
                    setProducto(freshData.data);
                    setProductViewer(freshData.data.imagenes?.[0]?.url_imagen ?? '/placeholder.png');
                    window.__detalleProducto = freshData.data;
                }
            } catch (error) {
                console.error('Error al cargar datos del producto:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProductData();
    }, [initialProducto?.link]);

    useEffect(() => {
        if (producto) {
            setProductViewer(producto.imagenes?.[0]?.url_imagen ?? '/placeholder.png');
            insertJsonLd("product", producto);
            window.__detalleProducto = producto;

            // Actualizar SEO dinámico en el cliente
            document.title = producto.etiqueta?.meta_titulo || producto.titulo;
            let metaDescription = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
            if (!metaDescription) {
                const meta = document.createElement("meta");
                meta.name = "description";
                document.head.appendChild(meta);
                metaDescription = meta;
            }
            metaDescription.setAttribute("content", producto.etiqueta?.meta_descripcion || producto.descripcion || "Descripción por defecto");

            let metaKeywords = document.querySelector('meta[name="keywords"]') as HTMLMetaElement | null;
            if (!metaKeywords) {
                const meta = document.createElement("meta");
                meta.name = "keywords";
                document.head.appendChild(meta);
                metaKeywords = meta;
            }
            metaKeywords.setAttribute("content", producto.etiqueta?.keywords || "");

            let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
            if (!canonicalLink) {
                const link = document.createElement("link");
                link.rel = "canonical";
                document.head.appendChild(link);
                canonicalLink = link;
            }
            canonicalLink.setAttribute("href", window.location.href);
        }
    }, [producto]);

    if (loading) {
        return (
            <div className="w-full min-h-screen bg-gradient-to-r from-[#041119] to-[#003d56] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#00b6ff]"></div>
                    <p className="text-white text-lg font-semibold animate-pulse">Cargando detalles del producto...</p>
                </div>
            </div>
        );
    }

    if (!producto) {
        return (
            <div className="w-full min-h-screen bg-gradient-to-r from-[#041119] to-[#003d56] flex items-center justify-center text-center px-4">
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl max-w-md border border-red-200">
                    <h2 className="text-3xl font-bold text-red-600 mb-4">Producto no encontrado</h2>
                    <p className="text-gray-600 mb-8">No pudimos encontrar el producto solicitado. Por favor verifica la URL.</p>
                    <a href="/catalogo-maquinarias" className="bg-[#00b6ff] text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:brightness-115 transition">
                        Volver al catálogo
                    </a>
                </div>
            </div>
        );
    }

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
                            {/* 1. CARACTERÍSTICAS (DESCRIPCIÓN) */}
                            <div className="mb-10 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                <h2 className="text-[#015f86] font-extrabold text-2xl mb-4 border-b border-gray-100 pb-3 flex items-center gap-2">
                                    <svg className="w-6 h-6 text-[#015f86]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    Características de {producto.nombre.toLowerCase()}
                                </h2>
                                <div
                                    className="text-gray-600 text-base leading-relaxed break-words [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6"
                                    dangerouslySetInnerHTML={{
                                        __html: producto.descripcion ?? "",
                                    }}
                                />
                            </div>

                            {/* 2. ¿POR QUÉ ELEGIRNOS? */}
                            <div className="mb-10 bg-teal-50/40 p-6 rounded-2xl border border-teal-100 shadow-sm">
                                <h2 className="text-[#015f86] font-extrabold text-2xl mb-3 flex items-center gap-2">
                                    <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    ¿Por qué elegirnos?
                                </h2>
                                <h3 className="text-gray-500 font-medium text-sm mb-3 italic">
                                    Calidad garantizada, innovación tecnológica y soporte de confianza
                                </h3>
                                <div
                                    className="text-gray-600 text-base leading-relaxed break-words [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6"
                                    dangerouslySetInnerHTML={{
                                        __html: producto.porque_elegirnos ?? "",
                                    }}
                                />
                            </div>

                            {/* 3. ESPECIFICACIONES Y DIMENSIONES */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                        ⚙️ Especificaciones técnicas
                                    </h2>
                                    <h3 className="text-gray-500 font-medium text-xs mb-4 italic">
                                        {(producto as any).especificaciones_subtitulo || "Máximo rendimiento y automatización industrial"}
                                    </h3>

                                    <div className="border border-gray-150 rounded-xl overflow-hidden shadow-sm bg-white">
                                        <table className="w-full text-left border-collapse">
                                            <tbody>
                                                {producto.especificaciones?.map((spec, index) => {
                                                    const separatorIndex = spec.valor.indexOf(':');
                                                    let key = spec.valor;
                                                    let val = '';
                                                    if (separatorIndex !== -1) {
                                                        key = spec.valor.substring(0, separatorIndex).trim();
                                                        val = spec.valor.substring(separatorIndex + 1).trim();
                                                    }

                                                    return (
                                                        <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                                                            <td className="px-4 py-3 text-sm font-semibold text-gray-800 border-b border-gray-100">{key}</td>
                                                            <td className="px-4 py-3 text-sm text-gray-600 border-b border-gray-100">{val}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="flex flex-col">
                                    <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                        📦 Dimensiones
                                    </h2>
                                    <h3 className="text-gray-500 font-medium text-xs mb-4 italic">
                                        Medidas oficiales del empaque
                                    </h3>

                                    <div className="flex items-center gap-6 bg-gray-50 p-4 rounded-xl border border-gray-200 flex-1">
                                        <div className="w-16 flex-shrink-0 bg-white p-2.5 rounded-xl shadow-sm border border-gray-150">
                                            <img src={boxSize.src} title="Dimensiones" alt="Dimensiones" className="w-full h-auto" loading="lazy" />
                                        </div>
                                        <div className="grid grid-cols-1 gap-2 flex-1">
                                            {producto.dimensiones?.alto && (
                                                <div className="flex justify-between text-sm border-b pb-1">
                                                    <span className="text-gray-500 font-medium">Alto:</span>
                                                    <span className="font-bold text-[#015f86]">{producto.dimensiones.alto} cm</span>
                                                </div>
                                            )}
                                            {producto.dimensiones?.largo && (
                                                <div className="flex justify-between text-sm border-b pb-1">
                                                    <span className="text-gray-500 font-medium">Largo:</span>
                                                    <span className="font-bold text-[#015f86]">{producto.dimensiones.largo} cm</span>
                                                </div>
                                            )}
                                            {producto.dimensiones?.ancho && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500 font-medium">Ancho:</span>
                                                    <span className="font-bold text-[#015f86]">{producto.dimensiones.ancho} cm</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
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