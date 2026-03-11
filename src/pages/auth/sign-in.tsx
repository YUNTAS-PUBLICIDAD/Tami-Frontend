import React, { useState } from "react";
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


  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    setIsLoading(true);
    try {
      const response = await apiClient.post(config.endpoints.auth.login, { email, password });
      const data = response.data;

      if (response.status === 200) {
        // Guardar token en localStorage
        localStorage.setItem("token", data.data.token);

        // Guardar información del usuario en localStorage (sin información sensible)
        const userInfo = {
          name: data.data.user?.name ||
            data.data.user?.username ||
            data.data.user?.email?.split('@')[0] || // Solo muestra la parte antes del @
            "Usuario",
          role: data.data.user?.role ||
            data.data.user?.rol ||
            data.data.user?.tipo ||
            "Usuario"
        };

        localStorage.setItem("userInfo", JSON.stringify(userInfo));

        // Redirigir al dashboard
        window.location.href = "/admin/inicio";
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Error al iniciar sesión",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error de conexión con el servidor.",
      });
    } finally {
      setIsLoading(false);
      setError(null);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-center items-center relative bg-cover bg-center"
      style={{ backgroundImage: `url(${loginBg.src})` }}
    >
      <a
        href="/"
        title="Regresar a la página de inicio"
        className="absolute top-2 left-2 bg-red-700 text-white font-semibold rounded-2xl px-5 py-2 hover:bg-red-900 transition-colors duration-200 drop-shadow-lg opacity-70 hover:opacity-100"
      >
        Regresar
      </a>

      <div className="text-center mb-8 relative z-10">
        <img
          loading="lazy"
          src={logoAnimado as string}
          alt="TAMI Logo"
          className="w-26 mx-auto mb-6"
        />
        <h1 className="text-white text-4xl md:text-5xl font-black">
          ¡BIENVENIDO!
        </h1>
      </div>

      <form
        className="space-y-4 w-full max-w-2xs md:max-w-md relative z-10"
        onSubmit={handleLogin}
      >
        {error && <p className="text-red-500 text-center">{error}</p>}
        <div>
          <input
            type="email"
            name="email"
            className="w-full p-3 bg-white/70 text-sm rounded-2xl text-gray-700 font-semibold placeholder-gray-400 focus:outline-none px-6"
            placeholder="EMAIL"
            required
          />
        </div>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            className="w-full p-3 bg-white/70 text-sm rounded-2xl text-gray-700 font-semibold placeholder-gray-400 focus:outline-none px-6 pr-12 mb-2"
            placeholder="CONTRASEÑA"
            required
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            aria-label="Mostrar u ocultar contraseña"
          >
            {showPassword ? (
              // OJO TACHADO
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c1.665 0 3.246-.39 4.646-1.078M6.228 6.228A10.451 10.451 0 0112 4.5c4.756 0 8.774 3.162 10.066 7.5a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l12.544 12.544"
                />
              </svg>
            ) : (
              // OJO NORMAL (como tu imagen)
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            )}
          </button>

        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isLoading}
            aria-busy={isLoading}
            className="w-3/5 md:w-2/5 bg-teal-600 text-white p-2 rounded-3xl text-base font-bold hover:bg-teal-700 transition hover:cursor-pointer disabled:opacity-50 disabled:hover:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-blue-100 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-2">CARGANDO</span>
              </>
            ) : (
              "INGRESAR"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignIn;