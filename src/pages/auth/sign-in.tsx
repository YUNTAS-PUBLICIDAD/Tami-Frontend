import React, { useState, useEffect } from "react";
import type { FormEvent } from "react";
import logoAnimado from "@images/logos/logo-blanco-tami.gif?url";
import loginBg from "@images/login_bg.jpg";
import { config } from "config"; 
import apiClient from "src/services/apiClient";
import Swal from "sweetalert2";

const SignIn: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Efecto para animación de entrada suave
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post(config.endpoints.auth.login, { email, password });
      const data = response.data;

      if (response.status === 200) {
        localStorage.setItem("token", data.data.token);

        const userInfo = {
          name:
            data.data.user?.name ||
            data.data.user?.username ||
            data.data.user?.email?.split("@")[0] ||
            "Usuario",
          role:
            data.data.user?.role ||
            data.data.user?.rol ||
            data.data.user?.tipo ||
            "Usuario",
        };

        localStorage.setItem("userInfo", JSON.stringify(userInfo));

        window.location.href = "/admin/inicio";
      } else {
        Swal.fire({
          icon: "error",
          title: "Acceso Denegado",
          text: data.message || "Credenciales incorrectas. Verifica tu información.",
          confirmButtonColor: "#3bc0b3",
          customClass: {
            popup: "rounded-2xl",
          }
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error del Sistema",
        text: "No se pudo establecer conexión con el servidor. Intenta de nuevo.",
        confirmButtonColor: "#3bc0b3",
        customClass: {
          popup: "rounded-2xl",
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up {
            animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .delay-100 { animation-delay: 100ms; }
          .delay-200 { animation-delay: 200ms; }
          .delay-300 { animation-delay: 300ms; }
        `}
      </style>

      {/* Contenedor Principal */}
      <div className="min-h-screen w-full flex font-sans bg-[#c9f2ed]">
        
        {/* PANEL IZQUIERDO - BRANDING (Oculto en móviles) */}
        <div className="hidden lg:flex w-1/2 relative bg-[#0B132B] overflow-hidden flex-col">
          {/* Fondo de imagen original - Corregido para que cargue dinámicamente */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity"
            style={{ backgroundImage: `url(${loginBg?.src || loginBg})` }}
          />
          {/* Gradiente oscuro superpuesto para mejorar legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B132B]/80 via-[#0B132B]/60 to-[#0B132B]" />

          {/* Efectos de iluminación usando tu paleta */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#3bc0b3] rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-pulse" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#8de7df] rounded-full mix-blend-screen filter blur-[120px] opacity-20" />

          {/* Contenido Visual */}
          <div className="relative z-10 flex flex-col items-center justify-between h-full p-16">
            <div className="flex-1 flex flex-col items-center justify-center w-full text-center">
              <div className={`transition-all duration-1000 transform ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <img
                  loading="lazy"
                  src={logoAnimado as string}
                  alt="Logo"
                  className="w-40 mx-auto mb-10 drop-shadow-[0_0_15px_rgba(59,192,179,0.3)]"
                />
                <h1 className="text-white text-4xl font-extrabold tracking-tight mb-4 drop-shadow-md">
                  Soluciones de maquinaria y tecnología
                </h1>
                <p className="text-[#8de7df] font-medium text-lg tracking-wide uppercase">
                  Para empresas y emprendedores
                </p>
              </div>
            </div>

            {/* Iconos */}
            <div className={`w-full max-w-lg grid grid-cols-3 gap-6 pt-10 border-t border-white/10 transition-all duration-1000 delay-300 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
              <div className="flex flex-col items-center text-center group">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:bg-[#3bc0b3]/20 group-hover:text-[#3bc0b3] transition-all duration-300 border border-white/10">
                  <svg className="w-6 h-6 text-[#c9f2ed] group-hover:text-[#3bc0b3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="text-[#c9f2ed] text-sm font-medium">Acceso<br/>seguro</span>
              </div>
              <div className="flex flex-col items-center text-center group">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:bg-[#8de7df]/20 group-hover:text-[#8de7df] transition-all duration-300 border border-white/10">
                  <svg className="w-6 h-6 text-[#c9f2ed] group-hover:text-[#8de7df]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span className="text-[#c9f2ed] text-sm font-medium">Áreas<br/>autorizadas</span>
              </div>
              <div className="flex flex-col items-center text-center group">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:bg-[#3bc0b3]/20 group-hover:text-[#3bc0b3] transition-all duration-300 border border-white/10">
                  <svg className="w-6 h-6 text-[#c9f2ed] group-hover:text-[#3bc0b3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <span className="text-[#c9f2ed] text-sm font-medium">Información<br/>protegida</span>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL DERECHO - FORMULARIO DE LOGIN */}
        {/* Usando gradiente basado en tu paleta para el fondo */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center relative bg-gradient-to-br from-[#c9f2ed] to-[#8de7df]/40 shadow-[-20px_0_40px_rgba(11,19,43,0.05)] z-20">
          

          {/* Contenedor del formulario (z-10 para que quede por encima del difuminado) */}
          <div className="w-full max-w-md px-6 sm:px-10 py-12 relative z-10">
            
            {/* Header del formulario */}
            <div className="text-center mb-8 opacity-0 animate-fade-in-up">
              <div className="w-16 h-16 bg-white border border-[#8de7df] shadow-sm rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                <svg className="w-8 h-8 text-[#3bc0b3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-[#08332f] tracking-tight">Bienvenido de nuevo</h2>
              <p className="text-[#13665f] mt-2 text-sm font-medium">Ingresa tus credenciales corporativas</p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleLogin} className="space-y-5 opacity-0 animate-fade-in-up delay-200">
              {error && (
                <div className="p-3 bg-red-50/80 border border-red-200 text-red-600 text-sm rounded-xl text-center font-bold backdrop-blur-sm">
                  {error}
                </div>
              )}
              
              {/* Input Email */}
              <div className="group">
                <label className="block text-xs font-extrabold text-[#13665f] uppercase tracking-wider mb-2 group-focus-within:text-[#08332f] transition-colors">
                  Usuario o Correo
                </label>
                <input
                  type="text"
                  name="email"
                  className="w-full px-5 py-3.5 bg-white border border-[#8de7df] rounded-xl focus:bg-white focus:border-[#3bc0b3] focus:ring-4 focus:ring-[#3bc0b3]/20 transition-all outline-none text-[#08332f] font-bold placeholder-[#13665f]/50 backdrop-blur-sm shadow-sm"
                  placeholder="ejemplo@yuntas.com"
                  required
                />
              </div>

              {/* Input Password */}
              <div className="group relative">
                <label className="block text-xs font-extrabold text-[#13665f] uppercase tracking-wider mb-2 group-focus-within:text-[#08332f] transition-colors">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="w-full px-5 py-3.5 bg-white border border-[#8de7df] rounded-xl focus:bg-white focus:border-[#3bc0b3] focus:ring-4 focus:ring-[#3bc0b3]/20 transition-all outline-none text-[#08332f] font-bold placeholder-[#13665f]/50 pr-12 backdrop-blur-sm shadow-sm"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#13665f] hover:text-[#08332f] transition-colors focus:outline-none p-1 rounded-md"
                    aria-label="Mostrar u ocultar contraseña"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c1.665 0 3.246-.39 4.646-1.078M6.228 6.228A10.451 10.451 0 0112 4.5c4.756 0 8.774 3.162 10.066 7.5a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l12.544 12.544" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Botón CTA (Usando tu color principal) */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative overflow-hidden group bg-[#3bc0b3] hover:bg-[#2fa095] text-white py-4 rounded-xl text-sm font-black tracking-widest uppercase shadow-[0_8px_20px_-6px_rgba(59,192,179,0.6)] transition-all duration-300 hover:shadow-[0_12px_25px_-6px_rgba(59,192,179,0.8)] disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5 mt-4"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    AUTENTICANDO...
                  </span>
                ) : (
                  <span className="relative z-10">Ingresar al Sistema</span>
                )}
                {/* Efecto de brillo en hover */}
                <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              </button>
            </form>

            {/* Footer / Volver */}
            <div className="mt-12 text-center opacity-0 animate-fade-in-up delay-300">
              <a
                href="/"
                className="inline-flex items-center justify-center px-6 py-2.5 border border-[#8de7df] text-[#08332f] bg-white backdrop-blur-sm text-sm font-bold rounded-xl hover:bg-white/70 hover:border-[#3bc0b3] transition-all shadow-sm"
              >
                <svg className="w-4 h-4 mr-2 text-[#3bc0b3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver a Inicio
              </a>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default SignIn;