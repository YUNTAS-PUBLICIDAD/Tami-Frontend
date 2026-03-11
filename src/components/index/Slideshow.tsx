import React, { useEffect, useRef, useState } from "react";

interface Testimonial {
  avatar: string;
  name: string;
  alt: string;
  title: string;
  rating: number;
  text: string;
}

const testimonials: Testimonial[] = [
  {
    avatar: "/images/persona-sonriente-feliz.webp",
    name: "Carlos Pérez",
    alt: "testimonio de Carlos Pérez",
    rating: 5,
    text: "Compré mi selladora de vasos con TAMI y la experiencia fue excelente. Me asesoraron bien desde el comienzo y resolvieron mis dudas. ¡Satisfecho con mi compra!",
    title: "Testimonio de Carlos Pérez",
  },
  {
    avatar: "/images/chica-guiño-ojo.webp",
    name: "María López",
    alt: "testimonio de María López",
    rating: 4,
    text: "Compré la mesa LED alta para mi discoteca y fue la sensación desde el primer día. Los colores se adaptan al ambiente y crean una experiencia única para los clientes. ¡Totalmente recomendada!",
    title: "Testimonio de María López",
  },
  {
    avatar: "/images/persona-camisa-risa.webp",
    name: "Javier Gómez",
    alt: "testimonio de Javier Gómez",
    rating: 5,
    text: "La selladora de bolsas para salsas me ha salvado en el restaurante. Antes se nos regaban las cremas en los pedidos, ahora todo llega perfecto.",
    title: "Testimonio de Javier Gómez",
  },
];

const Testimonials: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Detectar si es móvil
  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // Autoplay en móvil
  useEffect(() => {
    if (!isMobile) return;
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = window.setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isMobile]);

  // Swipe táctil
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const delta = touchStartX.current - touchEndX.current;
    const threshold = 50;
    if (Math.abs(delta) > threshold) {
      setSlideIndex((prev) =>
        delta > 0
          ? (prev + 1) % testimonials.length
          : (prev - 1 + testimonials.length) % testimonials.length
      );
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // MODO MÓVIL 
  if (isMobile) {
    return (
      <div
        className="relative w-full flex flex-col items-center mb-16"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Degradados laterales */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#036B63]/30 to-transparent z-20 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#036B63]/30 to-transparent z-20 pointer-events-none"></div>

        {/* Carrusel con contenedor para overflow-hidden */}
        <div className="w-full overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{
              transform: `translateX(-${slideIndex * 100}%)`,
            }}
          >
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-full px-6 flex justify-center py-4"
              >
                <div className="bg-white rounded-3xl shadow-xl border border-teal-400 p-6 w-[90%] max-w-[360px] text-center">
                  <img
                    src={t.avatar}
                    alt={t.alt}
                    title={t.title}
                    className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="text-xl font-bold text-teal-700 tracking-wide mb-1">
                    {t.name}
                  </h3>
                  <div className="text-orange-400 text-lg mb-3">
                    {"★".repeat(t.rating) + "☆".repeat(5 - t.rating)}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {t.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Indicadores - Ajustados para no ser cortados y tener buen espaciado */}
        <div className="flex justify-center gap-0 mt-2 z-30">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlideIndex(i)}
              aria-label={`Ir al testimonio ${i + 1}`}
              className="flex items-center justify-center p-4 group"
            >
              <span
                className={`h-2 rounded-full transition-all duration-300 ${slideIndex === i ? "bg-teal-600 w-8" : "bg-gray-300 w-2"
                  }`}
              />
            </button>
          ))}
        </div>
      </div>
    );
  }

  //  MODO ESCRITORIO 
  return (
    <div className="flex justify-evenly gap-6 flex-wrap px-10 mb-20">
      {testimonials.map((t, i) => (
        <div
          key={i}
          className="bg-white p-6 rounded-3xl shadow-lg border border-teal-400 w-full sm:w-[340px] md:w-[380px] transition-all hover:shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-teal-700 tracking-wide">
                {t.name}
              </h3>
              <div className="text-orange-400 text-xl">
                {"★".repeat(t.rating) + "☆".repeat(5 - t.rating)}
              </div>
            </div>
            <img
              src={t.avatar}
              alt={t.alt}
              title={t.title}
              className="w-16 h-16 rounded-full object-cover"
            />
          </div>
          <p className="text-gray-700 leading-relaxed">{t.text}</p>
        </div>
      ))}
    </div>
  );
};

export default Testimonials;
