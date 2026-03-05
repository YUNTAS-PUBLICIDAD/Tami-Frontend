import { useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import heroArray from "@data/hero.data";

const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroArray.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Variantes para el texto
  const textVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: (customDelay: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: customDelay, duration: 0.8, ease: "easeOut" }
    }),
  };

  return (
    <section
      className="relative w-full min-h-[410px] sm:min-h-screen flex flex-col justify-between pb-10 sm:pb-20"
      aria-label="Hero carousel"
    >

      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentIndex}
            className="absolute inset-0 w-full h-full"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
          >
            <img
              src={heroArray[currentIndex].imageDesktop}
              srcSet={`${heroArray[currentIndex].imageMobile} 750w, ${heroArray[currentIndex].imageDesktop} 1200w`}
              sizes="100vw"
              alt={heroArray[currentIndex].alt || ""}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          </motion.div>
        </AnimatePresence>
  
        <div className="absolute inset-0 bg-gradient-to-b from-[#046A63]/40 to-[#023B37]/60 pointer-events-none" />
      </div>

      {/* Texto sobre la imagen */}
      <div 
        key={`text-${currentIndex}`}
        className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center text-white px-4 sm:px-6 md:px-10"
      >
        <motion.h1
          custom={0.2}
          variants={textVariants}
          initial="hidden"
          animate="visible"
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight sm:leading-snug drop-shadow-lg max-w-[90%] sm:max-w-3xl"
        >
          Innovación y Soluciones para cada Proyecto
        </motion.h1>
        
        <motion.p
          custom={0.4}
          variants={textVariants}
          initial="hidden"
          animate="visible"
          className="text-sm sm:text-base md:text-lg lg:text-xl max-w-[90%] sm:max-w-3xl drop-shadow-md leading-relaxed"
        >
          Calidad respaldada por nuestra garantía, mostrando nuestro compromiso
          con la satisfacción de nuestros clientes.
        </motion.p>
      </div>

      {/* Card inferior flotante — oculto en móvil */}
      <div className="flex absolute bottom-0 left-0 right-0 z-40 w-full justify-center">
        <motion.div 
          // Animación de entrada de la tarjeta (Spring)
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: "50%" }} // Mantenemos tu translate-y-1/2 visualmente
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.8 }}
          
          className="bg-[#FFF8F8] backdrop-blur-sm rounded-xl 
            shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15),0_4px_20px_-5px_rgba(0,120,111,0.1)]
            px-4 py-3 sm:px-6 sm:py-4 md:px-16 md:py-6 
            mx-4 sm:mx-6 md:mx-8 
            text-[#00786F] font-black text-center 
            text-[12px] sm:text-sm md:text-lg
            tracking-wide uppercase font-inter 
            flex flex-wrap justify-center gap-3 sm:gap-6 md:gap-12 
            border border-gray-100/50
            transition-all duration-300 hover:shadow-[0_15px_50px_-10px_rgba(0,0,0,0.2),0_8px_25px_-5px_rgba(0,120,111,0.15)]"
        >
          <a
            href="/productos?categoria=Negocio"
            className="relative hover:text-teal-700 transition-all duration-300 after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:h-[2px] after:w-0 after:bg-teal-600 after:transition-all after:duration-300 hover:after:w-full"
          >
            Negocio
          </a>
          <span className="hidden sm:inline-block w-px h-4 sm:h-6 bg-gray-400"></span>
          <a
            href="/productos?categoria=Maquinaria"
            className="relative hover:text-teal-700 transition-all duration-300 after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:h-[2px] after:w-0 after:bg-teal-600 after:transition-all after:duration-300 hover:after:w-full"
          >
            Maquinarias
          </a>
          <span className="hidden sm:inline-block w-px h-4 sm:h-6 bg-gray-400"></span>
          <a
            href="/productos?categoria=Decoración"
            className="relative hover:text-teal-700 transition-all duration-300 after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:h-[2px] after:w-0 after:bg-teal-600 after:transition-all after:duration-300 hover:after:w-full"
          >
            Decoración
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;