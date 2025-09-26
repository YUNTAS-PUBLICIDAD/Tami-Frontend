import { useState, useEffect, lazy, useRef } from "react";
import type Producto from "../../../models/Product";
import logoTami from "@images/logos/logo-estatico-100x116.webp";
import { getApiImageUrl } from "../../../utils/getApiUrl";
import whatsappIcon from "../../../assets/icons/smi_whatsapp.svg";
const NavLink = lazy(() => import("./NavLink"));
const SideMenu = lazy(() => import("../sideMenu/SideMenu"));
import navLinks from "@data/navlinks.data";
import { IoClose, IoMenu } from "react-icons/io5";

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
    initialCheck();

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
          className={`items-center justify-between text-white text-base lg:text-lg fixed w-full py-2 px-4 lg:px-12 transition-all z-50 duration-300 grid grid-cols-2 lg:grid-cols-12 ${
              isScrolled ? "bg-teal-700 shadow-lg" : "bg-transparent"
          }`}
          style={{ maxWidth: '100vw', minHeight: '60px' }}
      >

        {/* Botón de menú para móviles */}
        <div className="md:hidden">
          <button className="w-[56px] h-[56px] lg:hidden cursor-pointer flex items-center justify-between" title="Abrir Menú" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <IoClose size={50} /> : <IoMenu size={50} />}
          </button>
        </div>

        {/* Logo */}
        <a
            href="/"
            title="Ir a la seccion de inicio"
            className="place-self-end lg:place-self-auto content-center h-14 mr-4"
        >
          <img
              src={logoTami.src}
              alt="Logo de Tami con letras"
              className="h-full lg:hidden object-contain"
              width="120"
              height="50"
              style={{ paddingLeft: '5rem' }}
              title="Logo de Tami con letras"
              fetchPriority="high"
              decoding="async"
          />
          <img
              src={logoTami.src}
              alt="logo de Tami sin letras"
              className="hidden lg:block object-contain" 
              width="76"
              height="86"
              loading="eager"
              style={{maxHeight: '60px' }} // Limita la altura máxima
              title="logo de Tami sin letras"
              fetchPriority="high"
              decoding="async"
          /> 
        </a>

        {/* Enlaces principales */}
        <nav className="lg:flex hidden col-span-7 w-full h-full">
          <ul className="flex gap-10 w-full h-full items-center place-content-center">
            {navLinks.map((item, index) => (
                <li key={index}>
                  <NavLink
                      to={item.url}
                      isForNavBar={true}
                      title={`Ir a la sección de ${item.texto}`}
                  >
                    {item.texto}
                  </NavLink>
                </li>
            ))}
          </ul>
        </nav>

        {/* WhatsApp + Buscador + Login */}
        <div className="hidden lg:flex h-full content-center text-end col-span-4 w-full items-center justify-end gap-4">
          {/* WhatsApp */}
          <a
              href="https://api.whatsapp.com/send?phone=51978883199"
              title="Conéctate con nosotros por WhatsApp"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-transform duration-200 transform hover:scale-110"
          >
            <img
                src={whatsappIcon.src}
                alt="WhatsApp"
                title="Conéctate con nosotros por WhatsApp"
                className="w-7 h-7"
                loading="lazy"
            />
          </a>

          {/* Buscador */}

          <form onSubmit={handleSearchSubmit} className="relative" ref={inputRef} autoComplete="off">
            <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="¿Qué buscas?"
                className="text-gray-800 placeholder-gray-400 bg-white rounded-full pl-4 pr-10 py-2 w-44 lg:w-56 focus:outline-none focus:ring-2 focus:ring-teal-400 transition duration-300"
                onFocus={() => search.length > 1 && setShowSuggestions(true)}
            />
            <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-teal-600 hover:text-teal-800"
                aria-label="Buscar"
                title="Botón de búsqueda"
            >
              <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
              >
                <path
                    fillRule="evenodd"
                    d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.386a1 1 0 01-1.414 1.415l-4.387-4.387zM8 14a6 6 0 100-12 6 6 0 000 12z"
                    clipRule="evenodd"
                />
              </svg>
            </button>
            {showSuggestions && suggestions.length > 0 && (
              <ul
                className="absolute left-0 mt-2 w-[340px] backdrop-blur-md bg-white/80 border border-teal-200 rounded-2xl shadow-2xl z-50 max-h-80 overflow-y-auto ring-1 ring-teal-100"
                style={{
                  boxShadow: '0 8px 32px 0 rgba(0, 150, 136, 0.18)',
                  scrollbarWidth: 'none', /* Firefox */
                  msOverflowStyle: 'none', /* IE 10+ */
                }}
              >
                {/* Ocultar scrollbar en navegadores Webkit */}
                <style>{`
                  ul::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
                {loading && (
                  <li className="px-4 py-2 text-gray-500">Buscando...</li>
                )}
                {suggestions.map((producto, idx) => {
                  let imgUrl = null;
                  if (producto.imagenes && producto.imagenes.length > 0) {
                    const rawUrl = producto.imagenes[0].url_imagen;
                    imgUrl = getApiImageUrl(rawUrl, apiUrl);
                  }
                  return (
                    <li
                      key={producto.id}
                      className={`flex items-center gap-3 px-3 py-3 cursor-pointer text-gray-800 text-left transition-all rounded-xl group relative hover:bg-teal-50/80 hover:ring-2 hover:ring-teal-300 ${idx === suggestions.length - 1 ? 'mb-0' : ''}`}
                      style={{ borderBottom: idx === suggestions.length - 1 ? 'none' : '1px solid #e0f2f1' }}
                      onClick={() => handleSuggestionClick(producto)}
                    >
                      {imgUrl ? (
                        <div className="w-16 h-16 flex items-center justify-center bg-white rounded-xl border border-teal-200 shadow-md flex-shrink-0 p-1 group-hover:scale-105 transition-transform duration-200">
                          <img
                            src={imgUrl}
                            alt={producto.nombre}
                            className="w-full h-full object-contain rounded-lg"
                            loading="lazy"
                            style={{ background: 'white', boxShadow: '0 2px 8px 0 rgba(0,150,136,0.10)' }}
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 border border-teal-100">
                          <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a4 4 0 004 4h10a4 4 0 004-4V7M3 7a4 4 0 014-4h10a4 4 0 014 4M3 7h18" /></svg>
                        </div>
                      )}
                      <div className="flex flex-col min-w-0 max-w-[230px]">
                        <span className="font-bold text-teal-800 whitespace-normal break-words leading-tight text-base group-hover:text-teal-900 transition-colors duration-200">
                          {producto.nombre}
                        </span>
                        <span className="block text-xs text-gray-500 whitespace-normal break-words leading-tight mt-1">
                          {producto.titulo}
                        </span>
                      </div>
                      {/* Separador visual solo si no es el último */}
                      {idx !== suggestions.length - 1 && (
                        <span className="absolute left-4 bottom-0 w-[90%] h-[1px] bg-teal-100" />
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </form>


          {/* Login */}
          <a
              href="/auth/sign-in"
              title="Ir a la sección de inicio de sesión"
              className="w-fit bg-white rounded-2xl border-2 border-slate-300 py-2 px-5 text-teal-700 text-base sm:text-lg hover:bg-gradient-to-t hover:from-teal-600 hover:to-teal-800 hover:text-white transition-all ease-in-out duration-300 font-bold"
          >
            LOGIN
          </a>
        </div>

        {/* Menú lateral en móviles */}
        <SideMenu links={navLinks} isOpen={isOpen} onClose={() => setIsOpen(false)}   /> 
      </header>
  );
}

export default NavBar;