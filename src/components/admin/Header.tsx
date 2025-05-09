import logo from "../../assets/images/logos/logo_animado.gif";
import React from "react";

interface HeaderProps {
    title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
    return (
        <header className="fixed top-0 z-50 w-full bg-teal-500 text-white shadow-md py-3 px-6 flex justify-between items-center">
            <img
                src={logo.src}
                alt="Logo de Tami"
                className="w-14 h-auto"
            />
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-wide text-center">
                SECCIÓN: <span className="uppercase">{title}</span>
            </h2>
        </header>
    );
};

export default Header;
