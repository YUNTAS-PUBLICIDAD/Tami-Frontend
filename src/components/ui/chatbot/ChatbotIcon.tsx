import React from 'react';
import { useChatbotIcon } from 'src/hooks/useChatbotIcon';
import robotIcon from "../../../assets/icons/Icono-para--oficialpng.png";


interface ChatbotIconProps {
  className?: string; // Permite inyectar clases de Tailwind o CSS personalizado
  default?: boolean; 
}

const ChatbotIcon: React.FC<ChatbotIconProps> = ({ className = "w-12 h-12"}) => {
  const { iconUrl, isLoading } = useChatbotIcon();
  
  // Ícono por defecto por si falla la API o aún no hay nada configurado
  const defaultIcon = robotIcon.src; 

  if (isLoading) {
    // Puedes mostrar un skeleton o un spinner mientras carga
    //return <div className={`animate-pulse bg-gray-200 rounded-full ${className}`} />;
    return <img className={`object-cover rounded-full shadow-sm ${className}`} alt="Chatbot Icon" src={defaultIcon}  />;
  }

  return (
    <img 
      src={iconUrl || defaultIcon} 
      alt="Chatbot Icon" 
      className={`object-cover rounded-full shadow-sm ${className}`}
      // Si la URL falla al cargar en el navegador, cae en el icono por defecto
      onError={(e) => {
        e.currentTarget.src = defaultIcon;
      }}
    />
  );
};

export default ChatbotIcon;