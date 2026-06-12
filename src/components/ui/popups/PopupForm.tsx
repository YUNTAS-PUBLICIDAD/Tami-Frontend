import React from "react";
import asesoriaImg from "../../../assets/images/Diseno.webp";
import type { PopupSettings } from "../../../hooks/usePopupLogic";
import { User, Mail } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

interface PopupFormProps {
  isPreview: boolean;
  showModal: boolean;
  settings: PopupSettings;
  isClosing: boolean;
  previewMode: "desktop" | "mobile";
  nombre: string;
  telefono: string;
  correo: string;
  errors: { [key: string]: string };
  isSubmitting: boolean;
  setNombre: (val: string) => void;
  setTelefono: (val: string) => void;
  setCorreo: (val: string) => void;
  closeModal: () => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  isAllowed: boolean;
}

const PopupForm = ({
  isPreview,
  showModal,
  settings,
  isClosing,
  previewMode,
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
  isAllowed,
}: PopupFormProps) => {
  /*if (!true) return null;*/ //para probar alerta
  if (!isAllowed || !showModal) return null;
  const isMobilePreview = isPreview && previewMode === "mobile";

  return (
    <div
      id="catalog-modal"
      className={`${isPreview ? "absolute inset-0 z-10" : "fixed inset-0 bg-black/60 backdrop-blur-sm z-50"} flex items-center justify-center ${isPreview && previewMode === "desktop" ? "" : "px-4"} modal-overlay ${isClosing ? "animate-fadeOut" : "animate-fadeIn"}`}
    >
      <div
        className={`flex ${isPreview ? (previewMode === "mobile" ? "flex-col w-[448px] max-w-none rounded-2xl shadow-2xl" : "flex-row w-[896px] max-w-none h-[550px] rounded-2xl shadow-lg border-none translate-y-0") : "flex-col sm:flex-row w-[448px] max-w-none h-[640px] sm:w-[85%] sm:max-w-4xl sm:h-[550px] rounded-2xl shadow-2xl"} overflow-hidden relative transition-all duration-500 ${!isPreview ? "bg-[#0f172a]" : "bg-white"} ${isClosing ? "animate-fadeOut" : "animate-fadeIn"}`}
        style={isPreview && previewMode === "mobile" ? { height: "640px" } : {}}
      >
        {/* DESKTOP Image 1 */}
        <div
          className={`${isPreview ? (previewMode === "mobile" ? "hidden" : "block") : "hidden sm:block"} relative w-1/2 h-full overflow-hidden bg-white`}
        >
          <img
            src={settings?.popup_image_url || asesoriaImg.src}
            alt="Imagen Izquierda"
            className={`absolute inset-0 w-full h-full object-cover object-center select-none scale-100`}
          />
        </div>

        {/* Form Column */}
        <div
          className={`relative ${isPreview ? (previewMode === "mobile" ? "w-full" : "w-1/2") : "w-full sm:w-1/2"} h-full flex flex-col overflow-hidden`}
        >
          {/* DESKTOP Background (Image 2) */}
          <div
            className={`${isPreview ? (previewMode === "mobile" ? "hidden" : "block") : "block sm:block"} absolute inset-0`}
          >
            <img
              src={settings?.popup_image2_url || asesoriaImg.src}
              alt="Imagen Derecha"
              className="w-full h-full object-cover select-none"
            />
          </div>

          {/* MOBILE View Background */}
          <div
            className={`${isPreview ? (previewMode === "mobile" ? "block" : "hidden") : "block sm:hidden"} bg-[#0f172a] overflow-hidden`}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "640px" }}
          >
            {(() => {
              const showTwoImages = settings?.popup_mobile_image_count === 2 && !!settings?.popup_mobile_image_url && !!settings?.popup_mobile_image2_url;
              if (showTwoImages) {
                return (
                  <>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "420px", overflow: "hidden", background: "#0f172a" }}>
                      <img
                        src={settings?.popup_mobile_image_url}
                        alt="Imagen Móvil 1"
                        style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
                      />
                    </div>
                    <div style={{ position: "absolute", top: "420px", left: 0, right: 0, height: "220px", overflow: "hidden", background: "#0f172a" }}>
                      <img
                        src={settings?.popup_mobile_image2_url}
                        alt="Imagen Móvil 2"
                        style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
                      />
                    </div>
                  </>
                );
              }

              return (
                <div style={{ width: "100%", height: "640px", overflow: "hidden", background: "#0f172a" }}>
                  <img
                    src={settings?.popup_mobile_image_url || settings?.popup_mobile_image2_url || asesoriaImg.src}
                    alt="Imagen Móvil"
                    style={{ display: "block", width: "100%", height: "100%", objectFit: "contain", objectPosition: "center" }}
                  />
                </div>
              );
            })()}
          </div>

          {/* Form Content */}
          <div className="relative z-10 w-full text-white animate-fadeInRight h-full">
            <div className={`${isMobilePreview ? "py-6 px-6 pb-2" : "sm:py-10 p-6 pb-2 sm:px-8"} h-full flex flex-col justify-start gap-6`}>
              {/* Close Button */}
              <button
                onClick={closeModal}
                className={`${isMobilePreview ? "top-3 right-3" : "top-3 right-3 sm:top-4 sm:right-4"} absolute bg-white text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all duration-300 z-50 cursor-pointer hover:scale-110`}
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

              <div className={`flex justify-center w-full mt-4 ${isMobilePreview ? "min-h-[50px]" : "min-h-[50px] sm:min-h-[72px]"}`}>
                {/* Reserved space for title */}
              </div>

              <form
                onSubmit={handleSubmit}
                className={`flex flex-col gap-0.5 animate-fadeInUp ${isPreview ? (previewMode === "mobile" ? "mt-auto mb-2 max-w-[185px]" : "mt-35 mb-[40px] max-w-[280px]") : "mt-auto mb-[18px] sm:mb-4 sm:mt-35 max-w-[185px] sm:max-w-[280px] sm:translate-y-0"} w-full mx-auto`}
              >
                <div className={`relative ${isMobilePreview ? "mb-1" : "mb-1 sm:mb-3"}`}>
                  {errors.general_top && (
                    <p className="absolute bottom-full left-1/2 -translate-x-1/2 w-[250px] sm:w-full text-[10px] sm:text-sm font-bold text-[#FF0000] text-center mb-1 leading-tight">
                      {errors.general_top}
                    </p>
                  )}
                  <div className={`absolute ${isMobilePreview ? "left-3 scale-75" : "left-3 sm:left-4 scale-75 sm:scale-100"} top-1/2 -translate-y-1/2 text-[#1B7C72] flex items-center justify-center`}>
                    <User size={20} />
                  </div>
                  <input
                    type="text"
                    name="nombre"
                    placeholder="Tu nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className={`w-full rounded-full bg-white border border-[#d5d5d5] outline-none focus:ring-2 focus:ring-teal-400 transition-all duration-300 placeholder:text-gray-400 shadow-sm text-gray-600 ${isPreview && previewMode === "mobile" ? "h-[36px] pl-10 pr-4 text-[10px]" : "h-[33px] sm:h-11 pl-10 sm:pl-12 pr-4 sm:px-6 text-[10px] sm:text-sm"}`}
                  />
                </div>

                <div className={`relative ${isMobilePreview ? "mb-1" : "mb-1 sm:mb-3"}`}>
                  <div className={`absolute ${isMobilePreview ? "left-3 scale-75" : "left-3 sm:left-4 scale-75 sm:scale-100"} top-1/2 -translate-y-1/2 text-[#1B7C72] flex items-center justify-center`}>
                    <FaWhatsapp size={20} />
                  </div>
                  <input
                    type="tel"
                    name="telefono"
                    placeholder="Tu WhatsApp"
                    maxLength={9}
                    value={telefono}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setTelefono(val);
                    }}
                    className={`w-full rounded-full bg-white border border-[#d5d5d5] outline-none focus:ring-2 focus:ring-teal-400 transition-all duration-300 placeholder:text-gray-400 shadow-sm text-gray-600 ${isPreview && previewMode === "mobile" ? "h-[28px] pl-10 pr-4 text-[10px]" : "h-[33px] sm:h-11 pl-10 sm:pl-12 pr-4 sm:px-6 text-[10px] sm:text-sm"}`}
                  />
                </div>

                <div className={`relative ${isMobilePreview ? "mb-0" : "mb-0 sm:mb-3"}`}>
                  <div className={`absolute ${isMobilePreview ? "left-3 scale-75" : "left-3 sm:left-4 scale-75 sm:scale-100"} top-1/2 -translate-y-1/2 text-[#1B7C72] flex items-center justify-center`}>
                    <Mail size={20} />
                  </div>
                  <input
                    type="email"
                    name="correo"
                    placeholder="Tu correo"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    className={`w-full  rounded-full bg-white border border-[#d5d5d5] outline-none focus:ring-2 focus:ring-teal-400 transition-all duration-300 placeholder:text-gray-400 shadow-sm text-gray-600 ${isPreview && previewMode === "mobile" ? "h-[28px] pl-10 pr-4 text-[10px]" : "h-[33px] sm:h-11 pl-10 sm:pl-12 pr-4 sm:px-6 text-[10px] sm:text-sm"}`}
                  />
                  {errors.general && !errors.general_top && (
                    <p className={`absolute left-0 right-0 top-10 text-[10px] text-center mb-0 mt-0.5 leading-none ${errors.general.includes("success") || errors.general.includes("éxito") ? "text-green-100" : "text-red-500"}`}>
                      {errors.general}
                    </p>
                  )}
                </div>

                <div className="mt-1 flex justify-center w-full h-auto">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      backgroundColor: settings?.button_bg_color || "#4FB9AF",
                      color: settings?.button_text_color || "#ffffff",
                    }}
                    className={`cursor-pointer rounded-2xl w-full w-11/12 h-auto uppercase font-black text-center break-words shadow-[0_4px_10px_rgba(0,0,0,0.3)] transition-all duration-300 hover:brightness-90 hover:scale-105 active:scale-95 ${isPreview && previewMode === "mobile"
                        ? "py-3 px-4 text-xs tracking-[0.15em]"
                        : "py-3 px-6 text-xs sm:py-3.5 sm:px-8 sm:text-sm tracking-[0.15em] sm:tracking-[0.2em]"
                      }`}
                    title={settings?.button_text || "CONOCER MAS"}
                  >
                    {isSubmitting ? "Enviando..." : (settings?.button_text || "CONOCER MAS")}
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

export default PopupForm;
