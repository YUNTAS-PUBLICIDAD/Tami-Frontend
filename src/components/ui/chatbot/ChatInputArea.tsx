import React, { useState } from 'react'

// 1. Sub-componente fuera de  ChatbotWidget 
interface ChatInputAreaProps {
    onSendMessage: (message: string) => void;
    isLoading: boolean;
    contextoPaso: string | undefined;
  }
  

export  const ChatInputArea = React.memo(({ onSendMessage, isLoading, contextoPaso }: ChatInputAreaProps) => {
    const [input, setInput] = useState('');
  
    const handleSubmit = (e: { preventDefault: () => void; }) => {
      e.preventDefault();
      if (!input.trim() || isLoading) return;
      onSendMessage(input);
      setInput(''); // Limpiamos el input local
    };
  
    return (
      <div className="bg-white p-4 border-t border-gray-100 shadow-[0_-15px_30px_rgba(0,0,0,0.03)] shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              contextoPaso === "esperando_datos_producto_1" ? "Ej: negocio, Lima" : "Escribe un mensaje..."
            }
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-[#015f86]/10"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-br from-[#015f86] to-[#0d9488] text-white w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 disabled:opacity-30 shadow-lg"
          >
            <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </button>
        </form>
      </div>
    );
  });
  
