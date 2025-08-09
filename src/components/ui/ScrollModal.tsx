import { useEffect, useState, useRef } from "react";
import asesoriaImg from "../../assets/images/Diseno.webp";
import Logo from "../../assets/images/logos/logo-blanco-tami.gif";
import { config, getApiUrl } from "../../../config";

const MODAL_STORAGE_KEY = "asesoriaModalLastClosed";
const MODAL_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutos

const ScrollModal = () => {
    const [showModal, setShowModal] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const [nombre, setNombre] = useState("");
    const [telefono, setTelefono] = useState("");
    const [correo, setCorreo] = useState("");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const lastScrollRef = useRef(0);
    const hasReachedBottomRef = useRef(false);
    const hasShownRef = useRef(false);

    const resetForm = () => {
        setNombre("");
        setTelefono("");
        setCorreo("");
        setErrors({});
    };

    // Abierto manualmente por el botón del footer
    useEffect(() => {
        const handleOpenEvent = () => {
            setShowModal(true);
            hasShownRef.current = true;
        };

        window.addEventListener("open-scroll-modal", handleOpenEvent);
        return () => window.removeEventListener("open-scroll-modal", handleOpenEvent);
    }, []);

    // Abierto automáticamente por scroll
    useEffect(() => {
        const handleScroll = () => {

            const currentScroll = window.scrollY;
            const scrollDirection = currentScroll < lastScrollRef.current ? "up" : "down";
            lastScrollRef.current = currentScroll;

            const atBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight;

            if (atBottom) hasReachedBottomRef.current = true;

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
            resetForm();
            localStorage.setItem(MODAL_STORAGE_KEY, Date.now().toString());
            hasShownRef.current = false;
        }, 300);
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (nombre.trim().length < 3 || nombre.trim().length > 75) {
            newErrors.nombre = "El nombre debe tener entre 3 y 75 caracteres.";
        }

        if (!/^\d{7,15}$/.test(telefono.trim())) {
            newErrors.telefono = "El teléfono debe tener entre 7 y 15 dígitos numéricos.";
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
            newErrors.correo = "El correo no es válido.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("name", nombre);
            formData.append("email", correo);
            formData.append("celular", telefono);

            const response = await fetch(getApiUrl(config.endpoints.clientes.create), {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                console.error("[ScrollModal] Error al enviar:", errorData);

                if (errorData?.errors) {
                    const newErrors: { [key: string]: string } = {};
                    if (errorData.errors.name) newErrors.nombre = errorData.errors.name.join(" ");
                    if (errorData.errors.celular) newErrors.telefono = errorData.errors.celular.join(" ");
                    if (errorData.errors.email) newErrors.correo = errorData.errors.email.join(" ");
                    setErrors(newErrors);
                } else {
                    setErrors({ general: "No se pudo enviar la información. Intenta nuevamente." });
                }
                return; // Evita que continúe como éxito
            }

            console.log("[ScrollModal] Enviado exitosamente:", { nombre, telefono, correo });

            // Mostrar mensaje de éxito antes de cerrar
            setErrors({ general: "✅ Información enviada con éxito ✅" });
            setTimeout(() => {
                closeModal();
                setErrors({});
            }, 1500);

        } catch (err: any) {
            console.error("[ScrollModal] Error al enviar:", err);
            setErrors({ general: err.message || "Error desconocido." });
        }
        finally {
            setIsSubmitting(false);
        }
    };

    if (!showModal) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4 modal-overlay">
            <div
                className={`bg-white flex flex-col sm:flex-row overflow-hidden shadow-lg w-[90%] max-w-md sm:max-w-3xl relative ${
                    isClosing ? "animate-slideOut" : "animate-slideIn"
                }`}
            >
                {/* Imagen */}
                <div className="hidden sm:block w-2/5 relative">
                    <img src={asesoriaImg.src} alt="Asesoría" className="w-full h-full object-cover" />
                    <img src={Logo.src} alt="LogoTami" className="absolute top-4 left-4 w-10 h-12" />
                </div>

                {/* Contenido */}
                <div className="w-full sm:w-3/5 bg-gradient-to-b from-orange-300 to-teal-600 p-6 text-white relative">
                    <div className="py-6 sm:py-10 mx-2 sm:mx-8 min-h-[420px]">
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

                        <form onSubmit={handleSubmit} className="flex flex-col gap-1">
                            <h3 className="text-base sm:text-lg font-bold">Nombre</h3>
                            <input
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                className="p-2 rounded-lg bg-white text-black outline-none mb-1"
                            />
                            <p className="text-sm text-yellow-100 mb-3 h-5">
                                {errors.nombre || "\u00A0"}
                            </p>

                            <h3 className="text-base sm:text-lg font-bold">Teléfono</h3>
                            <input
                                type="tel"
                                value={telefono}
                                onChange={(e) => setTelefono(e.target.value)}
                                className="p-2 rounded-lg bg-white text-black outline-none mb-1"
                            />
                            <p className="text-sm text-yellow-100 mb-3 h-5">
                                {errors.telefono || "\u00A0"}
                            </p>

                            <h3 className="text-base sm:text-lg font-bold">Correo</h3>
                            <input
                                type="email"
                                value={correo}
                                onChange={(e) => setCorreo(e.target.value)}
                                className="p-2 rounded-lg bg-white text-black outline-none mb-1"
                            />
                            <p
                                className={`text-sm text-center mb-3 h-5 ${
                                    errors.correo || errors.general
                                        ? "text-red-100"
                                        : successMessage
                                            ? "text-green-100"
                                            : "text-yellow-100"
                                }`}
                            >
                                {errors.correo || errors.general || successMessage || "\u00A0"}
                            </p>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-orange-300 hover:bg-orange-400 text-white w-full sm:max-w-fit p-3 sm:p-4 text-xl sm:text-3xl font-bold rounded-xl mx-auto text-center"
                            >
                                {isSubmitting ? "Enviando..." : "¡HABLEMOS!"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScrollModal;