import { useEffect, useState } from "react";
import asesoriaImg from "../../assets/images/Diseno.webp";
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
        }, 300);
    };

    if (!showModal) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4 modal-overlay">
            <div
                className={`bg-white flex flex-col sm:flex-row overflow-hidden shadow-lg w-[90%] max-w-md sm:max-w-3xl relative
      ${isClosing ? "animate-slideOut" : "animate-slideIn"}
    `}
            >
                {/* Imagen: solo visible en sm+ */}
                <div className="hidden sm:block w-2/5 relative">
                    <img
                        src={asesoriaImg.src}
                        alt="Asesoría"
                        className="w-full h-full object-cover"
                    />
                    <img
                        src={Logo.src}
                        alt="LogoTami"
                        className="absolute top-4 left-4 w-10 h-12"
                    />
                </div>

                {/* Contenido */}
                <div className="w-full sm:w-3/5 bg-gradient-to-b from-orange-300 to-teal-600 p-6 text-white relative">
                    <div className="py-6 sm:py-10 mx-2 sm:mx-8">
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-5 text-md text-white hover:text-gray-300"
                        >
                            X
                        </button>
                        <h2 className="text-xl sm:text-3xl font-bold text-center sm:mt-3 mb-4">
                            ¡RECIBE UNA ASESORÍA GRATIS!
                        </h2>
                        <form className="flex flex-col gap-1">
                            <h3 className="text-base sm:text-lg font-bold">Nombre</h3>
                            <input
                                type="text"
                                className="p-2 rounded-lg bg-white text-black outline-none mb-4 sm:mb-8"
                            />
                            <h3 className="text-base sm:text-lg font-bold">Teléfono</h3>
                            <input
                                type="tel"
                                className="p-2 rounded-lg bg-white text-black outline-none mb-4 sm:mb-8"
                            />
                            <h3 className="text-base sm:text-lg font-bold">Correo</h3>
                            <input
                                type="email"
                                className="p-2 rounded-lg bg-white text-black outline-none mb-4 sm:mb-6"
                            />
                            <button
                                type="submit"
                                className="bg-orange-300 hover:bg-orange-400 text-white w-full sm:max-w-fit p-3 sm:p-4 text-xl sm:text-3xl font-bold rounded-xl mx-auto"
                            >
                                ¡HABLEMOS!
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScrollModal;