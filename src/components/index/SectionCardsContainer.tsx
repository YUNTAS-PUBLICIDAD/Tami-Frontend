import { useEffect, useState, useRef } from "react";
import sectionCards from "@data/sectionCards.data";

const SectionCardsContainer = () => {
  const [index, setIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const next = () => setIndex((prev) => (prev + 1) % sectionCards.length);
  const prev = () =>
    setIndex((prev) => (prev - 1 + sectionCards.length) % sectionCards.length);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    timeoutRef.current = window.setTimeout(next, 4000);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [index, isMobile]);

  const resolveImageSrc = (img: any): string => {
    if (!img) return "";
    if (typeof img === "string") return img;
    if (typeof img === "object" && "src" in img) return img.src;
    return String(img);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const delta = touchStartX.current - touchEndX.current;
    if (Math.abs(delta) > 50) {
      delta > 0 ? next() : prev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (!isMobile) {
    return (
      <section className="w-full my-8 scroll-mt-20 max-w-screen-2xl mx-auto px-4 md:px-10">
        <h2 className="text-4xl font-extrabold mb-12 text-center text-teal-600">
          OPTIMIZA TU TRABAJO, NEGOCIO Y HOGAR
        </h2>
        <div className="flex justify-center gap-10 flex-wrap">
          {sectionCards.map((item) => (
            <a
              key={item.id}
              href={`/productos#${item.id}`}
              className="group relative w-[30%] min-w-[280px] aspect-[3/4] rounded-2xl overflow-hidden border border-teal-200 transition-transform duration-500 hover:scale-[1.05] hover:shadow-2xl hover:border-teal-400"
            >
              <img
                src={resolveImageSrc(item.image)}
                alt={item.alt}
                title={item.imageTitle || item.alt}
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <h3 className="absolute bottom-6 left-0 right-0 text-center text-white text-2xl font-bold drop-shadow-md">
                {item.title}
              </h3>
            </a>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative w-full my-8 scroll-mt-20 max-w-screen-2xl mx-auto px-4 md:px-10 overflow-hidden"
      aria-label="Carrusel Optimiza tu negocio y hogar"
    >
      <h2 className="text-3xl font-extrabold mb-8 text-center text-teal-600">
        OPTIMIZA TU TRABAJO, NEGOCIO Y HOGAR
      </h2>

      <div
        className="relative w-full h-[420px]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {sectionCards.map((item, i) => (
          <a
            key={item.id}
            href={`/productos#${item.id}`}
            className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${
              i === index
                ? "opacity-100 scale-100 z-10"
                : "opacity-0 scale-95 z-0 pointer-events-none"
            }`}
          >
            <div className="relative w-72 h-96 rounded-2xl overflow-hidden shadow-lg border border-teal-200">
              <img
                src={resolveImageSrc(item.image)}
                alt={item.alt}
                title={item.imageTitle || item.alt}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <h3 className="absolute bottom-6 left-0 right-0 text-center text-white text-lg font-bold drop-shadow-md">
                {item.title}
              </h3>
            </div>
          </a>
        ))}

        {/* Indicadores */}
        <div className="absolute bottom-[0px] left-1/2 -translate-x-1/2 flex gap-2">
          {sectionCards.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-2 w-2 rounded-full transition-all ${
                i === index ? "bg-teal-600 w-6" : "bg-teal-300 w-2"
              }`}
              aria-label={`Ir al slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SectionCardsContainer;
