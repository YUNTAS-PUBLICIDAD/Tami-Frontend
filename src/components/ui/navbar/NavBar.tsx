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

function NavBar() {
  const apiUrl = import.meta.env.PUBLIC_API_URL || "";
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLFormElement>(null);

  // Cargar productos y filtrar sugerencias
  useEffect(() => {
    if (search.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setLoading(true);
    fetch('/api/productos')
      .then(res => res.json())
      .then(json => {
        const todos: Producto[] = json.data ?? [];
        const query = search.trim().toLowerCase();
        const filtered = todos.filter((producto: Producto) =>
          [producto.nombre, producto.titulo, producto.subtitulo, producto.descripcion]
            .some(campo => campo && campo.toLowerCase().includes(query))
        );
        setSuggestions(filtered.slice(0, 6));
        setShowSuggestions(true);
      })
      .catch(() => setSuggestions([]))
      .finally(() => setLoading(false));
  }, [search]);

  // Cerrar sugerencias al hacer click fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    };

    // Verificar estado inicial
    const initialCheck = () => {
      setIsScrolled(window.scrollY > 50);
    };

    // Agregar listener con passive para mejor rendimiento
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();;

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
    window.location.href = `/productos/detalle/?link=${encodeURIComponent(producto.link)}`;
  };

  return (
       <header
      className={`
        fixed w-full top-0 z-50 transition-colors duration-300
        ${isScrolled ? 'bg-[#07625b] shadow-lg' : 'bg-transparent'} 
      `}
    >
      <div className="max-w-[1834px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" title="Ir a la sección de inicio">
              <img
                src={logoTami.src}
                alt="Logo de Tami"
                title="Logo de Tami"
             
                className="h-16 w-auto object-contain"
                fetchPriority="high"
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
                title="Abrir Menú"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <IoClose size={32} /> : <IoMenu size={32} />}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <SideMenu links={navLinks} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </header>
  );
}

export default NavBar;
