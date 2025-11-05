import { useState, useEffect } from "react";
import heroArray from "@data/hero.data";

const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroArray.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="relative w-full min-h-screen flex flex-col justify-between pb-20"
      aria-label="Hero carousel"
    >
      {/* Fondo del carrusel */}
      <div className="absolute inset-0 w-full h-full">
        {heroArray.map((hero, index) => {
          const isVisible = index === currentIndex;
          const isAdjacent =
            index === (currentIndex + 1) % heroArray.length ||
            index === (currentIndex - 1 + heroArray.length) % heroArray.length;

          if (!isVisible && !isAdjacent) return null;

          return (
            <img
              key={index}
              src={hero.imageDesktop}
              srcSet={`${hero.imageMobile} 750w, ${hero.imageDesktop} 1200w`}
              sizes="100vw"
              alt={hero.alt || ""}
              title={hero.alt || ""}
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "auto"}
              className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ${
                isVisible
                  ? "opacity-100 z-10 pointer-events-auto"
                  : "opacity-0 z-0 pointer-events-none"
              }`}
              aria-hidden={isVisible ? "false" : "true"}
              role="img"
            />
          );
        })}
      </div>

      {/* Texto sobre la imagen */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center text-white px-4 sm:px-6 md:px-10 bg-gradient-to-b from-[#046A63]/40 to-[#023B37]/60">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight sm:leading-snug drop-shadow-lg max-w-[90%] sm:max-w-3xl">
          Innovación y Soluciones para cada Proyecto
        </h1>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl max-w-[90%] sm:max-w-3xl drop-shadow-md leading-relaxed">
          Calidad respaldada por nuestra garantía, mostrando nuestro compromiso
          con la satisfacción de nuestros clientes.
        </p>
      </div>

      {/* Card inferior flotante — oculto en móvil */}
      <div className="hidden sm:flex absolute bottom-0 left-0 right-0 z-40 w-full justify-center">
        <div className="bg-[#FFF8F8] backdrop-blur-sm shadow-xl rounded-xl px-4 py-3 sm:px-6 sm:py-4 md:px-16 md:py-6 mx-4 sm:mx-6 md:mx-8 text-[#00786F] font-black text-center text-xs sm:text-sm md:text-lg tracking-wide uppercase translate-y-1/2 font-inter flex flex-wrap justify-center gap-3 sm:gap-6 md:gap-12">
          <span>Negocio</span>
          <span className="hidden sm:inline-block w-px h-4 sm:h-6 bg-gray-400"></span>
          <span>Maquinarias</span>
          <span className="hidden sm:inline-block w-px h-4 sm:h-6 bg-gray-400"></span>
          <span>Decoración</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
