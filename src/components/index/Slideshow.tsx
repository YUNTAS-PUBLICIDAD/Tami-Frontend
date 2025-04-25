import React, { useEffect, useState } from 'react';

interface Testimonial {
    avatar: string;
    name: string;
    rating: number;
    text: string;
}

const testimonials: Testimonial[] = [
    {
        avatar: '',
        name: 'NOMBRE',
        rating: 5,
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
    {
        avatar: '',
        name: 'NOMBRE',
        rating: 5,
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
    {
        avatar: '',
        name: 'NOMBRE',
        rating: 5,
        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
];

const Testimonials: React.FC = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [slideIndex, setSlideIndex] = useState(0);

    useEffect(() => {
        const checkScreen = () => setIsMobile(window.innerWidth < 640); // sm: < 640px
        checkScreen();
        window.addEventListener('resize', checkScreen);
        return () => window.removeEventListener('resize', checkScreen);
    }, []);

    useEffect(() => {
        if (isMobile) {
            const interval = setInterval(() => {
                setSlideIndex((prev) => (prev + 1) % testimonials.length);
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [isMobile]);

    if (isMobile) {
        // Slideshow para móviles
        return (
            <div className="flex justify-center px-8 mb-20 relative min-h-[280px]">
                {testimonials.map((testimonial, index) => (
                    <div
                        key={index}
                        className={`w-full sm:w-80 p-4 px-6 rounded-3xl border border-teal-400 flex flex-col transition-all duration-500 absolute ${
                            slideIndex === index ? 'opacity-100 scale-100 relative' : 'opacity-0 scale-95 pointer-events-none'
                        }`}
                    >
                        <div className="flex items-center gap-x-4">
                            <img
                                src={testimonial.avatar || 'https://via.placeholder.com/64'}
                                alt="Avatar"
                                className="w-16 h-16 rounded-full object-cover"
                            />
                            <div>
                                <h3 className="text-xl font-bold text-teal-600 tracking-widest">
                                    {testimonial.name}
                                </h3>
                                <div className="text-orange-300 text-2xl">
                                    {'★'.repeat(testimonial.rating) + '☆'.repeat(5 - testimonial.rating)}
                                </div>
                            </div>
                        </div>
                        <p className="mt-4 text-gray-700">{testimonial.text}</p>
                    </div>
                ))}
                {/* Indicadores */}
                <div className="absolute bottom-[-1.5rem] left-1/2 -translate-x-1/2 flex gap-2">
                    {testimonials.map((_, i) => (
                        <span
                            key={i}
                            className={`h-3 w-3 rounded-full bg-gray-300 ${slideIndex === i ? 'bg-teal-600' : ''}`}
                        />
                    ))}
                </div>
            </div>
        );
    }

    // Vista normal para pantallas grandes
    return (
        <div className="flex justify-center gap-8 px-8 md:gap-14 flex-wrap mb-20">
            {testimonials.map((testimonial, index) => (
                <div
                    key={index}
                    className="w-full sm:w-80 p-4 px-6 rounded-4xl border border-teal-400 flex flex-col"
                >
                    <div className="flex items-center gap-x-4">
                        <img
                            src={testimonial.avatar || 'https://via.placeholder.com/64'}
                            alt="Avatar"
                            className="w-16 h-16 rounded-full object-cover"
                        />
                        <div>
                            <h3 className="text-xl font-bold text-teal-600 tracking-widest">
                                {testimonial.name}
                            </h3>
                            <div className="text-orange-300 text-2xl md:text-4xl">
                                {'★'.repeat(testimonial.rating) + '☆'.repeat(5 - testimonial.rating)}
                            </div>
                        </div>
                    </div>
                    <p className="mt-2">{testimonial.text}</p>
                </div>
            ))}
        </div>
    );
};

export default Testimonials;