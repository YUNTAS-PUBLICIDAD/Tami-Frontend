import React, { useRef } from "react";

interface Testimonial {
    avatar: string;
    name: string;
    rating: number;
    text: string;
}

interface HorizontalScrollProps {
    testimonials: Testimonial[];
}

const HorizontalScroll: React.FC<HorizontalScrollProps> = ({ testimonials }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    return (
        <div className="relative overflow-x-auto md:overflow-visible">
            {/* Contenedor de testimonios */}
            <div
                className="flex md:justify-center gap-4 md:gap-14 px-4 md:px-8 mb-20 md:flex-wrap md:flex-row flex-nowrap"
                ref={containerRef}
            >
                {testimonials.map((testimonial, index) => (
                    <div
                        className="w-72 sm:w-80 flex-shrink-0 p-4 px-6 rounded-4xl border border-teal-400 flex flex-col bg-white"
                        key={index}
                    >
                        <div className="flex items-center gap-x-4">
                            <img
                                src={testimonial.avatar}
                                alt="Avatar"
                                className="w-16 h-16 rounded-full bg-gray-200"
                            />
                            <div>
                                <h3 className="text-xl font-bold text-teal-600 tracking-widest">
                                    {testimonial.name}
                                </h3>
                                <div className="text-orange-300 text-2xl md:text-4xl">
                                    {"★".repeat(testimonial.rating) +
                                        "☆".repeat(5 - testimonial.rating)}
                                </div>
                            </div>
                        </div>
                        <p className="mt-2">{testimonial.text}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HorizontalScroll;