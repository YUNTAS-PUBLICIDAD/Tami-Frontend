import { useState } from "react";
import fondoSlider from "@images/products/fondo_productos_slider.webp";
import heroProductsArray from "@data/heroProducts.data";
// import FlechaButton from "./FlechaButton";

const HeroProducts = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % heroProductsArray.length);
  };

  const handlePrev = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + heroProductsArray.length) % heroProductsArray.length
    );
  };

  return (
    <>
      <section
        className="flex flex-col items-center justify-between relative 
           bg-no-repeat bg-top sm:bg-cover
           min-h-[230px] sm:min-h-screen w-full pb-10 sm:pb-20"
        style={{
          backgroundImage:
            currentSlide === 0
              ? `linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(4,4,4,0.5) 100%), url(${heroProductsArray[0].image})`
              : `linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(4,4,4,0.5) 100%), url(${fondoSlider.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center top",

        }}
      >

        <div className="absolute inset-0 backdrop-blur-xs"></div>
        <div className="w-full h-11/12 pt-20 grid grid-rows-1 grid-cols-2 lg:grid-cols-12 items-center z-10">
          <button
            onClick={handlePrev}
            className="hidden sm:block text-slate-300 lg:hover:text-white transition-colors w-9 lg:w-20 2xl:w-32 h-fit cursor-pointer"
          >
            {/* <FlechaButton direccion="left" /> */}
          </button>

          <div
            className={`absolute inset-0 z-20 flex items-center justify-center text-white px-4 ${currentSlide !== 0 ? "text-start lg:col-span-5" : "text-center"
              }`}
          >

            <div>
              <p className="sm:text-xl md:text-2xl xl:text-3xl 2xl:text-4xl pb-4 font-light">
                {heroProductsArray[currentSlide].subTitulo1}
              </p>
              <h1 className="text-lg sm:text-xl md:text-4xl lg:text-5xl xl:text-6xl pb-4 2xl:text-6xl font-extrabold whitespace-pre-line">
                {heroProductsArray[currentSlide].title}
              </h1>
              <h2 className="sm:text-xl md:text-2xl xl:text-3xl 2xl:text-4xl pr-12 font-semibold">
                {heroProductsArray[currentSlide].subTitulo2}
              </h2>
            </div>
            {heroProductsArray[currentSlide].subTitulo2 &&
              currentSlide !== 0 &&
              heroProductsArray[currentSlide].link && (
                <a
                  href={`https://tamimaquinarias.com/productos/detalle/?link=${heroProductsArray[currentSlide].link}`}
                  className="sm:text-2xl lg:text-3xl xl:text-4xl 2xl:text-4xl mt-8 xl:mt-16 2xl:mt-20 px-6 xl:px-10 2xl:px-20 py-2 xl:py-4 2xl:py-6 bg-white text-teal-700 font-bold rounded-full shadow-md hover:text-white hover:bg-teal-900 transition-all duration-300 inline-block"
                >
                  Saber más
                </a>
              )}
          </div>
          <img
            src={`${heroProductsArray[currentSlide].image}`}
            alt={`Imagen de ${heroProductsArray[currentSlide].title}`}
            className={`${currentSlide === 0 ? "hidden" : ""
              } place-self-center pl-24 pt-12 h-1/2 sm:h-full col-span-5`}
            title={`${heroProductsArray[currentSlide].imageTitle}`}
          />
          <button
            onClick={handleNext}
            className="hidden sm:block text-slate-300 lg:hover:text-white transition-colors w-9 lg:w-20 2xl:w-32 h-fit justify-self-end"
          >
            {/* <FlechaButton direccion="right" /> */}
          </button>
        </div>
        {/* <div className="flex gap-5 h-1/12 items-center justify-center">
          {heroProductsArray.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className="w-2 h-2 lg:w-3 lg:h-3 2xl:w-4 2xl:h-4 rounded-full transition-transform duration-300 disabled:bg-white disabled:scale-150 lg:disabled:scale-125 bg-gray-400 hover:bg-gray-300"
              disabled={index === currentSlide}
            />
          ))}
        </div> */}
      </section>
    </>
  );
};

export default HeroProducts;
