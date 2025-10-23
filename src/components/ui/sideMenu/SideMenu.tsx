/**
 * @file SideMenu.tsx
 * @description Componente de menú lateral para la navegación en dispositivos móviles (despliegue desde la derecha + soporte logueado/no logueado)
 */

import { lazy, useEffect, useState } from "react";
import NavSocialMediaLink from "./NavSocialMediaLink";
import socialMediaLinks from "@data/socialMedia.data";
import userIcon from "@icons/icon_user.webp";
const NavLink = lazy(() => import("../navbar/NavLink"));

interface NavLink {
  url: string;
  texto: string;
  title?: string;
}

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  links: NavLink[];
}

interface UserInfo {
  name: string;
  role: string;
}

const SideMenu = ({ isOpen, onClose, links }: SideMenuProps) => {
  const [user, setUser] = useState<UserInfo | null>(null);

  // Verificar autenticación cada vez que el menú se abre
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userInfoStr = localStorage.getItem("userInfo");
    
    if (token && userInfoStr) {
      try {
        const userInfo: UserInfo = JSON.parse(userInfoStr);
        setUser(userInfo);
      } catch (error) {
        // Si hay error al parsear, usar valores por defecto
        setUser({
          name: "Usuario",
          role: "Usuario"
        });
      }
    } else if (token) {
      // Token existe pero no hay info de usuario
      setUser({
        name: "Usuario",
        role: "Usuario"
      });
    } else {
      setUser(null);
    }
  }, [isOpen]);

  // También escuchar cambios en localStorage (para cuando el login ocurre en otra pestaña)
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("token");
      const userInfoStr = localStorage.getItem("userInfo");
      
      if (token && userInfoStr) {
        try {
          const userInfo: UserInfo = JSON.parse(userInfoStr);
          setUser(userInfo);
        } catch (error) {
          setUser({
            name: "Usuario",
            role: "Usuario"
          });
        }
      } else if (token) {
        setUser({
          name: "Usuario",
          role: "Usuario"
        });
      } else {
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Cerrar con la tecla Escape
  useEffect(() => {
    const handleEscape = (e: any) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    setUser(null);
    window.location.href = "/";
  };

  if (!isOpen) return null;

  return (
    <div className="md:hidden">
      {/* Overlay de fondo */}
      <div 
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />
      
      {/* Menú lateral */}
      <div
        className="fixed right-0 top-[72px] w-[85vw] max-w-[300px] h-[calc(100vh-100px)] shadow-2xl z-50 overflow-y-auto rounded-l-2xl
               bg-[#0F766E]/95 backdrop-blur-sm
               transition-transform duration-300 ease-in-out px-1 py-6
               border border-emerald-800/80"
      >
        {/* Enlaces del menú */}
        <nav className="space-y-0">
          {links.map((item, index) => (
            <div key={index} className="border-b border-white/20 last:border-b-0">
              <div className="block py-1 text-center text-white font-medium text-lg hover:bg-white/10 transition-colors rounded-lg mx-2">
                <NavLink
                  isForNavBar={false}
                  to={item.url}
                  title={item.title || `Ir a ${item.texto}`}
                >
                  {item.texto}
                </NavLink>
              </div>
            </div>
          ))}
        </nav>

        {/* Separador */}
        <div className="my-1 border-t border-white/30 w-4/5 mx-auto" />

        {/* Redes sociales */}
        <div className="py-1">
          <p className="font-semibold text-center text-white text-lg mb-4">
            Síguenos
          </p>
          <div className="flex flex-wrap justify-center gap-4 px-2">
            {socialMediaLinks.map((item, index) => (
              <NavSocialMediaLink
                key={index}
                image={item.image.src}
                url={item.url}
                socialMediaName={item.socialMediaName}
                imageTitle={item.imageTitle}
                linkTitle={item.linkTitle}
              />
            ))}
          </div>
        </div>

        {/* Separador */}
        <div className="my-6 border-t border-white/30 w-4/5 mx-auto" />

        {/* Sección de autenticación */}
        <div className="pt-2">
          {!user ? (
            <div className="border-b border-white/20">
              <div className="block py-4 text-center text-white font-medium text-lg hover:bg-white/10 transition-colors rounded-lg mx-2">
                <NavLink
                  isForNavBar={false}
                  to="/auth/sign-in"
                  title="Iniciar sesión en Tami Maquinarias"
                >
                  INICIAR SESIÓN
                </NavLink>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-3">
              <div className="flex justify-center mb-2">
                <img
                  src={userIcon.src}
                  width={48}
                  height={48}
                  className="w-12 h-12 object-contain"
                  alt="Icono de usuario"
                  loading="lazy"
                />
              </div>
              <p className="text-white font-bold text-lg">{user.name}</p>
              <p className="text-white font-bold text-lg capitalize">{user.role}</p>
              <button
                onClick={handleLogout}
                className="w-4/5 mx-auto text-center bg-red-600 hover:bg-red-700 transition-colors py-3 rounded-xl font-bold text-white text-sm"
              >
                CERRAR SESIÓN
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SideMenu;