import { useEffect, useState, useRef } from "react";
import asesoriaImg from "../../assets/images/Diseno.webp";
import Logo from "../../assets/images/logos/logo-blanco-tami.gif";
import { config, getApiUrl } from "../../../config";

const MODAL_STORAGE_KEY = "catalogModalLastClosed";
const MODAL_COOLDOWN_MS = 3 * 60 * 1000; // 3 minutos
const SESSION_STORAGE_KEY = "catalogModalSessionShown";

const ScrollModal = () => {
  // --- Hooks (siempre en el mismo orden)
  const [pathname, setPathname] = useState<string>("");
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

  const allowedRoutes = [
    "/",
    "/sobre-nosotros",
    "/productos",
    "/politicas-de-envio",
    "/blog",
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPathname(window.location.pathname);
    }
  }, []);

  // Mostrar modal automáticamente después de 2 segundos SOLO en allowedRoutes
  useEffect(() => {
    if (!pathname || !allowedRoutes.includes(pathname)) return;
    if (showModal || isClosing) return;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const lastClosed = parseInt(
      localStorage.getItem(MODAL_STORAGE_KEY) || "0",
      10
    );
    const now = Date.now();
    const sessionShown = sessionStorage.getItem(SESSION_STORAGE_KEY);

    const isAnyModalOpen = document.querySelector(".modal-overlay");
    const isCatalogModalOpen = document.getElementById("catalog-modal");

    if (
      now - lastClosed >= MODAL_COOLDOWN_MS &&
      !hasShownRef.current &&
      !sessionShown &&
      !isAnyModalOpen &&
      !isCatalogModalOpen &&
      !showModal
    ) {
      timer = setTimeout(() => {
        setShowModal(true);
        hasShownRef.current = true;
        sessionStorage.setItem(SESSION_STORAGE_KEY, "true");
      }, 16000); // 16 segundos
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [pathname, showModal, isClosing]);

  // Mostrar modal al detectar intención de salida (mouse hacia arriba fuera de la ventana)
  useEffect(() => {
    if (!pathname || !allowedRoutes.includes(pathname)) return;
    const handleMouseOut = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        if (showModal || isClosing) return;

        const lastClosed = parseInt(
          localStorage.getItem(MODAL_STORAGE_KEY) || "0",
          10
        );
        const now = Date.now();
        const sessionShown = sessionStorage.getItem(SESSION_STORAGE_KEY);
        const isAnyModalOpen = document.querySelector(".modal-overlay");
        const isCatalogModalOpen = document.getElementById("catalog-modal");

        if (
          now - lastClosed >= MODAL_COOLDOWN_MS &&
          !hasShownRef.current &&
          !sessionShown &&
          !isAnyModalOpen &&
          !isCatalogModalOpen &&
          !showModal
        ) {
          setShowModal(true);
          hasShownRef.current = true;
          sessionStorage.setItem(SESSION_STORAGE_KEY, "true");
        }
      }
    };
    window.addEventListener("mouseout", handleMouseOut);
    return () => window.removeEventListener("mouseout", handleMouseOut);
  }, [pathname, showModal, isClosing]);

  // Abierto manualmente por el botón (evento global)
  useEffect(() => {
    const handler = () => {
      if (!pathname || !allowedRoutes.includes(pathname)) return;
      const isAnyModalOpen = document.querySelector(".modal-overlay");
      if (!isAnyModalOpen) {
        setShowModal(true);
      }
    };
    window.addEventListener("open-scroll-modal", handler);
    return () => window.removeEventListener("open-scroll-modal", handler);
  }, [pathname]);

  // Abierto automáticamente por scroll (bajar hasta abajo + subir)
  useEffect(() => {
    const handleScroll = () => {
      if (!pathname || !allowedRoutes.includes(pathname)) return;
      if (showModal || isClosing) return;
      const currentScroll = window.scrollY;
      const scrollDirection =
        currentScroll < lastScrollRef.current ? "up" : "down";
      lastScrollRef.current = currentScroll;

      const atBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight;
      if (atBottom) hasReachedBottomRef.current = true;

      if (
        hasReachedBottomRef.current &&
        scrollDirection === "up" &&
        !hasShownRef.current
      ) {
        const lastClosed = parseInt(
          localStorage.getItem(MODAL_STORAGE_KEY) || "0",
          10
        );
        const now = Date.now();
        if (now - lastClosed < MODAL_COOLDOWN_MS) return; // dentro del cooldown

        setShowModal(true);
        hasShownRef.current = true;
        hasReachedBottomRef.current = false;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname, showModal, isClosing]);

  const resetForm = () => {
    setNombre("");
    setTelefono("");
    setCorreo("");
    setErrors({});
  };

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosing(false);
      resetForm();
      localStorage.setItem(MODAL_STORAGE_KEY, Date.now().toString());
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      hasShownRef.current = false;
    }, 300);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (nombre.trim().length < 3 || nombre.trim().length > 75) {
      newErrors.nombre = "El nombre debe tener entre 3 y 75 caracteres.";
    }

    if (!/^\d{7,15}$/.test(telefono.trim())) {
      newErrors.telefono =
        "El teléfono debe tener entre 7 y 15 dígitos numéricos.";
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

      const response = await fetch(
        getApiUrl(config.endpoints.clientes.create),
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("[ScrollModal] Error al enviar:", errorData);

        if (errorData?.errors) {
          const newErrors: { [key: string]: string } = {};
          if (errorData.errors.name)
            newErrors.nombre = errorData.errors.name.join(" ");
          if (errorData.errors.celular)
            newErrors.telefono = errorData.errors.celular.join(" ");
          if (errorData.errors.email)
            newErrors.correo = errorData.errors.email.join(" ");
          setErrors(newErrors);
        } else {
          setErrors({
            general: "No se pudo enviar la información. Intenta nuevamente.",
          });
        }
        return;
      }

      console.log("[ScrollModal] Enviado exitosamente:", {
        nombre,
        telefono,
        correo,
      });

      setErrors({ general: "✅ Información enviada con éxito ✅" });
      setTimeout(() => {
        closeModal();
        setErrors({});
      }, 1500);
    } catch (err: any) {
      console.error("[ScrollModal] Error al enviar:", err);
      setErrors({ general: err.message || "Error desconocido." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render: condición final (SE HACE DESPUÉS de declarar hooks y efectos)
  const isAllowed = allowedRoutes.includes(pathname);
  if (!isAllowed || !showModal) return null;

  return (
    <div
      id="catalog-modal"
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4 modal-overlay transition-opacity duration-500 animate-fadeIn"
    >
      <div
        className={`bg-white flex flex-col sm:flex-row overflow-hidden shadow-2xl w-[90%] max-w-md sm:max-w-3xl relative rounded-3xl border border-teal-400 transition-all duration-500 ${
          isClosing ? "animate-slideOut" : "animate-slideIn"
        }`}
      >
        {/* Imagen */}
        <div className="hidden sm:block w-2/4 relative animate-fadeInLeft">
          <img
            src={asesoriaImg.src}
            alt="Asesoría"
            title="Asesoría"
            className="w-full h-full object-cover select-none scale-105 transition-transform duration-700"
          />
          <img
            src={Logo.src}
            alt="LogoTami"
            title="Logo Tami"
            className="absolute top-40 left-4 w-80 h-80 object-contain select-none drop-shadow-2xl animate-fadeIn"
          />
        </div>

        {/* Contenido */}
        <div className="w-full sm:w-3/5 bg-gradient-to-b from-[#01A09E] to-[#00D6D3] text-white relative animate-fadeInRight">
          <div className="py-6 sm:py-10 mx-2 sm:mx-8 min-h-[420px]">
            <button
              onClick={closeModal}
              aria-label="Cerrar modal"
              className="absolute top-4 right-5 text-md text-white hover:text-gray-300 transition-colors duration-300 cursor-pointer"
            >
              X
            </button>

            <h2 className="scrollmodal-body select-none text-2xl sm:text-3xl font-extrabold mb-6 animate-fadeInUp">
              DESCARGA{" "}
              <span className="scrollmodal-title text-yellow-200">GRATIS</span>{" "}
              NUESTRO{" "}
              <span className="scrollmodal-title text-yellow-200">
                CATÁLOGO
              </span>
            </h2>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-1 animate-fadeInUp"
            >
              <h3 className="text-base sm:text-lg font-bold select-none">
                Nombre
              </h3>
              <input
                type="text"
                placeholder="Nombres y Apellidos"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="p-2 rounded-lg bg-white text-black outline-none mb-1 focus:ring-2 focus:ring-teal-400 transition-all duration-300"
              />
              <p className="text-sm text-yellow-100 mb-3 h-5 transition-opacity duration-300">
                {errors.nombre || "\u00A0"}
              </p>

              <h3 className="text-base sm:text-lg font-bold select-none">
                Teléfono
              </h3>
              <input
                type="tel"
                placeholder="Teléfono: 905 876 524"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="p-2 rounded-lg bg-white text-black outline-none mb-1 focus:ring-2 focus:ring-teal-400 transition-all duration-300"
              />
              <p className="text-sm text-yellow-100 mb-3 h-5 transition-opacity duration-300">
                {errors.telefono || "\u00A0"}
              </p>

              <h3 className="text-base sm:text-lg font-bold select-none">
                Correo
              </h3>
              <input
                type="email"
                placeholder="Correo@gmail.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="p-2 rounded-lg bg-white text-black outline-none mb-1 focus:ring-2 focus:ring-teal-400 transition-all duration-300"
              />
              <p
                className={`text-sm text-center mb-3 h-5 transition-opacity duration-300 ${
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
                className="bg-[#01A09E] rounded-2xl text-white w-full sm:max-w-fit p-3 sm:p-4 text-xl sm:text-3xl font-bold mx-auto shadow-[0_4px_10px_rgba(255,255,255,0.6)] transition-all duration-300 hover:bg-teal-700 hover:scale-105 active:scale-95"
              >
                {isSubmitting ? "Enviando..." : "¡REGISTRARME!"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrollModal;
