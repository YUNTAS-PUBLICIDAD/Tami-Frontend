import logo from "../../assets/images/logos/logo_movil.webp";
import React from "react";

interface HeaderProps {
    title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
    return (
        <header className="fixed top-0 z-50 w-full bg-gradient-to-r bg-teal-600 text-white shadow-lg py-1 px-4 md:px-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <img
                    src={logo.src}
                    alt="Logo de Tami"
                    className="w-full h-14"
                />
            </div>
        </header>
    );
};

export default Header;
