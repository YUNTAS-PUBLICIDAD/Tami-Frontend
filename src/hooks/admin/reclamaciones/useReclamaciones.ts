import { useEffect, useState } from "react";
import { config } from "config";
import apiClient from "src/services/apiClient";
import type Reclamacion from "src/models/Reclamacion";

const useReclamaciones = (refetchTrigger?: boolean) => {
  const [reclamaciones, setReclamaciones] = useState<Reclamacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReclamaciones = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get(config.endpoints.reclamaciones.list);

      const apiData = response.data;

      // 🔐 Normalizamos SIEMPRE a array
      if (Array.isArray(apiData.data)) {
        setReclamaciones(apiData.data);
      } else if (Array.isArray(apiData.data?.data)) {
        setReclamaciones(apiData.data.data);
      } else {
        setReclamaciones([]);
      }

    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        "Error al obtener las reclamaciones"
      );
      setReclamaciones([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReclamaciones();
  }, [refetchTrigger]);

  return {
    reclamaciones,
    loading,
    error,
  };
};

export default useReclamaciones;
