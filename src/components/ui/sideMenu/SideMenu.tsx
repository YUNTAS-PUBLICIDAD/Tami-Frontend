/**
 * @file SideMenu.tsx
 * @description Componente de menú lateral para la navegación en dispositivos móviles
 */
import NavLink from "../navbar/NavLink";
import NavSocialMediaLink from "./NavSocialMediaLink";
import socialMediaLinks from "@data/socialMedia.data";
import userIcon from "@icons/icon_user.webp";
import { useState } from "react";

interface NavLink {
  url: string;
  texto: string;
}

interface SideMenuProps {
  links: NavLink[];
}

const SideMenu: React.FC<SideMenuProps> = ({ links }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  function changeSideBarStatus() {
    setIsSidebarOpen((x) => !x);
  }
  return (
    <>
      <button className="w-9 h-9 lg:hidden" onClick={changeSideBarStatus}>
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M4 18L20 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          ></path>
          <path
            d="M4 12L20 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          ></path>
          <path
            d="M4 6L20 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          ></path>
        </svg>
      </button>
      <div
        className={`lg:hidden transition-transform duration-700 ease-in-out fixed top-20 left-0 bg-linear-to-t from-teal-700 to-slate-600 from-55% sm:from-35% border-2 border-l-0 z-20 px-2 py-6 w-1/2 sm:max-w-md rounded-l-none rounded-r-[50px] h-[calc(100vh-7rem)] overflow-y-scroll ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b-2 border-white pb-5 flex items-center gap-3 pl-5">
          <img
            src={userIcon.src}
            className="max-w-12 sm:max-w-16"
            alt="Icono de usuario"
          />
          <p className="text-3xl">
            Bienvenido
            <br />
            <span className="font-bold">Usuario</span>!
          </p>
        </div>
        <ul className="text-xl">
          {links.map((item, index: number) => (
            <li key={index}>
              <NavLink isForNavBar={false} to={item.url}>
                {item.texto}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="border-y-2 py-3">
          <p className="font-semibold text-center text-xl">
            Síguenos en nuestras redes
          </p>
          <div className="mt-4 mb-2 px-3 sm:px-6 flex flex-wrap justify-between">
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
        <div>
          <p className="font-semibold pt-2 text-xl">
            Horario de atención
          </p>
          <div className="text-xl">
            <p>
              Lunes a Viernes
              <br />
              de <span className="italic font-semibold">9:00 AM</span> a{" "}
              <span className="italic font-semibold">9:00 PM</span><br />
              informestami01@gmail.com<br />
              +51978883199
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SideMenu;
