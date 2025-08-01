import { useState, useEffect } from "react";
import heroArray from "@data/hero.data";

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTextVisible, setIsTextVisible] = useState(true);

  function moveToBienvenida() {
    document
      .getElementById("bienvenida")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTextVisible(false);
      setTimeout(() => {
        setCurrentSlide((prevIndex) => (prevIndex + 1) % heroArray.length);
        setIsTextVisible(true);
      }, 1000);
    }, 7500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-screen">
      {heroArray.map((slide, index) => (
        <img
          key={index}
          src={slide.image}
          title={slide.title}
          alt={slide.alt}
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
          loading={index === 0 ? "eager" : "lazy"}
        />
      ))}

      {/* Desktop + Tablet */}
      <div className="hidden md:block relative pt-20 px-8 lg:pl-32 z-10 bg-gradient-to-b from-teal-700/75 to-black/75 h-full content-center">
        <h1
          className={`mb-8 xl:mb-12 2xl:mb-16 text-white text-3xl md:text-5xl lg:text-7xl 2xl:text-7xl lg:leading-22 2xl:leading-24 font-extrabold whitespace-pre-line transition-all duration-1000 ${
            isTextVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          {heroArray[currentSlide].title}
        </h1>

        {heroArray[currentSlide].items && (
          <ul
            className={`mt-3 md:mt-8 transition-all duration-1000 ${
              isTextVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-5"
            }`}
          >
            {heroArray[currentSlide].items.map((item, index) => (
              <li key={index} className="text-sm md:text-lg text-white">
                {item}
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={moveToBienvenida}
          className="cursor-pointer bg-white rounded-3xl border-2 border-slate-300 
     font-bold text-teal-700 hover:text-white 
     hover:bg-gradient-to-t hover:from-teal-600 hover:to-teal-800 
     transition-all ease-in-out duration-500 
     px-4 py-3 lg:px-6 lg:py-2 2xl:px-10 2xl:py-4 
     text-lg lg:text-xl xl:text-2xl 2xl:text-3xl mt-8"
        >
          Descubre más
        </button>
      </div>

      {/* Mobile gradient overlay */}
      <div className="md:hidden absolute inset-0 z-10 bg-gradient-to-t from-transparent to-teal-800/80" />

      {/* Mobile content */}
      <div className="md:hidden bg-white absolute bottom-0 left-0 w-full h-[35vh] z-20 flex flex-col justify-center items-center px-4 text-center">
        <h1
          className={`text-teal-700 text-2xl font-extrabold mb-4 transition-all duration-1000 ${
            isTextVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-5"
          }`}
        >
          {heroArray[currentSlide].title}
        </h1>
        <button
          onClick={moveToBienvenida}
          className="bg-teal-700 text-white font-bold py-2 px-6 rounded-3xl text-lg transition-all duration-300 hover:bg-gray-100"
        >
          Descubre más
        </button>
      </div>
    </section>
  );
};

export default Hero;
