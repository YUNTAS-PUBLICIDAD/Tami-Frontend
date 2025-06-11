/**
 * @file SideMenu.tsx
 * @description Componente de menú lateral para la navegación en dispositivos móviles
 */
import NavLink from "../navbar/NavLink";
import NavSocialMediaLink from "./NavSocialMediaLink";
import socialMediaLinks from "@data/socialMedia.data";
import userIcon from "@icons/icon_user.webp";
import React, { useState } from "react";

interface NavLink {
  url: string;
  texto: string;
}

interface SideMenuProps {
  links: NavLink[];
}

const SideMenu: React.FC<SideMenuProps> = ({ links }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const changeSideBarStatus = () => {
    setIsSidebarOpen((x) => !x);
  };

  return (
      <>
        <button className="w-9 h-9 lg:hidden" onClick={changeSideBarStatus}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 18L20 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M4 12L20 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M4 6L20 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <div
            className={`fixed top-20 left-0 z-20 border-2 border-l-0 px-4 py-6 rounded-r-[50px] h-[calc(100vh-7rem)] overflow-y-auto bg-gradient-to-t from-teal-700 to-slate-600 transition-transform duration-700 ease-in-out 
        w-[80vw] sm:w-[65vw] md:w-[50vw] max-w-xs sm:max-w-sm
        lg:hidden ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          {/* Usuario */}
          <div className="border-b-2 border-white pb-5 flex items-center gap-4 pl-2">
            <img
                src={userIcon.src}
                className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                alt="Icono de usuario"
            />
            <p className="text-4xl font-semibold leading-tight sm:text-5xl sm:font-bold">
              Bienvenido
              <br />
              <span className="font-extrabold text-white drop-shadow-sm">Usuario</span>!
            </p>
          </div>

          {/* Navegación */}
          <ul className="text-xl mt-5">
            {links.map((item, index: number) => (
                <li key={index}>
                  <NavLink isForNavBar={false} to={item.url}>
                    {item.texto}
                  </NavLink>
                </li>
            ))}
            <li>
              <NavLink isForNavBar={false} to="/blog">
                Blog
              </NavLink>
            </li>
          </ul>

          {/* Redes sociales */}
          <div className="border-y-2 py-4 mt-6">
            <p className="font-semibold text-center text-xl">
              Síguenos en nuestras redes
            </p>
            <div className="mt-4 mb-2 px-3 sm:px-6 flex flex-wrap justify-between gap-3">
              {socialMediaLinks.map((item, index) => (
                  <NavSocialMediaLink
                      key={index}
                      image={item.image.src}
                      link={item.url}
                      socialMediaName={item.socialMediaName}
                  />
              ))}
            </div>
          </div>

          {/* Información de contacto */}
          <div className="pt-4">
            <p className="font-semibold text-xl">Horario de atención</p>
            <div className="text-xl mt-2">
              <p>
                Lunes a Viernes
                <br />
                de <span className="italic font-semibold">9:00 AM</span> a{" "}
                <span className="italic font-semibold">9:00 PM</span>
                <br />
                informestami01@gmail.com
                <br />
                +51 978 883 199
              </p>
            </div>
          </div>
        </div>
      </>
  );
};

export default SideMenu;
