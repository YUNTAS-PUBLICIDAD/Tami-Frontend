import {useState, useEffect, useLayoutEffect} from "react";
import logoMovil from "@images/logos/logo_movil.webp";
import logoTami from "@images/logos/logo-estatico.webp";
import whatsappIcon from "../../../assets/icons/smi_whatsapp.svg";
import NavLink from "./NavLink";
import SideMenu from "../sideMenu/SideMenu";
import navLinks from "@data/navlinks.data";

function NavBar() {
  const [isScrolled, setIsScrolled] = useState(false);

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

  return (
      <header
          className={`items-center justify-between text-white text-base lg:text-lg fixed w-full py-2 px-4 lg:px-12 transition-all z-50 duration-300 grid grid-cols-2 lg:grid-cols-12 ${
              isScrolled ? "bg-teal-700 shadow-lg" : "bg-teal-700e"
          }`}
          style={{ maxWidth: '100vw', minHeight: '60px' }}
      >
        <SideMenu links={navLinks} />
        <a
            href="/"
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
          />
          <img
              src={logoTami.src}
              alt="logo de Tami sin letras"
              className="hidden lg:block object-contain" // Agregado object-contain
              width="76"
              height="86"
              loading="eager"
              style={{maxHeight: '60px' }} // Limita la altura máxima
          />
        </a>

        <nav className="lg:flex hidden col-span-7 w-full h-full">
          <ul className="flex gap-10 w-full h-full items-center place-content-center">
            {navLinks.map((item, index) => (
                <li key={index}>
                  <NavLink to={item.url} isForNavBar={true}>
                    {item.texto}
                  </NavLink>
                </li>
            ))}
          </ul>
        </nav>

        <div className="hidden lg:flex h-full content-center text-end col-span-4 w-full items-center justify-end gap-4">
          <a href="https://api.whatsapp.com/send?phone=51978883199" target="_blank" rel="noopener noreferrer">
            <img
                src={whatsappIcon.src}
                alt="WhatsApp"
                className="w-7 h-7 transition duration-200 ease-in-out transform hover:scale-125"
            />
          </a>
          <a
              href="/auth/sign-in"
              target="_blank"
              className="w-fit bg-white rounded-2xl border-2 border-slate-300 py-2 px-5 text-teal-700 text-base sm:text-lg hover:bg-linear-to-t hover:from-teal-600 hover:to-teal-800 hover:text-white transition-all ease-in-out duration-300 font-bold"
          >
            LOGIN
          </a>
        </div>
      </header>
  );
}

export default NavBar;