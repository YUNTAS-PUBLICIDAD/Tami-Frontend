// src/components/products/RelatedBlogs.tsx

import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import type Blog from '../../models/Blog';
import { config } from '../../../config';
import CardBlog from '../blog/CardBlog';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  productId: number;
}

const RelatedBlogs: React.FC<Props> = ({ productId }) => {
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'start',
      skipSnaps: false,
      containScroll: 'trimSnaps',
    },
    [Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true })]
  );

  useEffect(() => {
    const fetchAndFilterBlogs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${config.apiUrl}${config.endpoints.blogs.list}`);
        const result = await response.json();
        const allBlogs: Blog[] = result.data || result || [];
        const filtered = allBlogs
          .filter((blog) => Number(blog.producto_id) === Number(productId))
          .sort((a, b) => {
            const dateA = new Date(a.created_at || 0).getTime();
            const dateB = new Date(b.created_at || 0).getTime();
            return dateB !== dateA ? dateB - dateA : Number(b.id) - Number(a.id);
          });

        setRelatedBlogs(filtered);
        setSelectedIndex(0);
      } catch (error) {
        console.error('Error al cargar los blogs relacionados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndFilterBlogs();
  }, [productId]);

  const onSelect = useCallback(() => {
    if (!emblaApi) {
      return;
    }
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    setScrollSnaps(emblaApi.scrollSnapList());
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }
    emblaApi.reInit();
  }, [emblaApi, relatedBlogs.length]);

  useEffect(() => {
    if (!emblaApi || relatedBlogs.length === 0) {
      return;
    }
    emblaApi.scrollTo(0);
  }, [emblaApi, productId, relatedBlogs.length]);

  const scrollPrev = useCallback(() => {
    if (!emblaApi) {
      return;
    }
    emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (!emblaApi) {
      return;
    }
    emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (!emblaApi) {
        return;
      }
      emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  if (loading || relatedBlogs.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-gray-10 py-2 lg:py-16">
      <div className="max-w-full mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 items-stretch">
          <div className="flex-grow w-full lg:w-0 px-4 md:px-8 order-2 lg:order-1">
            {relatedBlogs.length > 1 ? (
              <div className="relative overflow-visible pb-4">
                <div
                  ref={emblaRef}
                  className="overflow-hidden touch-pan-y"
                  style={{ touchAction: 'pan-y' }}
                >
                  <div className="flex">
                    {relatedBlogs.map((blog) => (
                      <div key={blog.id} className="flex-shrink-0 min-w-full w-full">
                        <div className="w-full max-w-[95vw] lg:max-w-[75vw] mx-auto  justify-center items-center h-full">
                          <CardBlog blog={blog} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={scrollPrev}
                  className="hidden lg:block absolute left-3 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/90 p-2 shadow-lg transition hover:bg-white"
                  aria-label="Anterior blog"
                >
                  <ChevronLeft className="h-5 w-5 text-[#015f86]" />
                </button>

                <button
                  type="button"
                  onClick={scrollNext}
                  className="hidden lg:block absolute right-3 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/90 p-2 shadow-lg transition hover:bg-white"
                  aria-label="Siguiente blog"
                >
                  <ChevronRight className="h-5 w-5 text-[#015f86]" />
                </button>

                <div className="absolute inset-x-0 bottom-1 flex justify-center gap-2">
                  {scrollSnaps.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => scrollTo(index)}
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        index === selectedIndex ? 'w-8 bg-[#015f86]' : 'w-2.5 bg-gray-300'
                      }`}
                      aria-label={`Ir al blog ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center h-full">
                <CardBlog blog={relatedBlogs[0]} />
              </div>
            )}
          </div>

          <div
            className="
              order-1 lg:order-2
              w-[90%] mx-auto lg:w-20 lg:mx-0 
              flex-shrink-0 
              bg-[#07625b] text-white
              flex items-center justify-center
              p-3 min-h-[55px]
              rounded-xl
              [clip-path:none]
              lg:p-6 lg:min-h-[150px]
              lg:rounded-none
              lg:[clip-path:polygon(25%_0%,_100%_0%,_100%_100%,_25%_100%,_0%_50%)]
            "
          >
            <span
              className="
                uppercase font-extrabold tracking-[.5em]
                text-lg
                [writing-mode:horizontal-tb] rotate-0
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
