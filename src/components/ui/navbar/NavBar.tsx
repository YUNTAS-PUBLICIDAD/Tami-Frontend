import { useState, useEffect, useCallback } from "react";
import logoMovil from "@images/logos/logo_movil.webp";
import logoTami from "@images/logos/logo_web.webp";
import NavLink from "./NavLink";
import SideMenu from "../sideMenu/SideMenu";
import navLinks from "@data/navlinks.data";

function NavBar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const debounce = <T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ): T => {
    let timer: ReturnType<typeof setTimeout>;
    return ((...args: Parameters<T>) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func(...args);
      }, delay);
    }) as T;
  };

  const handleScroll = useCallback(
    debounce(() => {
      setIsScrolled(window.scrollY > 0);
    }, 100),
    []
  );

  useEffect(() => {
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <header
        className={`items-center justify-between text-white text-base lg:text-lg fixed w-full py-2 px-4 lg:px-12 transition-all z-50 duration-700 grid grid-cols-2 lg:grid-cols-12 ${
            isScrolled ? "bg-teal-700 shadow-lg" : "border-b border-white"
        }`}
        style={{ maxWidth: '100vw' }}
    >
      <SideMenu links={navLinks} />
      <a
        href="/"
        className="place-self-end lg:place-self-auto content-center h-14"
      >
        <img
          src={logoMovil.src}
          alt="Logo de Tami con letras"
          width={135}
          height={55}
          fetchPriority="high"
          className="h-full lg:hidden"
        />
        <img
          src={logoTami.src}
          alt="logo de Tami sin letras"
          width={872}
          height={312}
          loading="eager"
          className="hidden lg:block"
        />
      </a>
      <nav className="hidden lg:block col-span-9 w-full h-full">
        <ul className="flex gap-10 w-full h-full items-center place-content-center">
          {navLinks.map((item, index) => (
            <li key={index}>
              <NavLink to={item.url} isForNavBar={true}>
                {item.texto}
              </NavLink>
            </li>
          ))}
          <li className="relative group text-white hover:text-teal-300 transition-colors duration-500 text-lg sm:text-xl font-bold cursor-pointer">
            Más
            <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-teal-300 transition-all duration-500 group-hover:w-full group-hover:left-0"></span>
            <ul className="absolute w-24 hidden group-hover:block bg-teal-800 text-white shadow-2xl rounded-ss-none rounded-md font-bold top-7">
              <li>
                <a
                  href="/blog"
                  className="block px-4 py-2 hover:bg-teal-900 hover:rounded-tr-md text-base sm:text-lg"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="/auth/sign-in"
                  className="block px-4 py-2 hover:bg-teal-900 hover:rounded-b-md text-base sm:text-lg"
                >
                  Iniciar Sesión
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
      <div className="hidden lg:block col-span-2 h-full content-center text-end w-full">
        <a
          href="https://api.whatsapp.com/send?phone=51978883199"
          target="_blank"
          className="w-fit bg-white rounded-2xl border-2 border-slate-300 py-2 px-5 text-teal-700 text-base sm:text-lg hover:bg-linear-to-t hover:from-teal-600 hover:to-teal-800 hover:text-white transition-all ease-in-out duration-500 font-bold"
        >
          Contáctanos
        </a>
      </div>
    </header>
  );
}

export default NavBar;
