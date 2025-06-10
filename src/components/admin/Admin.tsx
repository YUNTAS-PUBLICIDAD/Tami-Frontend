import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

const Admin: React.FC = () => {
  const [usuarioAutenticado, setUsuarioAutenticado] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      Swal.fire({
        icon: "error",
        title: "Acceso denegado",
        text: "No tienes permiso para acceder al dashboard.",
      }).then(() => {
        window.location.href = "/sign-in"; // Redirige al login
      });
    } else {
      setUsuarioAutenticado(true);
    }
  }, []);

  if (!usuarioAutenticado) {
    return <p>Cargando...</p>;
  }

  return <div></div>;
};

export default Admin;
