import React, { useEffect, useState } from 'react'
import boxSize from "@icons/box-size.svg";
import ArrowProducts from "../../assets/icons/flecha-product.svg";
import type Producto from '../../models/Product'
import { insertJsonLd } from "../../utils/schema-markup-generator";
import { config } from 'config';
import RelatedBlogs from './RelatedBlogs';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import SimilarProductCard from './SimilarProductCard';


interface Props {
    producto: Producto
}

const ProductPage: React.FC<Props> = ({ producto }) => {
    const [productViewer, setProductViewer] = useState<string>(producto.imagenes?.[0]?.url_imagen ?? '/placeholder.png');

 
    useEffect(() => {
 
        setProductViewer(producto.imagenes?.[0]?.url_imagen ?? '/placeholder.png');
        insertJsonLd("product", producto);
    }, [producto]); 

    const getDimensionBgColor = (letter: string) => {
        if (letter === 'H') return 'bg-[#00b6ff]'; 
        if (letter === 'L') return 'bg-[#00b6ff]'; 
        if (letter === 'A') return 'bg-[#00b6ff]';   
        return 'bg-[#00b6ff]';
    };

    const relatedProducts = producto.productos_relacionados || [];
    const carouselThreshold = 3;
   const handleWhatsAppClick = () => {

        const phoneNumber = "51978883199"; 
        const productName = producto.titulo; 
        
        const whatsappConfig = producto.producto_imagenes?.find(img => img.tipo === 'whatsapp');

        let message = "";
        if (whatsappConfig?.whatsapp_mensaje){
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
        <div className="w-full bg-gray-50"> {/* Fondo general gris claro */}
            {/* -------------------- HERO Section -------------------- */}
                <div className="
                    relative pt-32 md:pt-40 pb-20 min-h-screen 
                    text-white overflow-hidden flex items-center
                    bg-gradient-to-r from-[#041119] to-[#003d56] 
                ">
                    <div className="w-full px-4 md:px-8 z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">                    
                   
                    <div className="flex flex-col justify-center text-left">
                        <h1 className="text-5xl md:text-8xl font-extrabold uppercase mb-6">
                        {producto.titulo.split(' ')[0]}
                        <span className="block text-[#2DCCFF]">{producto.titulo.split(' ').slice(1).join(' ')}</span>
                        </h1>

                        <p className="text-xl md:text-4xl opacity-90 mb-10 max-full uppercase tracking-wider font-light">
                        {producto.subtitulo}
                        </p>

                        <button
                        id="btnQuotationHero"
                        className="w-fit
                            bg-[#00b6ff] text-white 
                            px-10 py-3 rounded-lg
                            font-bold text-lg uppercase 
                            shadow-lg 
                            border border-white
                            transform transition-all duration-150 ease-in-out
                            hover:brightness-110 
                            active:brightness-95"
                            onClick={handleWhatsAppClick} 
                        >
                        ¡Cotízalo!
                        </button>
                    </div>

                    <div className="relative flex items-center justify-center h-full w-full">
                        
                        <div className="relative w-[90%] aspect-square">
                        
                        <div className="absolute inset-0 bg-white rounded-full shadow-2xl" />
                        
                        <img
                            src={`${config.apiUrl}${producto.imagenes?.[0]?.url_imagen ?? '/placeholder.png'}`}
                            alt={producto.nombre}
                            title={producto.nombre}
                            className="relative w-full h-full object-contain"
                            fetchPriority="high"
                        />
                        </div>
                    </div>
                    
                    </div>
                </div>

            {/* -------------------- MAIN PRODUCT DETAILS Section -------------------- */}
                <div className="max-w-full mx-auto px-4 md:px-8 py-20 -mt-full relative z-20 ">
                    <div className="bg-white rounded-3xl shadow-2xl shadow-cyan-100 p-8 md:p-12 border border-gray-400 ">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                            <div className="flex flex-col items-center">
                                <div className="w-full max-w-[600px] aspect-square shadow-xl bg-white rounded-2xl overflow-hidden flex items-center justify-center border-2 border-gray-200 mb-6 p-4">
                                    <img
                                        title={producto.nombre}
                                        src={`${config.apiUrl}${productViewer}`}
                                        alt={producto.titulo}
                                        className="w-full h-full object-contain"
                                        loading="lazy"
                                    />
                                </div>
                                <div className="grid grid-cols-4 gap-4 w-full max-w-xl">
                                    {producto.imagenes?.slice(1, 5).map((image) => (
                                        <div
                                            key={image.url_imagen}
                                            className={`aspect-square  bg-white rounded-xl overflow-hidden shadow-xl cursor-pointer flex items-center justify-center p-2 border-2 ${image.url_imagen === productViewer ? 'border-blue-500' : 'border-gray-200'} transition-all duration-300`}
                                            onClick={() => setProductViewer(image.url_imagen)}
                                        >
                                            <img
                                                title={image.texto_alt_SEO || producto.nombre}
                                                src={`${config.apiUrl}${image.url_imagen}`}
                                                alt={image.texto_alt_SEO || `Vista de ${producto.nombre}`}
                                                className="w-full h-full object-contain"
                                                loading="lazy"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div >
                                <h2 className="text-center text-3xl md:text-5xl font-extrabold text-[#015f86] uppercase mb-4">
                                    {producto.titulo}
                                </h2>
                                
                                <div className="mb-6">
                                    <h3 className="text-center text-3xl font-bold text-[#00b6ff] mb-2">Información del producto:</h3>
                                    <p className="text-gray-600 text-base leading-relaxed">
                                        {producto.descripcion}
                                    </p>
                                </div>

                                <div className="bg-gray-100  rounded-xl p-6 mb-8 border border-gray-200">
                                    <h3 className="font-bold text-xl text-gray-900 mb-4">Detalles del producto</h3>
                                    
                                    <h4 className="font-semibold text-lg text-gray-800 mb-2">Especificaciones técnicas:</h4>
                                    <ul className="list-disc pl-6 space-y-2 text-gray-600 mb-6">
                                        {producto.especificaciones?.map((spec, index) => (
                                            <li key={index}>{spec.valor}</li>
                                        ))}
                                    </ul>

                                    <h4 className="font-semibold text-lg text-gray-800 mb-4">Dimensiones:</h4>
                                    <div className="flex items-center gap-8">
                                        <div className="w-24 md:w-32 flex-shrink-0">
                                            <img src={boxSize.src} title="Box Size" alt="Box Size" className="w-full h-auto" loading="lazy" />
                                        </div>
                                        <ul className="space-y-3">
                                            {producto.dimensiones?.alto && (
                                                <li className="flex items-center gap-3 text-gray-700 text-lg">
                                                    <span className={`w-8 h-8 ${getDimensionBgColor('H')} rounded-full flex items-center justify-center text-white text-base font-bold`}>H</span>
                                                    Alto - {producto.dimensiones.alto} cm
                                                </li>
                                            )}
                                            {producto.dimensiones?.largo && (
                                                <li className="flex items-center gap-3 text-gray-700 text-lg">
                                                    <span className={`w-8 h-8 ${getDimensionBgColor('L')} rounded-full flex items-center justify-center text-white text-base font-bold`}>L</span>
                                                    Largo - {producto.dimensiones.largo} cm
                                                </li>
                                            )}
                                            {producto.dimensiones?.ancho && (
                                                <li className="flex items-center gap-3 text-gray-700 text-lg">
                                                    <span className={`w-8 h-8 ${getDimensionBgColor('A')} rounded-full flex items-center justify-center text-white text-base font-bold`}>A</span>
                                                    Ancho - {producto.dimensiones.ancho} cm
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

            {/* -------------------- SECCIÓN DE BLOG (Tecnología e Innovación) -------------------- */}
            
                <RelatedBlogs productId={producto.id} />




            {/* -------------------- PRODUCTOS SIMILARES Section -------------------- */}
            <div className="bg-gradient-to-b from-[#015e81] to-[#011821] py-12 md:py-16 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white text-center mb-10">
                    PRODUCTOS SIMILARES
                    </h2>

                    <div className="relative">
                    
                    <div 
                        className="
                        absolute top-0 left-0 
                        w-20 md:w-1/6 lg:w-1/5 h-full 
                        bg-gradient-to-r from-[#1e5970] to-transparent 
                        z-10 pointer-events-none
                        " 
                        aria-hidden="true" 
                    />
                    <div 
                        className="
                        absolute top-0 right-0 
                        w-20 md:w-1/6 lg:w-1/5 h-full 
                        bg-gradient-to-l from-[#1e5970] to-transparent 
                        z-10 pointer-events-none
                        " 
                        aria-hidden="true" 
                    />

                    {relatedProducts.length > carouselThreshold ? (
                        
                        <Swiper
                        modules={[Navigation, Pagination, Autoplay]}
                        spaceBetween={24}
                        slidesPerView={1}
                        pagination={{ 
                            clickable: true,
                            bulletClass: 'swiper-pagination-bullet-custom',
                            bulletActiveClass: 'swiper-pagination-bullet-active-custom'
                        }}
                        navigation={{
                            nextEl: '.swiper-button-next-custom',
                            prevEl: '.swiper-button-prev-custom',
                        }}
                        loop={relatedProducts.length > 3}
                        breakpoints={{
                            640: { slidesPerView: 2 },
                            1024: { slidesPerView: 3 }, 
                        }}
                        autoplay={{
                            delay: 2000, 
                            disableOnInteraction: false, 
                        }}
                        className="w-full pb-10" 
                        >
                        {relatedProducts.map((related) => (
                            <SwiperSlide key={related.id} className="h-auto">
                            <SimilarProductCard product={related} />
                            </SwiperSlide>
                        ))}
                    
                        
                        </Swiper>

                    ) : (
                        
                  
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {relatedProducts.map((related) => (
                            <SimilarProductCard key={related.id} product={related} />
                        ))}
                        </div>
                    )}
                    </div>
                </div>
                </div>
        </div>
        
    );
}

export default ProductPage;