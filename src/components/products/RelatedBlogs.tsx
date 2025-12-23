// src/components/products/RelatedBlogs.tsx

import React, { useState, useEffect } from 'react';
import type Blog from '../../models/Blog';
import { config } from 'config';
import CardBlog from '../blog/CardBlog';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface Props {
  productId: number;
}

const RelatedBlogs: React.FC<Props> = ({ productId }) => {
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndFilterBlogs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${config.apiUrl}${config.endpoints.blogs.list}`);
        const result = await response.json();
        const allBlogs: Blog[] = result.data || result || [];
        const filtered = allBlogs.filter(
          blog => Number(blog.producto_id) === Number(productId)
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

  if (loading || relatedBlogs.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-gray-10 py-2 lg:py-16">
      <div className="max-w-full mx-auto">

        {/* --- CONTENEDOR BLOG + SLIDER --- */}
        <div className="flex flex-col lg:flex-row gap-8 items-stretch">

          {/* --- SLIDER (MÓVIL ABAJO | WEB IZQUIERDA) --- */}
          <div className="flex-grow w-full lg:w-0 px-4 md:px-8 order-2 lg:order-1">
            {relatedBlogs.length > 1 ? (
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={50}
                slidesPerView={1}
                navigation={{
                  nextEl: '.swiper-button-next-custom',
                  prevEl: '.swiper-button-prev-custom',
                }}
                pagination={{
                  clickable: true,
                  bulletClass: 'swiper-pagination-bullet-custom',
                  bulletActiveClass: 'swiper-pagination-bullet-active-custom'
                }}
                loop={true}
                autoplay={{
                  delay: 2000,
                  disableOnInteraction: false,
                }}
                className="w-full pb-10"
              >
                {relatedBlogs.map((blog) => (
                  <SwiperSlide key={blog.id} className="h-auto">
                    <div className="flex justify-center items-center">
                      <CardBlog blog={blog} />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <div className="flex justify-center items-center h-full">
                <CardBlog blog={relatedBlogs[0]} />
              </div>
            )}
          </div>

          {/* --- BLOG (MÓVIL ARRIBA | WEB DERECHA) --- */}
          <div
            className="
              order-1 lg:order-2
              w-[90%] mx-auto lg:w-20 lg:mx-0 
              flex-shrink-0 
              bg-[#07625b] text-white
              flex items-center justify-center

              /* MÓVIL */
              p-3 min-h-[55px]
              rounded-xl
              [clip-path:none]

              /* WEB */
              lg:p-6 lg:min-h-[150px]
              lg:rounded-none
              lg:[clip-path:polygon(25%_0%,_100%_0%,_100%_100%,_25%_100%,_0%_50%)]
            "
          >
            <span
              className="
                uppercase font-extrabold tracking-[.5em]

                /* MÓVIL */
                text-lg
                [writing-mode:horizontal-tb] rotate-0

                /* WEB */
                lg:text-4xl
                lg:[writing-mode:vertical-rl] lg:rotate-180
              "
            >
              BLOG
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RelatedBlogs;
