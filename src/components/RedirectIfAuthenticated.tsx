import { useEffect, useState } from "react";

interface RedirectIfAuthenticatedProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function RedirectIfAuthenticated({
  children,
  redirectTo = "/admin/inicio",
}: RedirectIfAuthenticatedProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      window.location.href = redirectTo;
    } else {
      setIsLoading(false);
    }
  }, [redirectTo]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-700 animate-pulse">
            Verificando sesión...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
