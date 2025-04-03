import React, { useState } from "react";
import type { FormEvent } from "react";
import logoAnimado from "@images/logos/logo_animado.gif?url";
import loginBg from "@images/login_bg.jpg";
import { getApiUrl, config } from "config";

const SignIn: React.FC = () => {
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    console.log("Intentando iniciar sesión con:", email, password);

    try {
      const response = await fetch("https://apitami.tami-peru.com/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      console.log("Respuesta recibida:", response);

      const data = await response.json();
      console.log("Datos del servidor:", data);

      if (response.ok) {
        localStorage.setItem("token", data.data.token); // Guardar token
        window.location.href = "/admin"; // Redirigir al dashboard
      } else {
        console.error("Error en la respuesta del servidor:", data.message);
        alert(data.message || "Error al iniciar sesión");
      }
    } catch (error) {
      console.error("Error de conexión con el servidor:", error);
      alert("Error de conexión con el servidor.");
    }
  };


  return (
      <div
          className="min-h-screen w-full flex flex-col justify-center items-center relative bg-cover bg-center"
          style={{ backgroundImage: `url(${loginBg.src})` }}
      >
        <a
            href="/"
            className="absolute top-2 left-2 bg-red-700 text-white font-semibold rounded-2xl px-5 py-2 hover:bg-red-900 transition-colors duration-200 drop-shadow-lg opacity-70 hover:opacity-100"
        >
          Regresar
        </a>

        <div className="text-center mb-8 relative z-10">
          <img loading="lazy" src={logoAnimado as string} alt="TAMI Logo" className="w-26 mx-auto mb-6" />
          <h1 className="text-white text-4xl md:text-5xl font-black">¡BIENVENIDO!</h1>
        </div>

        <form className="space-y-4 w-full max-w-2xs md:max-w-md relative z-10" onSubmit={handleLogin}>
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
          <div>
            <input
                type="password"
                name="password"
                className="w-full p-3 bg-white/70 text-sm rounded-2xl text-gray-700 font-semibold placeholder-gray-400 focus:outline-none px-6 mb-2"
                placeholder="CONTRASEÑA"
                required
            />
          </div>
          <div className="flex justify-center">
            <button
                type="submit"
                className="w-3/5 md:w-2/5 bg-teal-600 text-white p-2 rounded-3xl text-base font-bold hover:bg-teal-700 transition hover:cursor-pointer"
            >
              INGRESAR
            </button>
          </div>
        </form>
      </div>
  );
};

export default SignIn;