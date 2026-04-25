import { useEffect, useState, useRef } from "react";
import { config, getApiUrl } from "../../config";
import { origenCliente } from "@data/origenCliente";

const MODAL_STORAGE_KEY = "catalogModalLastClosed";
const MODAL_COOLDOWN_MS = 3 * 60 * 1000; // 3 minutos 

export interface PopupSettings {
  popup_image_url?: string;
  popup_image2_url?: string;
  popup_mobile_image_url?: string;
  popup_mobile_image2_url?: string;
  button_bg_color?: string;
  button_text_color?: string;
  button_text?: string;
  popup_start_delay_minutes?: number;
}

export interface UsePopupLogicProps {
  isPreview?: boolean;
  initialSettings?: PopupSettings;
}

export const usePopupLogic = ({ isPreview = false, initialSettings }: UsePopupLogicProps) => {
  const [pathname, setPathname] = useState<string>(() => 
    typeof window !== "undefined" ? window.location.pathname : ""
  );
  const [showModal, setShowModal] = useState(isPreview);
  const [settings, setSettings] = useState<PopupSettings>(initialSettings || {});
  const [loadingSettings, setLoadingSettings] = useState(!isPreview);
  const [isClosing, setIsClosing] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [isDelayFinished, setIsDelayFinished] = useState(false);

  // Form states
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const isProductDetail = pathname.startsWith("/productos/") && pathname !== "/productos";

  useEffect(() => {
    if (typeof window === "undefined") return;

    setPathname(window.location.pathname);
    
    const handleLocationChange = () => {
      setPathname(window.location.pathname);
    };

    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  useEffect(() => {
    if (isPreview) {
      setLoadingSettings(false);
      return;
    }

    const fetchSettings = async () => {
      try {
        // 1. Fetch Global Settings
        const response = await fetch(getApiUrl(`${config.endpoints.popups.getSettings}?t=${Date.now()}`));
        let globalData: any = {};
        if (response.ok) {
          const responseData = await response.json();
          globalData = responseData.data || responseData;
        }

        let finalSettings: PopupSettings = {
          ...globalData,
          popup_image_url: globalData.image1 || globalData.popup_image_url,
          popup_image2_url: globalData.image2 || globalData.popup_image2_url,
          popup_mobile_image_url: globalData.imageMobile || globalData.popup_mobile_image_url,
          popup_mobile_image2_url: globalData.imageMobile2 || globalData.popup_mobile_image2_url,
          button_text: globalData.button_text || globalData.btnText || "CONOCER MAS",
          popup_start_delay_minutes: globalData.popup_start_delay_minutes || globalData.popupInicioDelay || 60,
        };

        // 2. If it's a product detail page, override with product-specific settings
        if (isProductDetail) {
          const parts = pathname.split("/").filter(Boolean);
          const productLink = parts[parts.length - 1];
          
          finalSettings.popup_start_delay_minutes = globalData.product_popup_delay_minutes || globalData.popupProductosDelay || 60;

          if (productLink) {
            try {
              const prodRes = await fetch(getApiUrl(`/api/v1/productos/link/${productLink}?t=${Date.now()}`));
              if (prodRes.ok) {
                const prodJson = await prodRes.json();
                const product = prodJson.data || prodJson;
                console.log("✅ Product data loaded:", product);

                const imagenPopup = product.producto_imagenes?.find((img: any) => img.tipo === "popup");
                const imagenPopup2 = product.producto_imagenes?.find((img: any) => {
                  const tipo = (img.tipo || "").toLowerCase();
                  return tipo === "popup2" || tipo === "popup_2";
                });

                finalSettings = {
                  ...finalSettings,
                  popup_image_url: imagenPopup ? `${config.apiUrl}${imagenPopup.url_imagen}` : finalSettings.popup_image_url,
                  popup_image2_url: imagenPopup2 ? `${config.apiUrl}${imagenPopup2.url_imagen}` : finalSettings.popup_image2_url,
                  popup_mobile_image_url: imagenPopup ? `${config.apiUrl}${imagenPopup.url_imagen}` : finalSettings.popup_mobile_image_url,
                  popup_mobile_image2_url: imagenPopup2 ? `${config.apiUrl}${imagenPopup2.url_imagen}` : finalSettings.popup_mobile_image2_url,
                  button_bg_color: product.etiqueta?.popup_button_color || finalSettings.button_bg_color,
                  button_text_color: product.etiqueta?.popup_text_color || finalSettings.button_text_color,
                  button_text: product.etiqueta?.popup_button_text || "¡COTIZA AHORA!",
                };
              } else {
                console.warn("⚠️ Product fetch failed with status:", prodRes.status);
              }
            } catch (e) {
              console.error("❌ Error fetching product-specific data:", e);
            }
          }
        }

        setSettings(finalSettings);
      } catch (err) {
        console.error("❌ fetchSettings error:", err);
      } finally {
        setLoadingSettings(false);
      }
    };
    if (pathname) {
      fetchSettings();
    }
  }, [isPreview, pathname, isProductDetail]);

  // Preview event listener
  useEffect(() => {
    if (!isPreview) return;

    const handlePreviewUpdate = (e: any) => {
      const { settings: newSettings, mode } = e.detail;
      if (newSettings) {
        setSettings((prev) => ({ ...prev, ...newSettings }));
      }
      if (mode) {
        setPreviewMode(mode);
      }
    };

    window.addEventListener("update-popup-preview", handlePreviewUpdate);
    return () => window.removeEventListener("update-popup-preview", handlePreviewUpdate);
  }, [isPreview]);

  // Auto-time modal
  useEffect(() => {
    if (isPreview) return;
    
    if (!pathname || (!allowedRoutes.includes(pathname) && !isProductDetail)) {
      return;
    }

    let intervalId: ReturnType<typeof setInterval> | null = null;

    const isAnyModalOpen = document.querySelector(".modal-overlay");
    const isCatalogModalOpen = document.getElementById("catalog-modal");

    if (!loadingSettings && !hasShownRef.current && !isAnyModalOpen && !isCatalogModalOpen && !showModal) {
      const delaySeconds = settings?.popup_start_delay_minutes ?? 60;
      const delayMs = delaySeconds * 1000;
      let remainingSeconds = Math.max(0, Math.floor(delayMs / 1000));

      if (remainingSeconds === 0) {
        setShowModal(true);
        hasShownRef.current = true;
        setIsDelayFinished(true);
        return;
      }

      intervalId = setInterval(() => {
        remainingSeconds -= 1;
        
        if (remainingSeconds <= 0) {
          setShowModal(true);
          hasShownRef.current = true;
          setIsDelayFinished(true);
          if (intervalId) clearInterval(intervalId);
        }
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [pathname, showModal, isClosing, loadingSettings, settings?.popup_start_delay_minutes]);

  // Exit Intent
  useEffect(() => {
    if (isPreview) return;
    const handleMouseOut = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        if (showModal || isClosing || !isDelayFinished) return;
        const lastClosed = parseInt(localStorage.getItem(MODAL_STORAGE_KEY) || "0", 10);
        const now = Date.now();
        const isAnyModalOpen = document.querySelector(".modal-overlay");

        if (now - lastClosed >= MODAL_COOLDOWN_MS && !hasShownRef.current && !isAnyModalOpen && !showModal) {
          setShowModal(true);
          hasShownRef.current = true;
          console.log("[usePopupLogic] Popup triggered by exit intent.");
        }
      }
    };
    window.addEventListener("mouseout", handleMouseOut);
    return () => window.removeEventListener("mouseout", handleMouseOut);
  }, [pathname, showModal, isClosing, isDelayFinished]);

  // Global manual trigger
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

  // Scroll trigger
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

      if (hasReachedBottomRef.current && scrollDirection === "up" && !hasShownRef.current && isDelayFinished) {
        const lastClosed = parseInt(localStorage.getItem(MODAL_STORAGE_KEY) || "0", 10);
        if (Date.now() - lastClosed < MODAL_COOLDOWN_MS) return;
        setShowModal(true);
        hasShownRef.current = true;
        hasReachedBottomRef.current = false;
        console.log("[usePopupLogic] Popup triggered by scroll.");
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname, showModal, isClosing, isDelayFinished]);

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
    }, 1000);
  };

  const validateForm = (formValues: { nombre: string; telefono: string; correo: string }) => {
    const { nombre, telefono, correo } = formValues;
    const newErrors: { [key: string]: string } = {};
    if (!nombre || nombre.length < 3 || nombre.length > 75) {
      newErrors.general_top = "Ingresa un nombre valido (3 a 75 caracteres)";
      setErrors(newErrors);
      return false;
    }

    if (!/^\d{9}$/.test(telefono)) {
      newErrors.general_top = "Ingresa un telefono valido de 9 digitos";
      setErrors(newErrors);
      return false;
    }

    if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      newErrors.general_top = "Ingresa un correo valido";
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formElement = e.currentTarget as HTMLFormElement;
    const submittedFormData = new FormData(formElement);

    const submittedNombre = (submittedFormData.get("nombre")?.toString() ?? nombre).trim();
    const submittedTelefono = (submittedFormData.get("telefono")?.toString() ?? telefono)
      .replace(/\D/g, "")
      .trim();
    const submittedCorreo = (submittedFormData.get("correo")?.toString() ?? correo).trim();

    setNombre(submittedNombre);
    setTelefono(submittedTelefono);
    setCorreo(submittedCorreo);

    if (!validateForm({ nombre: submittedNombre, telefono: submittedTelefono, correo: submittedCorreo })) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", submittedNombre);
      formData.append("email", submittedCorreo);
      formData.append("celular", `+51${submittedTelefono}`);
      formData.append("source_id", origenCliente.INICIO);

      const response = await fetch(getApiUrl(config.endpoints.popups.submit), {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (errorData?.errors) {
          const newErrors: { [key: string]: string } = {};
          if (errorData.errors.name) newErrors.nombre = errorData.errors.name.join(" ");
          if (errorData.errors.celular) newErrors.telefono = errorData.errors.celular.join(" ");
          if (errorData.errors.email) newErrors.correo = errorData.errors.email.join(" ");
          setErrors(newErrors);
        } else {
          setErrors({ general: "No se pudo enviar la información. Intenta nuevamente." });
        }
        return;
      }

      setErrors({ general: "✅ Información enviada con éxito ✅" });
      setTimeout(() => {
        closeModal();
        setErrors({});
      }, 1000);
    } catch (err: any) {
      console.error("[usePopupLogic] Error submitting form:", err);
      setErrors({ general: err.message || "Error desconocido." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    showModal,
    settings,
    isClosing,
    previewMode,
    isDelayFinished,
    nombre,
    telefono,
    correo,
    errors,
    isSubmitting,
    setNombre,
    setTelefono,
    setCorreo,
    closeModal,
    handleSubmit,
    isAllowed: isPreview || allowedRoutes.includes(pathname) || isProductDetail,
  };
};
