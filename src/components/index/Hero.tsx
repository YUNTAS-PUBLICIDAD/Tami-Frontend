import { useState, useEffect } from "react";
import heroArray from "@data/hero.data";

const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroArray.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroArray.length]);

  function moveToSectionCards() {
    const element = document.getElementById("sectionCards");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <section
      className="relative w-full min-h-screen aspect-[16/9] md:aspect-[21/9] overflow-hidden"
      aria-label="Hero carousel"
    >
      <div className="absolute inset-0 w-full h-full">
        {heroArray.map((hero, index) => {
          // Solo renderiza la imagen actual y las adyacentes para performance
          const isVisible = index === currentIndex;
          const isAdjacent =
            index === (currentIndex + 1) % heroArray.length ||
            index === (currentIndex - 1 + heroArray.length) % heroArray.length;

          if (!isVisible && !isAdjacent) {
            return null; // No renderizar imágenes muy lejanas
          }

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

      <div className="gradient-hero md:block relative pt-20 px-8 lg:pl-32 z-10 bg-gradient-to-b from-teal-700/75 to-black/75 h-full content-center">
      <div className="inline-block backdrop-blur-md bg-white/20 rounded-3xl shadow-2xl p-8 md:p-12 lg:p-16 animate-fadeInUpHero" style={{animationDuration:'1.2s'}}>
          <h1
            className="mb-8 xl:mb-12 2xl:mb-16 text-white text-3xl md:text-5xl lg:text-7xl 2xl:text-7xl leading-tight font-extrabold whitespace-pre-line transform-none drop-shadow-2xl shadow-black"
            aria-live="polite"
          >
            {heroArray[currentIndex].title}
          </h1>
          <button
            onClick={moveToSectionCards}
            className="cursor-pointer bg-white rounded-3xl border-2 border-slate-300 font-bold text-teal-700 hover:text-white hover:bg-gradient-to-t hover:from-teal-600 hover:to-teal-800 px-4 py-3 lg:px-6 lg:py-2 2xl:px-10 2xl:py-4 text-lg lg:text-xl xl:text-2xl 2xl:text-3xl mt-8 w-fit shadow-xl shadow-black hover:shadow-2xl"
            aria-label="Descubre más sobre productos destacados"
          >
            Descubre más
          </button>
        </div>
      </div>
      {/* La animación se define globalmente en index.astro */}
    </section>
  );
};

export default Hero;