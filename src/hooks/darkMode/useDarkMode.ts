// hooks/useDarkMode.ts
import { useEffect, useState } from "react";

export const useDarkMode = () => {
  const [darkMode, setDarkMode] = useState<boolean>(false);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", JSON.stringify(newMode));

    // Aplica la clase dark en el elemento raíz <html>
    if (newMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Notificar a otros componentes
    window.dispatchEvent(
      new CustomEvent("darkModeToggle", {
        detail: { darkMode: newMode },
      })
    );
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Leer estado inicial desde localStorage
    const savedMode = JSON.parse(localStorage.getItem("darkMode") || "false");
    setDarkMode(savedMode);

    if (savedMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Escuchar cambios
    const handleDarkModeChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ darkMode: boolean }>;
      const newMode = customEvent.detail.darkMode;
      setDarkMode(newMode);
    };

    window.addEventListener("darkModeToggle", handleDarkModeChange);

    return () => {
      window.removeEventListener("darkModeToggle", handleDarkModeChange);
    };
  }, []);

  return { darkMode, toggleDarkMode };
};
