import { useEffect, useState } from "react";

/**
 * ProtectedRoute component verifica si el usuario está autenticado.
 * Si no lo está es redireccionado al login page.
 * Si lo está, rederiza los children components.
 */

type ProtectedRouteProps = {
    children: React.ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            window.location.href = "/auth/sign-in";
        } else {
            setIsAuthenticated(true);
        }
    }, []);

    if (isAuthenticated === null) {
        return (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-teal-500 to-teal-800">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-white mb-4"></div>
                    <h1 className="text-white text-2xl font-semibold animate-pulse">
                        Cargando...
                    </h1>
                </div>
            </div>
        )
    }

    return <>{children}</>;
}
