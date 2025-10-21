import React, { useEffect, useState } from "react";

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

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 640); // sm: < 640px
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  if (isMobile) {
    return (
      <div className="flex justify-center px-10 mb-20 relative min-h-[280px] h-[340px]">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className={`w-72 p-6 bg-white rounded-3xl border border-teal-400 flex flex-col transition-all duration-500 absolute ${
              slideIndex === index
                ? "opacity-100 scale-100 relative"
                : "opacity-0 scale-95 pointer-events-none"
            }`}
          >
            <div className="flex items-center gap-x-4">
              <img
                src={testimonial.avatar}
                alt={testimonial.alt}
                title={testimonial.title}
                width={64}
                height={64}
                className="w-16 h-16 rounded-full object-cover"
                loading="lazy"
              />
              <div>
                <h3 className="text-xl font-bold text-teal-600 tracking-widest">
                  {testimonial.name}
                </h3>
                <div className="text-orange-300 text-2xl">
                  {"★".repeat(testimonial.rating) +
                    "☆".repeat(5 - testimonial.rating)}
                </div>
              </div>
            </div>
            <p className="mt-4 text-gray-700">{testimonial.text}</p>
          </div>
        ))}

        {/* Flechas navegación */}
        <button
          onClick={() =>
            setSlideIndex(
              (prev) => (prev - 1 + testimonials.length) % testimonials.length
            )
          }
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-teal-600 text-white p-2 rounded-full shadow-md"
        >
          &#8592;
        </button>
        <button
          onClick={() =>
            setSlideIndex((prev) => (prev + 1) % testimonials.length)
          }
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-teal-600 text-white p-2 rounded-full shadow-md"
        >
          &#8594;
        </button>

        {/* Indicadores */}
        <div className="absolute bottom-[-1.5rem] left-1/2 -translate-x-1/2 flex gap-2">
          {testimonials.map((_, i) => (
            <span
              key={i}
              className={`h-3 w-3 rounded-full ${
                slideIndex === i ? "bg-teal-600" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  // Desktop
  return (
    <div className="flex justify-evenly gap-4 px-10 md:gap-4 flex-wrap mb-20">
      {testimonials.map((testimonial, index) => (
        <div
          key={index}
          className="w-full sm:w-[380px] bg-white p-6 rounded-3xl border border-teal-400 flex flex-col gap-4"
        >
          <div className="flex items-center justify-between gap-x-4">
            {/* Texto a la izquierda */}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-teal-600 tracking-widest">
                {testimonial.name}
              </h3>
              <div className="text-orange-300 text-2xl">
                {"★".repeat(testimonial.rating) +
                  "☆".repeat(5 - testimonial.rating)}
              </div>
            </div>

            {/* Imagen a la derecha */}
            <img
              src={testimonial.avatar}
              alt={testimonial.alt}
              title={testimonial.title}
              width={64}
              height={64}
              className="w-16 h-16 rounded-full object-cover"
              loading="lazy"
            />
          </div>
          <p className="text-gray-700">{testimonial.text}</p>
        </div>
      ))}
    </div>
  );
};

export default Testimonials;
