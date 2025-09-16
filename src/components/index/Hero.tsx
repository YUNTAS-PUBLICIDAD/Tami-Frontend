"use client";

import heroArray from "@data/hero.data";
import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const Hero = () => {

  function moveToBienvenida() {
    const element = document.getElementById("bienvenida");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <section
      className="relative w-full min-h-screen aspect-[16/9] md:aspect-[21/9] overflow-hidden"
      aria-label="Hero carousel"
    >
      <Carousel
        plugins={[
          Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: false })
        ]}
        opts={{ loop: true }}
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        <CarouselContent>
          {heroArray.map((hero, index) => {

            return (
              <CarouselItem key={index} className="w-full h-screen relative">
                <img
                  src={hero.imageDesktop}
                  srcSet={`${hero.imageMobile} 750w, ${hero.imageDesktop} 1200w`}
                  sizes="100vw"
                  alt={hero.alt || ""}
                  loading={index === 0 ? "eager" : "lazy"}
                  fetchPriority={index === 0 ? "high" : "auto"}
                  className="w-full h-full object-cover object-center"
                  role="img"
                />

                <div className="absolute inset-0 gradient-hero md:block pt-20 px-8 lg:pl-32 z-10 bg-gradient-to-b from-teal-700/75 to-black/75 h-full content-center">
                  <h1
                    className="select-none mb-8 xl:mb-12 2xl:mb-16 text-white text-3xl md:text-5xl lg:text-7xl 2xl:text-7xl leading-tight font-extrabold whitespace-pre-line transform-none"
                    aria-live="polite"
                  >
                    {hero.title}
                  </h1>

                  {hero.items && (
                    <ul className="mt-3 md:mt-8">
                      {hero.items.map((item, index) => (
                        <li key={index} className="text-sm md:text-lg text-white">
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}

                  <button
                    onClick={moveToBienvenida}
                    className="pointer-events-auto cursor-pointer bg-white rounded-3xl border-2 border-slate-300 font-bold text-teal-700 hover:text-white hover:bg-gradient-to-t hover:from-teal-600 hover:to-teal-800 px-4 py-3 lg:px-6 lg:py-2 2xl:px-10 2xl:py-4 text-lg lg:text-xl xl:text-2xl 2xl:text-3xl mt-8 w-fit"
                    aria-label="Descubre más sobre la bienvenida"
                  >
                    Descubre más
                  </button>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>
    </section>
  );
};

export default Hero;