import { useState, useEffect } from 'react';
import apiClient from 'src/services/apiClient';
import { config } from 'config';

export const useChatbotIcon = () => {
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [colorInicial, setColorInicial] = useState<string>("#015f86");
  const [colorFinal, setColorFinal] = useState<string>("#0d9488");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchIcon = async () => {
    try {
      setIsLoading(true);
      const [iconRes, colorRes] = await Promise.allSettled([
        apiClient.get(config.endpoints.chatbot.getIcon),
        apiClient.get(config.endpoints.chatbot.getHeadColor),
      ]);

      if (iconRes.status === "fulfilled" && iconRes.value.data?.url_icono)
        setIconUrl(iconRes.value.data.url_icono);

      if (colorRes.status === "fulfilled" && colorRes.value.data?.color_inicial)
        setColorInicial(colorRes.value.data.color_inicial);

      if (colorRes.status === "fulfilled" && colorRes.value.data?.color_final)
        setColorFinal(colorRes.value.data.color_final);

    } catch (err) {
      console.error("Error al obtener configuración del chatbot:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIcon();
  }, []);

  return { iconUrl, colorInicial, colorFinal, isLoading, fetchIcon };
};