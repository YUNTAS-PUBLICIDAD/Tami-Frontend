import React from "react";

interface NavLinkProps {
    isForNavBar: boolean;
    to: string;
    children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ isForNavBar, to, children }) => (
    <>
        <a
            href={to}
            className={`text-white font-bold ${
                isForNavBar
                    ? "hover:text-teal-300 transition-colors duration-500 text-xl relative group"
                    : "hover:underline underline-offset-4 text-xl sm:text-2xl block py-1 my-4 hover:bg-gradient-to-r hover:from-teal-950 hover:from-5% transition-colors duration-500 pl-4 rounded-l-xl"
            }`}
        >
            {children}
            {isForNavBar && (
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-teal-300 transition-all duration-500 group-hover:w-full group-hover:left-0"></span>
            )}
        </a>
    </>
);

export default NavLink;