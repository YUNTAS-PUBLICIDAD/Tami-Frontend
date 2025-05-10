import logo from "../../assets/images/logos/logo_animado.gif";
import React from "react";

interface HeaderProps {
    title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
    return (
        <header className="fixed top-0 z-50 w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg py-3 px-4 md:px-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <img
                    src={logo.src}
                    alt="Logo de Tami"
                    className="w-12 h-12 md:w-14 md:h-14"
                />
                <span className="text-lg md:text-2xl font-semibold tracking-tight hidden sm:inline-block">
                    Admin Panel
                </span>

            </div>
            <h2 className="text-sm sm:text-lg md:text-2xl font-bold tracking-wider text-center uppercase flex-1 text-white text-shadow-md">
                {title}
            </h2>
        </header>
    );
};

export default Header;
