import { useEffect, useState, useRef } from "react";
import asesoriaImg from "../../assets/images/Diseno.webp";
import Logo from "../../assets/images/logos/logo_animado.gif";

const MODAL_STORAGE_KEY = "asesoriaModalLastClosed";
const MODAL_COOLDOWN_MS = 3 * 60 * 1000; // 3 minutos

const ScrollModal = () => {
    const [showModal, setShowModal] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    // Optimizamos con useRef para evitar renders innecesarios
    const lastScrollRef = useRef(0);
    const hasReachedBottomRef = useRef(false);
    const hasShownRef = useRef(false);

    useEffect(() => {
        const handleScroll = () => {
            const lastClosed = Number(localStorage.getItem(MODAL_STORAGE_KEY)) || 0;
            const now = Date.now();

            // Si sigue dentro del cooldown, no mostrar
            if (now - lastClosed < MODAL_COOLDOWN_MS) return;

            const currentScroll = window.scrollY;
            const scrollDirection =
                currentScroll < lastScrollRef.current ? "up" : "down";

            lastScrollRef.current = currentScroll;

            const atBottom =
                window.innerHeight + window.scrollY >= document.body.offsetHeight;

            if (atBottom) {
                hasReachedBottomRef.current = true;
            }

            if (
                hasReachedBottomRef.current &&
                scrollDirection === "up" &&
                !hasShownRef.current
            ) {
                setShowModal(true);
                hasShownRef.current = true;
                hasReachedBottomRef.current = false;
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const closeModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            setShowModal(false);
            setIsClosing(false);
            localStorage.setItem(MODAL_STORAGE_KEY, Date.now().toString());
            hasShownRef.current = false; // Permite mostrar de nuevo cuando pase el cooldown
        }, 300);
    };

    if (!showModal) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4 modal-overlay">
            <div
                className={`bg-white flex flex-col sm:flex-row overflow-hidden shadow-lg w-[90%] max-w-md sm:max-w-3xl relative ${
                    isClosing ? "animate-slideOut" : "animate-slideIn"
                }`}
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
                            aria-label="Cerrar modal"
                            className="absolute top-4 right-5 text-md text-white hover:text-gray-300"
                        >
                            X
                        </button>
                        <h2 className="text-xl sm:text-3xl font-bold text-center sm:mt-3 mb-4">
                            ¡RECIBE UNA ASESORÍA GRATIS!
                        </h2>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                // Aquí podrías agregar la lógica para enviar los datos.
                                closeModal();
                            }}
                            className="flex flex-col gap-1"
                        >
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
                            <a
                                href="https://api.whatsapp.com/send?phone=51978883199&text=Hola%2C%20quiero%20recibir%20mi%20asesor%C3%ADa%20gratis."
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-orange-300 hover:bg-orange-400 text-white w-full sm:max-w-fit p-3 sm:p-4 text-xl sm:text-3xl font-bold rounded-xl mx-auto text-center"
                            >
                                ¡HABLEMOS!
                            </a>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScrollModal;