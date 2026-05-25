import { useState, useEffect } from 'react';
// Asegúrate de importar apiClient y config desde tus rutas correctas
import apiClient from 'src/services/apiClient';
import { config } from 'config';

export const useChatbotIcon = () => {
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchIcon = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(config.endpoints.chatbot.getIcon);
      
      if (response.data && response.data.url_icono) {
        setIconUrl(response.data.url_icono);
      }
    } catch (err) {
      console.error("Error al obtener el ícono del chatbot:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIcon();
  }, []);

  // Devolvemos el ícono, el estado de carga, y la función por si necesitas recargarlo manualmente
  return { iconUrl, isLoading, fetchIcon };
};