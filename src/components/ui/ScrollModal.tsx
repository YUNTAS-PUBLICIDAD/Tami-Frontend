import { useEffect, useState } from "react";
import asesoriaImg from "../../assets/images/about/nosotros_hero.webp";
import Logo from "../../assets/images/logos/logo_animado.gif";

const ScrollModal = () => {
    const [showModal, setShowModal] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [hasReachedBottom, setHasReachedBottom] = useState(false);
    const [lastScroll, setLastScroll] = useState(0);
    const [hasShownOnce, setHasShownOnce] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const currentScroll = window.scrollY;
            const scrollDirection = currentScroll < lastScroll ? "up" : "down";
            setLastScroll(currentScroll);

            const atBottom =
                window.innerHeight + window.scrollY >= document.body.offsetHeight;

            if (atBottom) {
                setHasReachedBottom(true);
            }

            if (hasReachedBottom && scrollDirection === "up" && !hasShownOnce) {
                setShowModal(true);
                setHasShownOnce(true);
                setHasReachedBottom(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScroll, hasReachedBottom, hasShownOnce]);

    const closeModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            setShowModal(false);
            setIsClosing(false);
        }, 300); // Duración de la animación
    };

    if (!showModal) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4 modal-overlay">
            <div className={`bg-white flex rounded-3xl overflow-hidden shadow-lg max-w-2xl w-full relative 
                ${isClosing ? "animate-slideOut" : "animate-slideIn"}
            `}>
                {/* Imagen */}
                <div className="w-2/5 relative">
                    {/* Imagen principal */}
                    <img
                        src={asesoriaImg.src}
                        alt="Asesoría"
                        className="w-full h-full object-cover"
                    />

                    {/* Logo encima, ubicado en una esquina */}
                    <img
                        src={Logo.src}
                        alt="LogoTami"
                        className="absolute top-4 left-4 w-10 h-12"
                    />
                    <div className="absolute bottom-8 right-6 left-6 text-white text-right text-2xl font-semibold">
                        DISEÑO Y DESARROLLO WEB
                    </div>
                </div>

                {/* Contenido */}
                <div className="w-3/5 bg-gradient-to-b from-teal-700 to-orange-300 p-6 text-white relative">
                    <button
                        onClick={closeModal}
                        className="absolute top-4 right-5 text-md text-white hover:text-gray-300"
                    >
                        X
                    </button>
                    <h2 className="text-3xl font-bold text-center mt-3 mb-8">
                        OBTÉN UNA ASESORÍA ¡GRATIS!
                    </h2>
                    <form className="flex flex-col gap-1">
                        <h3 className="text-md font-semibold">Nombre</h3>
                        <input
                            type="text"
                            className="p-1 rounded-lg bg-white text-black outline-none"
                        />
                        <h3 className="text-md font-semibold">Teléfono</h3>
                        <input
                            type="tel"
                            className="p-1 rounded-lg bg-white text-black outline-none"
                        />
                        <h3 className="text-md font-semibold">Correo</h3>
                        <input
                            type="email"
                            className="p-1 rounded-lg bg-white text-black outline-none mb-5"
                        />
                        <button
                            type="submit"
                            className="bg-teal-500 hover:bg-teal-600 text-white py-2 text-2xl font-bold rounded-2xl mb-2"
                        >
                            HAZLO YA
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ScrollModal;