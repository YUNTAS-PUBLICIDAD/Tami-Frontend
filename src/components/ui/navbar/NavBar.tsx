import {useState, useEffect, useLayoutEffect} from "react";
import logoMovil from "@images/logos/logo_movil.webp";
import logoTami from "@images/logos/logo-estatico.webp";
import whatsappIcon from "../../../assets/icons/smi_whatsapp.svg";
import NavLink from "./NavLink";
import SideMenu from "../sideMenu/SideMenu";
import navLinks from "@data/navlinks.data";

function NavBar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [search, setSearch] = useState("");

  useLayoutEffect(() => {
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
      window.location.href = `/buscar?q=${encodeURIComponent(search.trim())}`;
    }
  };

  return (
      <header
          className={`items-center justify-between text-white text-base lg:text-lg fixed w-full py-2 px-4 lg:px-12 transition-all z-50 duration-300 grid grid-cols-2 lg:grid-cols-12 ${
              isScrolled ? "bg-teal-700 shadow-lg" : "bg-teal-700e"
          }`}
          style={{ maxWidth: '100vw', minHeight: '60px' }}
      >
        {/* Menú lateral en móviles */}
        <SideMenu links={navLinks} />

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
              loading="eager"
              style={{ paddingLeft: '5rem' }}
              title="Logo de Tami con letras"
          />
          <img
              src={logoTami.src}
              alt="logo de Tami sin letras"
              className="hidden lg:block object-contain" // Agregado object-contain
              width="76"
              height="86"
              loading="eager"
              style={{maxHeight: '60px' }} // Limita la altura máxima
              title="logo de Tami sin letras"
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
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="¿Qué buscas?"
                className="text-gray-800 placeholder-gray-400 bg-white rounded-full pl-4 pr-10 py-2 w-44 lg:w-56 focus:outline-none focus:ring-2 focus:ring-teal-400 transition duration-300"
            />
            <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-teal-600 hover:text-teal-800"
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
      </header>
  );
}

export default NavBar;