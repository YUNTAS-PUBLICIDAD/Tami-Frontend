import React, { useEffect, useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
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
        <div className="flex flex-col h-screen">
            {/* Header ocupando todo el ancho */}
            <Header />

            {/* Contenedor principal con Sidebar y DataTable */}
            <div className="flex flex-1">
                <Sidebar />
                <div className="flex-1 p-4">
                    <MainTable />
                </div>
            </div>
        </div>
    );
};

export default Admin;