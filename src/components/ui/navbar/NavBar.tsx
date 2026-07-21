import { useState, useEffect, lazy, useRef } from "react";
import type Producto from "../../../models/Product";
import logoTami from "@images/logos/logo-estatico-100x116.webp";
import { getApiImageUrl } from "../../../utils/getApiUrl";
import whatsappIcon from "../../../assets/icons/smi_whatsapp.svg";
const NavLink = lazy(() => import("./NavLink"));
const SideMenu = lazy(() => import("../sideMenu/SideMenu"));
import navLinks from "@data/navlinks.data";
import { IoClose, IoMenu } from "react-icons/io5";
import ActiveLink from "./ActiveLink";

interface NavBarProps {
  forceSolid?: boolean;
}

function NavBar({ forceSolid = false }: NavBarProps) {
    const apiUrl = import.meta.env.PUBLIC_API_URL || "";
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [search, setSearch] = useState("");
    const [suggestions, setSuggestions] = useState<Producto[]>([]);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLFormElement>(null);

    // NUEVO: Guardará los productos en la memoria RAM del componente para no re-descargar
    const productosCacheRef = useRef<Producto[] | null>(null);
    // NUEVO: Estado intermedio para el Debounce de la búsqueda
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // 1. EFECTO DE DEBOUNCE: Espera 300ms antes de procesar lo que el usuario escribe
    useEffect(() => {
      const timer = setTimeout(() => {
        setDebouncedSearch(search);
      }, 300);
      return () => clearTimeout(timer);
    }, [search]);

    // 2. FILTRADO Y CARGA OPTIMIZADA (Escucha a debouncedSearch)
    useEffect(() => {
      const query = debouncedSearch.trim().toLowerCase();
      if (query.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      // Función local para reutilizar el filtrado
      const ejecutarFiltrado = (todos: Producto[]) => {
        const filtered = todos.filter((producto: Producto) =>
          [
            producto.nombre,
            producto.titulo,
            producto.subtitulo,
            producto.descripcion,
          ].some((campo) => campo && campo.toLowerCase().includes(query))
        );
        setSuggestions(filtered.slice(0, 6));
        setShowSuggestions(true);
      };

      // Si ya los descargamos una vez, filtramos al instante sin usar Red (0ms)
      if (productosCacheRef.current) {
        ejecutarFiltrado(productosCacheRef.current);
        return;
      }

      setLoading(true);
      fetch("/api/productos")
        .then((res) => res.json())
        .then((json) => {
          const todos: Producto[] = json.data ?? [];
          productosCacheRef.current = todos; // Guardamos en memoria
          ejecutarFiltrado(todos);
        })
        .catch(() => setSuggestions([]))
        .finally(() => setLoading(false));
    }, [debouncedSearch]);

    // Cerrar sugerencias al hacer click fuera
    useEffect(() => {
      function handleClickOutside(e: MouseEvent) {
        if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
          setShowSuggestions(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // 3. SCROLL OPTIMIZADO: Elimina por completo el Forced Reflow
    useEffect(() => {
      let ticking = false;
      let lastScrollY = 0; // Guardará la posición exacta de lectura

      const handleScroll = () => {
        // Se hace inmediatamente en el hilo principal del evento (Súper rápido)
        lastScrollY = window.scrollY; 

        if (!ticking) {
          window.requestAnimationFrame(() => {
            // El cambio de estado se ejecuta limpio en el frame visual
            setIsScrolled(lastScrollY > 50);
            ticking = false;
          });
          ticking = true; 
        }
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      
      // Ejecución inicial segura
      lastScrollY = window.scrollY;
      setIsScrolled(lastScrollY > 50);

      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }, []);

    const handleSearchSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (search.trim()) {
        setShowSuggestions(false);
        window.location.href = `/buscar?q=${encodeURIComponent(search.trim())}`;
      }
    };

    const handleSuggestionClick = (producto: Producto) => {
      setShowSuggestions(false);
      setSearch("");
      window.location.href = `/catalogo-maquinarias/detalle/?link=${encodeURIComponent(
        producto.link
      )}`;
    };
  // Se usa la versión de 'pre-main' que usa comillas dobles
  // y tiene una ligera corrección de indentación.
  return (
    <header
      className={`
        fixed w-full top-0 z-50 transition-colors duration-300
        ${isScrolled || forceSolid ? "bg-[#07625b] shadow-lg" : "bg-transparent"} 
      `}
    >
      <div className="max-w-[1834px] mx-auto px-4 md:py-6 sm:px-6 lg:px-8 lg:py-6">
        <div className="flex items-center justify-between h-24">

          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" title="Ir a la sección de inicio">
              <img
                src={logoTami.src}
                alt="Logo de Tami"
                title="Tami logo"
                width="64"
                height="74"
                className="h-18 md:h-25 w-auto object-contain"
                fetchPriority="high"
                loading="eager"
                decoding="async"
              />
            </a>
          </div>

          {/* Enlaces de Navegación para Escritorio */}
          <nav className="hidden lg:flex justify-center flex-grow">
            <ul className="flex items-center space-x-12">
              {navLinks.map((item, index) => (
                <li key={index}>
                  <ActiveLink
                    href={item.url}
                    title={`Ir a la sección de ${item.texto}`}
                  >
                    {item.texto}
                  </ActiveLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Botón de Login y Menú Móvil */}
          <div className="flex items-center">
            <a
              href="/auth/sign-in"
              title="Ir a la sección de inicio de sesión"
              className="hidden lg:block bg-white rounded-md py-3 px-8 text-[#07625b] font-bold text-lg hover:bg-gray-200 transition-colors"
            >
              LOGIN
            </a>

            {/* Botón de Menú para Móviles */}
            <div className="lg:hidden ml-4">
              <button
                className="w-12 h-12 flex items-center justify-center text-white"
                title={isOpen ? "Cerrar Menú" : "Abrir Menú"}
                aria-label={isOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <IoClose size={32} /> : <IoMenu size={32} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Se usa la versión de 'pre-main' que formatea el 
          componente en múltiples líneas para mejor lectura */}
      <SideMenu
        links={navLinks}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </header>
  );
}
 
export default NavBar;