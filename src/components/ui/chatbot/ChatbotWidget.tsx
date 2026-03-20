import React, { useState, useEffect, useRef } from 'react';

interface Message {
  role: 'bot' | 'user';
  tipo: 'texto' | 'producto';
  respuesta: string;
  productos?: {
    nombre: string;
    descripcion: string;
    imagen: string;
    link_whatsapp: string;
  }[];
  producto?: { // Mantener para compatibilidad
    nombre: string;
    descripcion: string;
    imagen: string;
    link_whatsapp: string;
  };
  link_whatsapp?: string;
}

const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      tipo: 'texto',
      respuesta: '¡Hola! Soy el asistente virtual de Tami 🤖. ¿Qué tipo de producto estás buscando hoy?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', tipo: 'texto', respuesta: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.PUBLIC_API_URL || 'https://apitami.tamimaquinarias.com';
      const response = await fetch(`${apiUrl}/api/v1/chat/responder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ mensaje: userMessage.respuesta })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      // Delay humano para simular que el bot está escribiendo
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const botMessage: Message = {
        role: 'bot',
        tipo: data.tipo,
        respuesta: data.respuesta,
        productos: data.productos, // Pasamos el array de productos
        producto: data.producto,
        link_whatsapp: data.link_whatsapp
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error en Chatbot:", error);
      // También esperamos un poco para el error para que no sea brusco
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessages((prev) => [...prev, {
        role: 'bot',
        tipo: 'texto',
        respuesta: 'Ups, tuvimos un problema de conexión 😅. Si urge, contáctanos directo a nuestro WhatsApp.',
        link_whatsapp: 'https://wa.me/51978883199?text=Hola,%20me%20falló%20el%20bot%20y%20necesito%20ayuda.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed z-50 bottom-10 right-10 flex flex-col items-end">
      {/* Ventana del Chat */}
      {isOpen && (
        <div className="mb-4 w-[90vw] sm:w-[360px] h-[500px] max-h-[70vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 transition-all transform origin-bottom-right">
          
          {/* Header */}
          <div className="bg-[#00E676] px-4 py-3 text-white flex justify-between items-center shadow-md z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white text-[#00E676] rounded-full flex items-center justify-center font-bold text-lg">
                T
              </div>
              <div>
                <h3 className="font-bold leading-tight">TamiBot</h3>
                <p className="text-xs opacity-90">Asistente en línea</p>
              </div>
            </div>
            <button onClick={toggleChat} className="text-white hover:text-gray-200 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Area de Mensajes */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2 shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-[#00E676] text-white rounded-br-none' 
                    : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.respuesta}</p>

                  {/* Render Product Cards si es tipo producto */}
                  {msg.tipo === 'producto' && (msg.productos || msg.producto) && (
                    <div className="mt-3 flex flex-col gap-3">
                      {(msg.productos || [msg.producto]).map((prod, pIdx) => prod && (
                        <div key={pIdx} className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                          {prod.imagen && (
                            <div className="h-32 w-full bg-white flex items-center justify-center p-2">
                              <img 
                                src={prod.imagen.startsWith('http') ? prod.imagen : `${import.meta.env.PUBLIC_API_URL}${prod.imagen}`} 
                                alt={prod.nombre} 
                                className="max-h-full object-contain"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
                            </div>
                          )}
                          <div className="p-3">
                            <p className="font-bold text-sm text-gray-900 leading-tight mb-1">{prod.nombre}</p>
                            <p className="text-[10px] text-gray-500 leading-tight mb-2 line-clamp-2">{prod.descripcion}</p>
                            <a 
                              href={prod.link_whatsapp} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="block w-full text-center bg-[#00E676] hover:bg-green-500 text-white text-[10px] font-bold py-1.5 rounded-lg transition"
                            >
                              Consultar este producto
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Botón CTA Whatsapp para respuestas texto genéricas */}
                  {msg.tipo === 'texto' && msg.link_whatsapp && (
                    <a 
                      href={msg.link_whatsapp} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="mt-3 flex justify-center items-center gap-2 w-full text-center bg-[#25D366] hover:bg-[#20b858] text-white text-xs font-bold py-2 rounded-lg transition"
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                      Hablar por WhatsApp
                    </a>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 shadow-sm border border-gray-100 flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="bg-white p-3 border-t border-gray-100">
            <form onSubmit={sendMessage} className="flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00E676] transition"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="bg-[#00E676] hover:bg-green-500 text-white w-10 h-10 rounded-full flex items-center justify-center transition disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Botón Flotante (Avatar/Icono) */}
      <button 
        onClick={toggleChat}
        className={`w-16 h-16 rounded-full bg-gradient-to-tr from-[#00E676] to-[#0bc267] text-white shadow-lg flex items-center justify-center transition duration-300 ease-in-out transform hover:scale-110 relative ${isOpen ? 'scale-90 rotate-12 opacity-0 pointer-events-none absolute' : 'rotate-0 opacity-100 z-50'}`}
        aria-label="Abrir Chatbot"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        
        {/* Puntito de notificación rojo (opcional) */}
        {!isOpen && (
          <span className="absolute top-0 right-0 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
          </span>
        )}
      </button>
    </div>
  );
};

export default ChatbotWidget;
