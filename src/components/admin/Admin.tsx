import React, { useEffect, useState } from "react";
import MainTable from "../../pages/admin-pages/MainTable.tsx";

const Admin: React.FC = () => {
    const [usuarioAutenticado, setUsuarioAutenticado] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            alert("No tienes permiso para acceder al dashboard.");
            window.location.href = "/sign-in"; // Redirige al login
        } else {
            setUsuarioAutenticado(true);
        }
    }, []);

    if (!usuarioAutenticado) {
        return <p>Cargando...</p>;
    }

    return (
        <div className="w-full p-4">
            <MainTable />
        </div>
    );
};

export default Admin;