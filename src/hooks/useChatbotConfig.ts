import { useState, useEffect } from 'react';
import { config, getApiUrl } from 'config';

const CACHE_KEY_ICON = 'chatbot_icon_url';
const CACHE_KEY_COLORS = 'chatbot_colors';
const CACHE_KEY_TTL = 'chatbot_config_timeout';
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutos de caché en producción

// En useChatbotConfig.ts
export const useChatbotConfig = () => {
  // ✅ Lee del window global (igual que usePopupLogic)
  const cachedPreviewSettings = typeof window !== "undefined"
    ? ((window as any).__chatbotPreviewSettings || {})
    : {};

  const [iconUrl, setIconUrl] = useState<string | null>(cachedPreviewSettings.iconUrl ?? null);
  const [colorInicial, setColorInicial] = useState<string>(cachedPreviewSettings.colorInicial ?? "#015f86");
  const [colorFinal, setColorFinal] = useState<string>(cachedPreviewSettings.colorFinal ?? "#0d9488");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchIcon = async () => {
    try {
      const baseUrl = config.apiUrl || "";

      const [iconRes, colorRes] = await Promise.allSettled([
        fetch(getApiUrl(config.endpoints.chatbot.getIcon)).then(r => r.ok ? r.json() : Promise.reject()),
        fetch(getApiUrl(config.endpoints.chatbot.getHeadColor)).then(r => r.ok ? r.json() : Promise.reject()),
      ]);

      if (iconRes.status === "fulfilled" && iconRes.value?.url_icono) {
        let url = iconRes.value.url_icono;
        
        if (!url.startsWith('http')) {
          const baseUrl = config.apiUrl.replace(/\/$/, ""); // Quita la barra final
          url = baseUrl + url;
        }
        
        setIconUrl(url);
      }
      if (colorRes.status === "fulfilled" && colorRes.value?.color_inicial) {
        setColorInicial(colorRes.value.color_inicial);
      }

      if (colorRes.status === "fulfilled" && colorRes.value?.color_final) {
        setColorFinal(colorRes.value.color_final);
      }
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