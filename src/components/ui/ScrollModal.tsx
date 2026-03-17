import { useEffect, useState, useRef } from "react";
import asesoriaImg from "../../assets/images/Diseno.webp";
import Logo from "../../assets/images/logos/logo-blanco-tami.gif";
import { config, getApiUrl } from "../../../config";
import { origenCliente } from "@data/origenCliente";

const MODAL_STORAGE_KEY = "catalogModalLastClosed";
const MODAL_COOLDOWN_MS = 3 * 60 * 1000; // 3 minutos 
const SESSION_STORAGE_KEY = "catalogModalSessionShown";
const DEFAULT_BUTTON_BG_COLOR = "#00625A";
const DEFAULT_BUTTON_TEXT_COLOR = "#FFFFFF";
const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

const ScrollModal = () => {
  // Hooks
  const [pathname, setPathname] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Estados del formulario
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [buttonBgColor, setButtonBgColor] = useState(DEFAULT_BUTTON_BG_COLOR);
  const [buttonTextColor, setButtonTextColor] = useState(DEFAULT_BUTTON_TEXT_COLOR);

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

  // Cargar configuración del popup de Inicio desde backend.
  useEffect(() => {
    let isMounted = true;

    const normalizeColor = (value: unknown, fallback: string): string => {
      if (typeof value !== "string") return fallback;
      const normalized = value.trim().toUpperCase();
      return HEX_COLOR_REGEX.test(normalized) ? normalized : fallback;
    };

    const fetchPopupSettings = async () => {
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;

        const response = await fetch(getApiUrl("/api/v1/admin/popup-settings"), {
          method: "GET",
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as {
          data?: {
            button_bg_color?: string;
            button_text_color?: string;
          };
        };

        if (!isMounted) return;

        setButtonBgColor(
          normalizeColor(payload?.data?.button_bg_color, DEFAULT_BUTTON_BG_COLOR),
        );
        setButtonTextColor(
          normalizeColor(payload?.data?.button_text_color, DEFAULT_BUTTON_TEXT_COLOR),
        );
      } catch (error) {
        console.error("[ScrollModal] Error al cargar popup settings:", error);
      }
    };

    fetchPopupSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  // Mostrar modal automáticamente por tiempo
  useEffect(() => {
    if (!pathname || !allowedRoutes.includes(pathname)) return;
    if (showModal || isClosing) return;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const lastClosed = parseInt(localStorage.getItem(MODAL_STORAGE_KEY) || "0", 10);
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
      // 5 segundos 
      timer = setTimeout(() => {
        setShowModal(true);
        hasShownRef.current = true;
        sessionStorage.setItem(SESSION_STORAGE_KEY, "true");
      }, 5000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [pathname, showModal, isClosing]);

  // Intención de salida
  useEffect(() => {
    if (!pathname || !allowedRoutes.includes(pathname)) return;
    const handleMouseOut = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        if (showModal || isClosing) return;
        const lastClosed = parseInt(localStorage.getItem(MODAL_STORAGE_KEY) || "0", 10);
        const now = Date.now();
        const sessionShown = sessionStorage.getItem(SESSION_STORAGE_KEY);
        const isAnyModalOpen = document.querySelector(".modal-overlay");

        if (now - lastClosed >= MODAL_COOLDOWN_MS && !hasShownRef.current && !sessionShown && !isAnyModalOpen && !showModal) {
          setShowModal(true);
          hasShownRef.current = true;
          sessionStorage.setItem(SESSION_STORAGE_KEY, "true");
        }
      }
    };
    window.addEventListener("mouseout", handleMouseOut);
    return () => window.removeEventListener("mouseout", handleMouseOut);
  }, [pathname, showModal, isClosing]);

  // Evento global
  useEffect(() => {
    const handler = () => {
      if (!pathname || !allowedRoutes.includes(pathname)) return;
      if (!document.querySelector(".modal-overlay")) {
        setShowModal(true);
      }
    };
    window.addEventListener("open-scroll-modal", handler);
    return () => window.removeEventListener("open-scroll-modal", handler);
  }, [pathname]);

  // Scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!pathname || !allowedRoutes.includes(pathname)) return;
      if (showModal || isClosing) return;
      const currentScroll = window.scrollY;
      const scrollDirection = currentScroll < lastScrollRef.current ? "up" : "down";
      lastScrollRef.current = currentScroll;

      const atBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight;
      if (atBottom) hasReachedBottomRef.current = true;

      if (hasReachedBottomRef.current && scrollDirection === "up" && !hasShownRef.current) {
        const lastClosed = parseInt(localStorage.getItem(MODAL_STORAGE_KEY) || "0", 10);
        if (Date.now() - lastClosed < MODAL_COOLDOWN_MS) return;
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

    const phoneRegex = /^9\d{8}$/;

    if (!phoneRegex.test(telefono)) {
      newErrors.telefono = "El celular debe tener 9 dígitos (Ej: 987654321)";
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

      const telefonoAEnviar = `+51${telefono}`;
      formData.append("celular", telefonoAEnviar);
      formData.append("source_id", origenCliente.INICIO);

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

  const isAllowed = allowedRoutes.includes(pathname);
  if (!isAllowed || !showModal) return null;

  return (
    <div
      id="catalog-modal"
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4 modal-overlay transition-opacity duration-500 animate-fadeIn"
    >
      <div className={`flex flex-col sm:flex-row overflow-hidden shadow-2xl w-[90%] max-w-md sm:max-w-3xl relative rounded-xl transition-all duration-500 h-[480px] ${isClosing ? "animate-slideOut" : "animate-slideIn"}`}>

        {/* Imagen */}
        <div className="absolute inset-0 sm:flex w-[80%] justify-center items-center bg-gray-100 overflow-hidden">
          <img src={asesoriaImg.src} alt="Asesoría" className="w-full h-full object-cover select-none scale-105 transition-transform duration-700" />
        </div>

        <div className="absolute inset-0 " style={{ background: "linear-gradient(to left, #00786F 0%, #018C86 45%, rgba(1, 160, 158, 0.6) 100%)" }}></div>

        <div className="hidden sm:flex sm:w-6/12 justify-center items-center relative z-10">
          <img 
            src={Logo.src} 
            alt="LogoTami" 
            className="w-55 h-55 object-contain select-none drop-shadow-2xl animate-fadeIn z-20" 
          />
        </div>

        {/* Contenido Formulario */}
        <div className="w-full sm:w-8/12 text-white relative animate-fadeInRight h-full">

          <div className="sm:py-10 p-8 sm:px-8 h-full flex flex-col justify-center gap-6">


            <button
              onClick={closeModal}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all duration-300 z-50 cursor-pointer hover:scale-110"
              aria-label="Cerrar modal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex justify-center w-full mt-4">
              <h2 className="text-2xl sm:text-3xl text-center font-medium leading-tight select-none animate-fadeInUp mb-2 text-white">
                DESCARGA <span className="font-bold">GRATIS</span>
                <br />
                NUESTRO <span className="font-bold">CATÁLOGO</span>
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-1 animate-fadeInUp mt-20 w-[85%] mx-auto">
              <input
                type="text"
                placeholder="Nombres y Apellidos"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="py-1.5 px-3 mb-0 text-sm rounded-lg bg-white text-black outline-none focus:ring-2 focus:ring-teal-400 transition-all duration-300"
              />
              <p className="text-xs text-yellow-100 min-h-[16px] mb-0">{errors.nombre}</p>


              <input
                type="tel"
                placeholder="Número de celular"
                maxLength={9}
                value={telefono}
                onChange={(e) => {
                  // Solo permite ingresar números
                  const val = e.target.value.replace(/\D/g, '');
                  setTelefono(val);
                }}
                className="py-1.5 px-3 mb-0 text-sm rounded-lg bg-white text-black outline-none focus:ring-2 focus:ring-teal-400 transition-all duration-300"
              />
              <p className="text-xs text-yellow-100 min-h-[16px] mb-0">{errors.telefono}</p>

              <input
                type="email"
                placeholder="Correo electrónico"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="py-1.5 px-3 mb-0 text-sm rounded-lg bg-white text-black outline-none focus:ring-2 focus:ring-teal-400 transition-all duration-300"
              />
              <p className={`text-xs text-center min-h-[16px] mb-0 ${errors.correo || errors.general ? "text-red-100" : successMessage ? "text-green-100" : "text-yellow-100"}`}>
                {errors.correo || errors.general || successMessage}
              </p>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  backgroundColor: buttonBgColor,
                  color: buttonTextColor,
                }}
                className="rounded w-full sm:max-w-fit py-2 px-10 text-base font-bold mx-auto mt-2 shadow-[0_4px_10px_rgba(0,0,0,0.3)] transition-all duration-300 hover:brightness-110 hover:scale-105 active:scale-95"
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