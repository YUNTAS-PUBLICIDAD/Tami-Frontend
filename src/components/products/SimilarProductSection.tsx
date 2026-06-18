import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import SimilarProductCard from './SimilarProductCard';
import type Producto from '../../models/Product';

interface Props {
    products: Producto[];
}

const SimilarProductsSection: React.FC<Props> = ({ products }) => {
    const carouselThreshold = 3;

    if (!products || products.length === 0) return null;

    return (
        <div className="bg-gradient-to-b from-[#015e81] to-[#011821] py-12 md:py-16 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <h2 className="text-3xl md:text-4xl font-extrabold text-white text-center mb-10">
                    PRODUCTOS SIMILARES
                </h2>

                <div className="relative">
                    <div className="absolute top-0 left-0 w-20 md:w-1/6 lg:w-1/5 h-full bg-gradient-to-r from-[#1e5970] to-transparent z-10 pointer-events-none" aria-hidden="true" />
                    <div className="absolute top-0 right-0 w-20 md:w-1/6 lg:w-1/5 h-full bg-gradient-to-l from-[#1e5970] to-transparent z-10 pointer-events-none" aria-hidden="true" />

                    {products.length > carouselThreshold ? (
                        <Swiper
                            modules={[Pagination, Autoplay]}
                            spaceBetween={24}
                            slidesPerView={1}
                            pagination={{
                                clickable: true,
                                bulletClass: 'swiper-pagination-bullet-custom',
                                bulletActiveClass: 'swiper-pagination-bullet-active-custom'
                            }}
                            loop={products.length > 3}
                            speed={700}
                            observer={true}
                            observeSlideChildren={true}
                            breakpoints={{
                                640: { slidesPerView: 2 },
                                1024: { slidesPerView: 3 },
                            }}
                            autoplay={{ delay: 2000, disableOnInteraction: false }}
                            className="w-full pb-10"
                        >
                            {products.map((related) => (
                                <SwiperSlide key={related.id} className="h-auto">
                                    <SimilarProductCard product={related} />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map((related) => (
                                <SimilarProductCard key={related.id} product={related} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SimilarProductsSection;