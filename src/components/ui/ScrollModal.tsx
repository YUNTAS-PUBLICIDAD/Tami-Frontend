import { useEffect, useState, useRef } from "react";
import asesoriaImg from "../../assets/images/Diseno.webp";
import Logo from "../../assets/images/logos/logo-blanco-tami.gif";
import { config, getApiUrl } from "../../../config";
import { origenCliente } from "@data/origenCliente";

const MODAL_STORAGE_KEY = "catalogModalLastClosed";
const MODAL_COOLDOWN_MS = 3 * 60 * 1000; // 3 minutos 
const SESSION_STORAGE_KEY = "catalogModalSessionShown";

interface PopupSettings {
  popup_image_url?: string;
  popup_image2_url?: string;
  popup_mobile_image_url?: string;
  popup_mobile_image2_url?: string;
  button_bg_color?: string;
  button_text_color?: string;
  popup_start_delay_minutes?: number;
}

interface ScrollModalProps {
  isPreview?: boolean;
  initialSettings?: PopupSettings;
}

const ScrollModal = ({ isPreview = false, initialSettings }: ScrollModalProps) => {
  // Hooks
  const [pathname, setPathname] = useState<string>("");
  const [showModal, setShowModal] = useState(isPreview);
  const [settings, setSettings] = useState<PopupSettings>(initialSettings || {});
  const [loadingSettings, setLoadingSettings] = useState(!isPreview);
  const [isClosing, setIsClosing] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  // Estados del formulario
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

    if (isPreview) {
      setLoadingSettings(false);
      return;
    }

    // Fetch settings
    const fetchSettings = async () => {
      try {
        const response = await fetch(getApiUrl(config.endpoints.popups.getSettings));
        if (response.ok) {
          const data = await response.json();
          // Si es un array (ej. Laravel a veces manda array de un item), tomamos el primero
          let finalSettings = Array.isArray(data) ? data[0] : data;

          // Preservar funcionalidad de "Añadir Imagen 1" desde localStorage (Preview)
          if (typeof window !== "undefined") {
            const savedImage1 = localStorage.getItem('popupImage');
            const savedImage2 = localStorage.getItem('popupImage2');
            const savedImageMobile = localStorage.getItem('popupImageMobile');
            const savedImageMobile2 = localStorage.getItem('popupImageMobile2');
            const savedBgColor = localStorage.getItem('popupBtnBgColor');
            const savedTextColor = localStorage.getItem('popupBtnTextColor');
            const savedDelay = localStorage.getItem('popupDelay');

            if (savedImage1) finalSettings = { ...finalSettings, popup_image_url: savedImage1 };
            if (savedImage2) finalSettings = { ...finalSettings, popup_image2_url: savedImage2 };
            if (savedImageMobile) finalSettings = { ...finalSettings, popup_mobile_image_url: savedImageMobile };
            if (savedImageMobile2) finalSettings = { ...finalSettings, popup_mobile_image2_url: savedImageMobile2 };
            if (savedBgColor) finalSettings = { ...finalSettings, button_bg_color: savedBgColor };
            if (savedTextColor) finalSettings = { ...finalSettings, button_text_color: savedTextColor };
            if (savedDelay) finalSettings = { ...finalSettings, popup_start_delay_minutes: parseInt(savedDelay) };
          }

          setSettings(finalSettings);
        }
      } catch (err) {
        console.error("Error fetching popup settings:", err);
      } finally {
        setLoadingSettings(false);
      }
    };
    fetchSettings();
  }, [isPreview]);

  // Preview event listener
  useEffect(() => {
    if (!isPreview) return;

    const handlePreviewUpdate = (e: any) => {
      const { settings: newSettings, mode } = e.detail;
      console.log("[ScrollModal] Preview update received:", { newSettings, mode });

      if (newSettings) {
        setSettings((prev) => {
          const updated = { ...prev, ...newSettings };
          console.log("[ScrollModal] New settings state:", updated);
          return updated;
        });
      }
      if (mode) {
        setPreviewMode(mode);
      }
    };

    window.addEventListener("update-popup-preview", handlePreviewUpdate);
    return () => window.removeEventListener("update-popup-preview", handlePreviewUpdate);
  }, [isPreview]);

  // Mostrar modal automáticamente por tiempo
  useEffect(() => {
    if (isPreview) return; // Bypasear todo en preview
    if (!pathname || !allowedRoutes.includes(pathname)) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let intervalId: ReturnType<typeof setInterval> | null = null;

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
      // Usar delay de la base de datos o 5 segundos por defecto
      const delayMs = (settings?.popup_start_delay_minutes || 1) * 60 * 1000;
      console.log(`[ScrollModal] El popup se mostrará en ${delayMs / 1000} segundos.`);

      let remainingSeconds = delayMs / 1000;
      intervalId = setInterval(() => {
        remainingSeconds -= 1;
        if (remainingSeconds > 0) {
          console.log(`[ScrollModal] Tiempo restante para el popup: ${remainingSeconds} segundos...`);
        } else {
          if (intervalId) clearInterval(intervalId);
        }
      }, 1000);

      timer = setTimeout(() => {
        setShowModal(true);
        hasShownRef.current = true;
        sessionStorage.setItem(SESSION_STORAGE_KEY, "true");
        if (intervalId) clearInterval(intervalId);
        console.log("[ScrollModal] ¡Popup mostrado!");
      }, delayMs);
    }
    return () => {
      if (timer) clearTimeout(timer);
      if (intervalId) clearInterval(intervalId);
    };
  }, [pathname, showModal, isClosing, settings?.popup_start_delay_minutes]);

  // Intención de salida
  useEffect(() => {
    if (isPreview) return;
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
    if (isPreview) return;
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
    if (isPreview) return;
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

  const isAllowed = isPreview || allowedRoutes.includes(pathname);
  if (!isAllowed || !showModal) return null;

  return (
    <div
      id="catalog-modal"
      className={`${isPreview ? "absolute inset-0 z-10" : "fixed inset-0 bg-black/60 z-50"} flex items-center justify-center ${isPreview && previewMode === 'desktop' ? '' : 'px-4'} modal-overlay transition-opacity duration-500 animate-fadeIn`}
    >
      <div className={`flex ${isPreview ? (previewMode === 'mobile' ? 'flex-col max-w-md w-[95%] h-[600px] rounded-2xl' : 'flex-row w-full h-full rounded-xl') : 'flex-col sm:flex-row max-w-md sm:max-w-4xl w-[95%] h-[600px] sm:h-[550px] rounded-2xl'} overflow-hidden shadow-2xl relative transition-all duration-500 bg-white ${isClosing ? "animate-slideOut" : "animate-slideIn"}`}>

        {/* ========================================================= */}
        {/* DESKTOP: LADO IZQUIERDO (IMAGEN 1)                          */}
        {/* ========================================================= */}
        <div className={`${isPreview ? (previewMode === 'mobile' ? 'hidden' : 'block') : 'hidden sm:block'} relative w-1/2 h-full overflow-hidden bg-white`}>
          {/* Imagen 1 (Fondo izquierdo) */}
          <img
            src={settings?.popup_image_url || asesoriaImg.src}
            alt="Imagen Izquierda"
            className="absolute inset-0 w-full h-full object-cover select-none scale-105"
          />
        </div>

        {/* ========================================================= */}
        {/* LADO DERECHO (ESCRITORIO) / COMPLETO (MÓVIL)                */}
        {/* ========================================================= */}
        <div className={`relative ${isPreview ? (previewMode === 'mobile' ? 'w-full' : 'w-1/2') : 'w-full sm:w-1/2'} h-full flex flex-col overflow-hidden`}>

          {/* FONDO ESCRITORIO (IMAGEN 2) */}
          <div className={`${isPreview ? (previewMode === 'mobile' ? 'hidden' : 'block') : 'block sm:block'} absolute inset-0`}>
            {/* Imagen 2 (Fondo derecho) */}
            <img
              src={settings?.popup_image2_url || asesoriaImg.src}
              alt="Imagen Derecha"
              className="w-full h-full object-cover select-none"
            />
          </div>

          <div className={`${isPreview ? (previewMode === 'mobile' ? 'flex' : 'hidden') : 'flex sm:hidden'} absolute inset-0 flex-col bg-teal-800`}>
            {/* Imagen Móvil 1 (Arriba) */}
            <div className="h-1/2 w-full relative overflow-hidden border-b border-teal-700/30">
              {settings?.popup_mobile_image_url ? (
                <img
                  src={settings?.popup_mobile_image_url}
                  alt="Imagen Móvil 1"
                  className="w-full h-full object-cover select-none"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-teal-200/20 text-2xl font-black uppercase tracking-widest rotate-[-15deg] select-none text-center px-4">
                  [Imagen móvil 1]
                </div>
              )}
            </div>
            
            {/* Imagen Móvil 2 (Abajo) */}
            <div className="h-1/2 w-full relative overflow-hidden">
              {settings?.popup_mobile_image2_url ? (
                <img
                  src={settings?.popup_mobile_image2_url}
                  alt="Imagen Móvil 2"
                  className="w-full h-full object-cover select-none"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-teal-200/20 text-2xl font-black uppercase tracking-widest rotate-[-15deg] select-none text-center px-4">
                  [Imagen móvil 2]
                </div>
              )}
            </div>
          </div>

          {/* Contenido Formulario (Mantiene la estructura original) */}
          <div className="relative z-10 w-full text-white animate-fadeInRight h-full">
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
              <div className="flex justify-center w-full mt-4 min-h-[72px]">
                {/* Espacio reservado para el título originalmente aquí. 
                  Se mantiene el div de 72px de altura para no afectar la posición del formulario. */}
              </div>

              <form onSubmit={handleSubmit} className={`flex flex-col gap-2 animate-fadeInUp ${isPreview ? (previewMode === 'mobile' ? 'mt-auto mb-10' : 'mt-36') : 'mt-auto mb-10 sm:mt-36'} w-full max-w-[320px] mx-auto`}>
                <div>
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="h-10 w-full rounded-full bg-[#EAEAEA] border border-[#d5d5d5] px-6 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-teal-400 transition-all duration-300 placeholder:text-gray-400 shadow-inner"
                  />
                  {errors.nombre && <p className="text-xs text-yellow-100 mt-1 pl-2 mb-0">{errors.nombre}</p>}
                </div>

                <div>
                  <input
                    type="tel"
                    placeholder="Teléfono"
                    maxLength={9}
                    value={telefono}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setTelefono(val);
                    }}
                    className="h-10 w-full rounded-full bg-[#EAEAEA] border border-[#d5d5d5] px-6 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-teal-400 transition-all duration-300 placeholder:text-gray-400 shadow-inner"
                  />
                  {errors.telefono && <p className="text-xs text-yellow-100 mt-1 pl-2 mb-0">{errors.telefono}</p>}
                </div>

                <div>
                  <input
                    type="email"
                    placeholder="Correo"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    className="h-10 w-full rounded-full bg-[#EAEAEA] border border-[#d5d5d5] px-6 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-teal-400 transition-all duration-300 placeholder:text-gray-400 shadow-inner"
                  />
                  {(errors.correo || errors.general || successMessage) && (
                    <p className={`text-xs text-center mt-1 mb-0 ${errors.correo || errors.general ? "text-red-100" : successMessage ? "text-green-100" : "text-yellow-100"}`}>
                      {errors.correo || errors.general || successMessage}
                    </p>
                  )}
                </div>

                <div className="mt-6 flex justify-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      backgroundColor: settings?.button_bg_color || "#4FB9AF",
                      color: settings?.button_text_color || "#ffffff"
                    }}
                    className="rounded-full w-fit py-2 px-4 text-sm uppercase font-black tracking-[0.2em] shadow-[0_4px_10px_rgba(0,0,0,0.3)] transition-all duration-300 hover:brightness-90 hover:scale-105 active:scale-95"
                  >
                    {isSubmitting ? "Enviando..." : "CONOCER MÁS"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrollModal;