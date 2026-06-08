// HeroSubtitle.jsx
import { useEffect, useState } from "react";

export default function HeroSubtitle() {
  const subtitulos = [
    "Cuéntanos tu proyecto y te ayudamos a dar el siguiente paso",
    "Asesoría, cotización y seguimiento en un solo lugar",
    "Estamos listos para responder tus dudas y necesidades",
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % subtitulos.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-[60px] sm:h-[100px] mt-4 relative w-full flex justify-center items-center">
      {subtitulos.map((texto, i) => (
        <p
          key={texto}
          className={`absolute text-white/90 text-sm sm:text-xl lg:text-2xl font-light text-center transition-all duration-500 ease-in-out ${
            i === index
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
        >
          {texto}
        </p>
      ))}
    </div>
  );
}