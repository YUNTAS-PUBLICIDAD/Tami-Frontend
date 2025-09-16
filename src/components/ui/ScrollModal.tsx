import { useEffect, useState, useRef } from "react";
import asesoriaImg from "../../assets/images/Diseno.webp";
import Logo from "../../assets/images/logos/logo-blanco-tami.gif";
import { config, getApiUrl } from "../../../config";

const MODAL_STORAGE_KEY = "catalogModalLastClosed";
const MODAL_COOLDOWN_MS = 3 * 60 * 1000; // 3 minutos

const SESSION_STORAGE_KEY = "catalogModalSessionShown";
const ScrollModal = () => {


  // Estados y referencias al inicio del componente
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
    "/about",
    "/productos",
    "/politicas-de-envio",
    "/blog",
  ];

  // Mostrar modal automáticamente después de 2 segundos SOLO en primera visita de sesión
  useEffect(() => {
    if (!pathname || !allowedRoutes.includes(pathname)) return;
    if (showModal || isClosing) return;
    let timer: NodeJS.Timeout | null = null;

    const lastClosed = parseInt(
      localStorage.getItem(MODAL_STORAGE_KEY) || "0",
      10
    );
    const now = Date.now();
    const sessionShown = sessionStorage.getItem(SESSION_STORAGE_KEY);

    const isAnyModalOpen = document.querySelector('.modal-overlay');
    const isCatalogModalOpen = document.getElementById('catalog-modal');

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
      }, 2000); // 2 segundos
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [pathname]);

  // Mostrar modal al detectar intención de salida (mouse hacia arriba fuera de la ventana)
  useEffect(() => {
    if (!pathname || !allowedRoutes.includes(pathname)) return;
    const handleMouseOut = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        if (showModal || isClosing) return;
        // Bloquear triggers si está cerrando
        const lastClosed = parseInt(
          localStorage.getItem(MODAL_STORAGE_KEY) || "0",
          10
        );
        const now = Date.now();
        const sessionShown = sessionStorage.getItem(SESSION_STORAGE_KEY);
        const isAnyModalOpen = document.querySelector('.modal-overlay');
        const isCatalogModalOpen = document.getElementById('catalog-modal');
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
  }, [pathname]);

  // Obtener pathname solo en cliente
  useEffect(() => {
    if (typeof window !== "undefined") {
      setPathname(window.location.pathname);
    }
  }, []);

  // Se elimina la aparición automática y por intención de salida. Solo trigger manual por evento open-scroll-modal.

  // Abierto manualmente por el botón del footer
  useEffect(() => {
    const handleOpenEvent = () => {
      setShowModal(true);
      hasShownRef.current = true;
    };

    window.addEventListener("open-scroll-modal", handleOpenEvent);
    return () =>
      window.removeEventListener("open-scroll-modal", handleOpenEvent);
  }, []);

  // Abierto automáticamente por scroll
  useEffect(() => {
    const handleScroll = () => {
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
        // Verificar cooldown antes de mostrar
        const lastClosed = parseInt(
          localStorage.getItem(MODAL_STORAGE_KEY) || "0",
          10
        );
        const now = Date.now();
        if (now - lastClosed < MODAL_COOLDOWN_MS) {
          return; // Todavía dentro del tiempo de enfriamiento
        }

        setShowModal(true);
        hasShownRef.current = true;
        hasReachedBottomRef.current = false;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      // sessionStorage.removeItem(SESSION_STORAGE_KEY); // No reiniciar la sesión, así no vuelve a aparecer
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
        return; // Evita que continúe como éxito
      }

      console.log("[ScrollModal] Enviado exitosamente:", {
        nombre,
        telefono,
        correo,
      });

      // Mostrar mensaje de éxito antes de cerrar
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

  // Si la ruta no está permitida, no renderizar nada
  if (!allowedRoutes.includes(pathname)) {
    return null;
  }

  if (!showModal) return null;

  return (
  <div id="catalog-modal" className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4 modal-overlay transition-opacity duration-500 animate-fadeIn">
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
            className="w-full h-full object-cover select-none scale-105 transition-transform duration-700"
          />
          <img
            src={Logo.src}
            alt="LogoTami"
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
              DESCARGA <span className="scrollmodal-title text-yellow-200">GRATIS</span> NUESTRO <span className="scrollmodal-title text-yellow-200">CATÁLOGO</span>
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-1 animate-fadeInUp">
              <h3 className="text-base sm:text-lg font-bold select-none">Nombre</h3>
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

              <h3 className="text-base sm:text-lg font-bold select-none">Teléfono</h3>
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

              <h3 className="text-base sm:text-lg font-bold select-none">Correo</h3>
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
                className="bg-[#01A09E] rounded-2xl text-white w-full sm:max-w-fit p-3 sm:p-4 text-xl sm:text-3xl font-bold mx-auto text-center shadow-[0_4px_10px_rgba(255,255,255,0.6)] cursor-pointer transition-all duration-300 hover:bg-teal-700 hover:scale-105 active:scale-95"
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