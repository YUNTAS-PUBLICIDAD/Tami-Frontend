import logo from "../../assets/images/logos/logo_animado.gif";

const Header = () => {
  return (
    <header className="col-span-2 bg-teal-500 text-white py-2 px-6 flex justify-between items-center">
      <img src={logo.src} alt="Logo de Tami" className="w-16" />
      <h2 className="text-3xl font-extrabold tracking-wide">
        SECCIÓN: PRINCIPAL
      </h2>
    </header>
  );
};

export default Header;
