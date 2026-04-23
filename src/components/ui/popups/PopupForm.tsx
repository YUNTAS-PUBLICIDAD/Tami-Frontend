import React from "react";
import asesoriaImg from "../../../assets/images/Diseno.webp";
import type { PopupSettings } from "../../../hooks/usePopupLogic";

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
  if (!isAllowed || !showModal) return null;

  return (
    <div
      id="catalog-modal"
      className={`${isPreview ? "absolute inset-0 z-10" : "fixed inset-0 bg-black/60 z-[9999]"} flex items-center justify-center ${isPreview && previewMode === "desktop" ? "" : "px-4"} modal-overlay ${isClosing ? "animate-fadeOut" : "animate-fadeIn"}`}
    >
      <div
        className={`flex ${isPreview ? (previewMode === "mobile" ? "flex-col w-[320px] max-w-none h-[600px] rounded-[28px] shadow-none" : "flex-row w-[896px] max-w-none h-[550px] rounded-2xl shadow-lg border-none translate-y-0") : "flex-col sm:flex-row max-w-md sm:max-w-4xl w-[95%] h-[600px] sm:h-[550px] rounded-2xl shadow-2xl"} overflow-hidden relative transition-all duration-500 bg-white ${isClosing ? "animate-fadeOut" : "animate-fadeIn"}`}
      >
        {/* DESKTOP Image 1 */}
        <div
          className={`${isPreview ? (previewMode === "mobile" ? "hidden" : "block") : "hidden sm:block"} relative w-1/2 h-full overflow-hidden bg-white`}
        >
          <img
            src={settings?.popup_image_url || asesoriaImg.src}
            alt="Imagen Izquierda"
            className={`absolute inset-0 w-full h-full object-cover select-none ${isPreview && previewMode === "desktop" ? "scale-100" : "scale-105"}`}
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

          {/* MOBILE View Background (Images 1 & 2) */}
          <div
            className={`${isPreview ? (previewMode === "mobile" ? "flex" : "hidden") : "flex sm:hidden"} absolute inset-0 flex-col bg-white overflow-hidden`}
          >
            <div className="h-1/2 w-full relative overflow-hidden">
              {settings?.popup_mobile_image_url ? (
                <img
                  src={settings.popup_mobile_image_url}
                  alt="Imagen Móvil 1"
                  className="w-full h-full object-cover select-none"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-black/20 text-2xl font-black uppercase tracking-widest rotate-[-15deg] select-none text-center px-4">
                  [IMAGEN MÓVIL 1]
                </div>
              )}
            </div>

            <div className="flex-1 w-full relative overflow-hidden -mt-1">
              {settings?.popup_mobile_image2_url ? (
                <img
                  src={settings.popup_mobile_image2_url}
                  alt="Imagen Móvil 2"
                  className="w-full h-full object-cover select-none"
                />
              ) : (
                <div className="w-full h-full flex items-start justify-center pt-10 text-black/20 text-2xl font-black uppercase tracking-widest rotate-[-15deg] select-none text-center px-4">
                  [IMAGEN MÓVIL 2]
                </div>
              )}
            </div>
          </div>

          {/* Form Content */}
          <div className="relative z-10 w-full text-white animate-fadeInRight h-full">
            <div className="sm:py-10 p-8 pb-2 sm:px-8 h-full flex flex-col justify-start gap-6">
              {/* Close Button */}
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
                {/* Reserved space for title */}
              </div>

              <form
                onSubmit={handleSubmit}
                className={`flex flex-col gap-0 animate-fadeInUp ${isPreview ? (previewMode === "mobile" ? "mt-auto mb-2 max-w-[175px]" : "mt-48 mb-4 max-w-[320px]") : "mt-auto mb-2 sm:mb-4 sm:mt-48 max-w-[185px] sm:max-w-[320px]"} w-full mx-auto`}
              >
                <div className="relative mb-2 sm:mb-3">
                  {errors.general_top && (
                    <p className="absolute bottom-full left-1/2 -translate-x-1/2 w-[250px] sm:w-full text-[10px] sm:text-sm font-bold text-[#FF0000] text-center mb-1 leading-tight">
                      {errors.general_top}
                    </p>
                  )}
                  <input
                    type="text"
                    name="nombre"
                    placeholder="Nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className={`w-full rounded-full bg-[#EAEAEA] border border-[#d5d5d5] outline-none focus:ring-2 focus:ring-teal-400 transition-all duration-300 placeholder:text-gray-400 shadow-inner text-gray-600 ${isPreview && previewMode === "mobile" ? "h-[30px] px-4 text-xs" : "h-[30px] sm:h-10 px-4 sm:px-6 text-xs sm:text-sm"}`}
                  />
                </div>

                <div className="relative mb-2 sm:mb-3">
                  <input
                    type="tel"
                    name="telefono"
                    placeholder="Teléfono"
                    maxLength={9}
                    value={telefono}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setTelefono(val);
                    }}
                    className={`w-full rounded-full bg-[#EAEAEA] border border-[#d5d5d5] outline-none focus:ring-2 focus:ring-teal-400 transition-all duration-300 placeholder:text-gray-400 shadow-inner text-gray-600 ${isPreview && previewMode === "mobile" ? "h-[30px] px-4 text-xs" : "h-[30px] sm:h-10 px-4 sm:px-6 text-xs sm:text-sm"}`}
                  />
                </div>

                <div className="relative mb-2 sm:mb-3">
                  <input
                    type="email"
                    name="correo"
                    placeholder="Correo"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    className={`w-full rounded-full bg-[#EAEAEA] border border-[#d5d5d5] outline-none focus:ring-2 focus:ring-teal-400 transition-all duration-300 placeholder:text-gray-400 shadow-inner text-gray-600 ${isPreview && previewMode === "mobile" ? "h-[30px] px-4 text-xs" : "h-[30px] sm:h-10 px-4 sm:px-6 text-xs sm:text-sm"}`}
                  />
                  {errors.general && !errors.general_top && (
                    <p className={`absolute left-0 right-0 top-10 text-[10px] text-center mb-0 mt-0.5 leading-none ${errors.general.includes("success") || errors.general.includes("éxito") ? "text-green-100" : "text-red-500"}`}>
                      {errors.general}
                    </p>
                  )}
                </div>

                <div className="mt-2 flex justify-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      backgroundColor: settings?.button_bg_color || "#4FB9AF",
                      color: settings?.button_text_color || "#ffffff",
                    }}
                    className={`rounded-full w-fit uppercase font-black shadow-[0_4px_10px_rgba(0,0,0,0.3)] transition-all duration-300 hover:brightness-90 hover:scale-105 active:scale-95 ${isPreview && previewMode === "mobile" ? "py-1 px-3 text-[11px] tracking-[0.12em]" : "py-1.5 px-3.5 text-xs sm:py-2 sm:px-4 sm:text-sm tracking-[0.15em] sm:tracking-[0.2em]"}`}
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
