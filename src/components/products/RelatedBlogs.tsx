// src/components/products/RelatedBlogs.tsx

import React, { useState, useEffect, useRef } from "react";
import type Blog from "../../models/Blog";
import { config } from "config";
import CardBlog from "../blog/CardBlog";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface Props {
  productId: number;
}

const RelatedBlogs: React.FC<Props> = ({ productId }) => {
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchAndFilterBlogs = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${config.apiUrl}${config.endpoints.blogs.list}`
        );
        const result = await response.json();
        const allBlogs: Blog[] = result.data || result || [];
        const filtered = allBlogs.filter(
          (blog) => Number(blog.producto_id) === Number(productId)
        );
        setRelatedBlogs(filtered);
      } catch (error) {
        console.error("Error al cargar los blogs relacionados:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAndFilterBlogs();
  }, [productId]);

  // Autoplay para desktop
  useEffect(() => {
    if (relatedBlogs.length <= 1) return;

    const startAutoplay = () => {
      autoplayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % relatedBlogs.length);
      }, 5000);
    };

    const stopAutoplay = () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
        autoplayRef.current = null;
      }
    };

    startAutoplay();

    // Pausar autoplay cuando el usuario interactúa
    const container = document.getElementById("desktop-blogs-container");
    if (container) {
      container.addEventListener("mouseenter", stopAutoplay);
      container.addEventListener("mouseleave", startAutoplay);
    }

    return () => {
      stopAutoplay();
      if (container) {
        container.removeEventListener("mouseenter", stopAutoplay);
        container.removeEventListener("mouseleave", startAutoplay);
      }
    };
  }, [relatedBlogs.length]);

  if (loading || relatedBlogs.length === 0) {
    return null;
  }

  // Navegación manual para desktop
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    // Reiniciar autoplay
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % relatedBlogs.length);
      }, 5000);
    }
  };

  const nextSlide = () => {
    goToSlide((currentIndex + 1) % relatedBlogs.length);
  };

  const prevSlide = () => {
    goToSlide((currentIndex - 1 + relatedBlogs.length) % relatedBlogs.length);
  };

  return (
    <div className="w-full bg-gray-100 py-16">
      <div className="max-w-full mx-auto">
        <div className="flex flex-col lg:flex-row items-stretch">
          {/* Sección de blogs */}
          <div className="flex-grow w-full lg:w-4/5 px-4 md:px-8">
            {/* Versión Desktop - Blog completo con transición */}
            <div className="hidden lg:block relative">
              <div
                id="desktop-blogs-container"
                className="relative overflow-hidden"
              >
                <div
                  className="transition-transform duration-500 ease-in-out flex"
                  style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                  {relatedBlogs.map((blog, index) => (
                    <div key={blog.id} className="w-full flex-shrink-0 px-4">
                      {/* Blog completo estilo tarjeta grande */}
                      <CardBlog blog={blog} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Controles de navegación desktop */}
              {relatedBlogs.length > 1 && (
                <>
                  {/* Indicadores de paginación desktop */}
                  <div className="flex justify-center mt-8 space-x-3">
                    {relatedBlogs.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-4 h-4 rounded-full transition-all duration-300 ${
                          index === currentIndex
                            ? "bg-[#07625b] scale-125"
                            : "bg-gray-300 hover:bg-gray-400"
                        }`}
                        aria-label={`Ir al blog ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Versión Mobile - Carrusel Swiper */}
            <div className="lg:hidden">
              {relatedBlogs.length > 1 ? (
                <Swiper
                  modules={[Navigation, Pagination, Autoplay]}
                  spaceBetween={20}
                  slidesPerView={1}
                  navigation={{
                    nextEl: ".swiper-button-next-mobile",
                    prevEl: ".swiper-button-prev-mobile",
                  }}
                  pagination={{
                    clickable: true,
                    dynamicBullets: true,
                  }}
                  autoplay={{
                    delay: 5000,
                    disableOnInteraction: false,
                  }}
                  loop={true}
                  className="w-full pb-12 mobile-blogs-swiper"
                >
                  {relatedBlogs.map((blog) => (
                    <SwiperSlide key={blog.id}>
                      <CardBlog blog={blog} />
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : (
                <CardBlog blog={relatedBlogs[0]} />
              )}
            </div>
          </div>

          {/* Banda lateral "BLOG" */}
          <div
            className="max-w-[1000px] lg:w-20 flex-shrink-0 
              bg-[#07625b] text-white 
              lg:[clip-path:polygon(25%_0%,_100%_0%,_100%_100%,_25%_100%,_0%_50%)]
              [clip-path:polygon(0%_0%,_100%_0%,_100%_75%,_50%_100%,_0%_75%)]
              flex items-center justify-center
              p-4 min-h-[130px]
              order-first lg:order-last"
          >
            <span
              className="w-full text-center text-4xl font-extrabold uppercase 
                lg:[writing-mode:vertical-rl] lg:transform lg:rotate-180 
                tracking-[.5em] lg:tracking-[.5em] leading-none"
            >
              BLOG
            </span>
          </div>
        </div>
      </div>

      {/* Estilos para la paginación de Swiper mobile */}
      <style>{`
        .mobile-blogs-swiper .swiper-pagination-bullet {
          background: #07625b;
          opacity: 0.5;
          width: 10px;
          height: 10px;
          margin: 0 6px;
        }
        .mobile-blogs-swiper .swiper-pagination-bullet-active {
          opacity: 50;
          background: #07625b;
        }
        .mobile-blogs-swiper .swiper-pagination {
          position: relative;
          margin-top: 10px;
        }
      `}</style>
    </div>
  );
};

export default RelatedBlogs;
