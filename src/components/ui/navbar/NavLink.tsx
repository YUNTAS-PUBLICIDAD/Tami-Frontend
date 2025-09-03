import type { FC, ReactNode } from "react";

interface NavLinkProps {
    isForNavBar: boolean;
    to: string;
    children: ReactNode;
    title: string;
}

const NavLink: FC<NavLinkProps> = ({ isForNavBar, to, children, title }) => (
  <a
    href={to}
    className={`text-white font-bold ${
      isForNavBar
        ? "relative group hover:text-teal-300 transition-colors duration-500 text-xl"
        : "hover:underline underline-offset-4 text-xl sm:text-2xl block py-1 my-4 hover:bg-gradient-to-r hover:from-teal-950 hover:from-5% transition-colors duration-500 pl-4 rounded-l-xl"
    }`}
    title={title}
  >
    {children}
    {/* El efecto hover subrayado con ::after en CSS, no con span */}
  </a>
);


export default NavLink;