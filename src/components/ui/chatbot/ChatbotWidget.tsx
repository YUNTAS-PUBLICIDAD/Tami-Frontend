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
  const [showBubble, setShowBubble] = useState(false);
  const [isPopping, setIsPopping] = useState(false);
  const [bubbleIndex, setBubbleIndex] = useState(0);
  const bubbleMessages = [
    "¡Hola! ¿Buscas alguna maquinaria en especial? 🚜",
    "¿Tienes dudas sobre nuestros productos? ¡Pregúntame! 🌾",
    "¿Sabías que tenemos financiamiento disponible? 💳",
    "¿Necesitas repuestos? Puedo ayudarte a ubicarlos. ⚙️",
    "¿Buscas algo para tu negocio? 👨‍💼"
  ];

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
  const isFirstBubble = useRef(true);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Logic for the periodic bubble (random 60-90 seconds)
  useEffect(() => {
    if (isOpen) {
      setShowBubble(false);
      return;
    }

    let timeoutId: NodeJS.Timeout;

    const scheduleNextBubble = () => {
      // Diferent timing for first vs subsequent bubbles
      // First: 30-50s | Subsequent: 60-90s
      const min = isFirstBubble.current ? 30000 : 60000;
      const max = isFirstBubble.current ? 50000 : 90000;
      const randomTime = Math.floor(Math.random() * (max - min + 1)) + min;

      timeoutId = setTimeout(() => {
        if (!isOpen) {
          setBubbleIndex((prev) => (prev + 1) % bubbleMessages.length);
          setShowBubble(true);

          // Hide bubble after 20 seconds
          setTimeout(() => {
            setShowBubble(false);
            isFirstBubble.current = false; // Mark first as done
            scheduleNextBubble(); // Schedule next one (will use the longer delay)
          }, 20000);
        }
      }, randomTime);
    };

    scheduleNextBubble();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setShowBubble(false);
      setIsPopping(false);
    }
  };

  const handleCloseBubble = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsPopping(true);
    setTimeout(() => {
      setShowBubble(false);
      setIsPopping(false);
    }, 400);
  };

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
    <div className="fixed z-50 bottom-0 right-6 flex flex-col items-end font-montserrat pointer-events-none">
      {/* Ventana del Chat */}
      {isOpen ? (
        <div className="w-[90vw] sm:w-[380px] h-[600px] max-h-[90vh] bg-white/95 backdrop-blur-xl rounded-t-[32px] shadow-[0_-10px_50px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden border border-white/20 transition-all transform origin-bottom animate-in slide-in-from-bottom-10 duration-500 pointer-events-auto">

          {/* Header */}
          <div className="bg-gradient-to-r from-[#015f86] to-[#0d9488] px-5 py-3 text-white flex justify-between items-center shadow-md relative overflow-hidden shrink-0">
            {/* Decoración sutil en el header */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

            <div className="flex items-center gap-2.5 relative z-10">
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl flex items-center justify-center font-bold text-xl shadow-inner">
                  <span className="bg-gradient-to-br from-white to-gray-200 bg-clip-text text-transparent">T</span>
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-[#015f86] rounded-full shadow-sm"></span>
              </div>
              <div>
                <h3 className="font-bold text-base leading-tight tracking-tight">Tami Assistant</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]"></span>
                  <p className="text-[12px] font-medium opacity-90">En línea ahora</p>
                </div>
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="bg-white/10 hover:bg-white/25 p-2 rounded-xl transition-all duration-300 backdrop-blur-sm active:scale-90"
              aria-label="Cerrar chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Area de Mensajes */}
          <div className="flex-1 p-5 overflow-y-auto bg-[#F8FAFC] flex flex-col gap-5 scrollbar-thin scrollbar-thumb-gray-200">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                <div className={`max-w-[88%] rounded-[24px] px-5 py-4 shadow-sm transition-all ${msg.role === 'user'
                  ? 'bg-gradient-to-br from-[#015f86] to-[#087ca7] text-white rounded-br-none shadow-[#015f86]/10'
                  : 'bg-white text-gray-800 rounded-bl-none border border-gray-100/50'
                  }`}>
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.respuesta}</p>

                  {/* Render Product Cards si es tipo producto */}
                  {msg.tipo === 'producto' && (msg.productos || msg.producto) && (
                    <div className="mt-5 flex flex-col gap-4">
                      {(msg.productos || [msg.producto]).map((prod, pIdx) => prod && (
                        <div key={pIdx} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group border-b-4 border-b-[#0d9488]/10">
                          {prod.imagen && (
                            <div className="h-44 w-full bg-gray-50 flex items-center justify-center p-0 relative overflow-hidden">
                              <img
                                src={prod.imagen.startsWith('http') ? prod.imagen : `${import.meta.env.PUBLIC_API_URL}${prod.imagen}`}
                                alt={prod.nombre}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                          )}
                          <div className="p-5">
                            <p className="font-bold text-base text-gray-900 leading-tight mb-2 uppercase tracking-wide">{prod.nombre}</p>
                            <p className="text-[13px] text-gray-500 leading-relaxed mb-5 line-clamp-2">{prod.descripcion}</p>
                            <a
                              href={prod.link_whatsapp}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#015f86] to-[#0d9488] hover:from-[#0d9488] hover:to-[#015f86] text-white text-[14px] font-bold py-3.5 rounded-2xl transition-all duration-500 shadow-md hover:shadow-xl active:scale-95"
                            >
                              <span>Consultar producto</span>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
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
                      className="mt-5 flex justify-center items-center gap-3 w-full text-center bg-[#25D366] hover:bg-[#20b858] text-white text-[15px] font-bold py-4 rounded-2xl transition-all duration-500 shadow-lg hover:shadow-[#25D366]/20 active:scale-95"
                    >
                      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" /></svg>
                      Hablar por WhatsApp
                    </a>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-none px-6 py-5 shadow-sm border border-gray-100 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-[#015f86]/30 rounded-full animate-bounce"></div>
                  <div className="w-2.5 h-2.5 bg-[#015f86]/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2.5 h-2.5 bg-[#015f86]/70 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="bg-white p-4 border-t border-gray-100 shadow-[0_-15px_30px_rgba(0,0,0,0.03)] shrink-0">
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-[#015f86]/10 focus:border-[#015f86] transition-all placeholder:text-gray-400"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-br from-[#015f86] to-[#0d9488] hover:shadow-lg hover:scale-105 active:scale-90 text-white w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 disabled:opacity-30 disabled:scale-100 disabled:shadow-none shadow-lg shadow-[#015f86]/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Botón Flotante (Avatar/Icono) */
        <div className="flex items-end gap-4 mb-8 pointer-events-auto">
          {/* Burbuja de Diálogo Periódica */}
          {showBubble && (
            <div className={`relative group max-w-[280px] origin-bottom-right ${isPopping ? 'animate-balloon-pop' : 'animate-in slide-in-from-right-10 fade-in duration-500'}`}>
              <div className="bg-white/90 backdrop-blur-xl border border-white/40 p-5 rounded-[24px] rounded-br-[4px] shadow-[0_15px_50px_rgba(0,0,0,0.15)] relative cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95"
                onClick={() => {
                  setIsOpen(true);
                  setShowBubble(false);
                }}
              >
                {/* Botón de cerrar burbuja */}
                <button
                  onClick={handleCloseBubble}
                  className="absolute -top-2.5 -right-2.5 w-7 h-7 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 shadow-lg transition-all hover:scale-110 active:scale-90"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>

                <p className="text-[14px] font-medium text-gray-800 leading-tight">
                  {bubbleMessages[bubbleIndex]}
                </p>
                <div className="mt-2.5 flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#015f86]">Tami Assistant</span>
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]"></span>
                </div>
              </div>
              {/* Triangulito de la burbuja (ahora apunta a la derecha) */}
              <div className="absolute bottom-6 -right-2 w-5 h-5 bg-white/90 backdrop-blur-xl border-r border-b border-white/40 transform rotate-[-45deg] rounded-sm"></div>
            </div>
          )}

          <button
            onClick={toggleChat}
            className="relative group w-16 h-16 rounded-[24px] bg-gradient-to-tr from-[#015f86] to-[#0d9488] text-white shadow-[0_15px_35px_rgba(1,95,134,0.3)] flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-110 hover:-translate-y-1 active:scale-95 active:shadow-inner"
            aria-label="Abrir Chatbot"
          >
            <div className="absolute inset-0 bg-white/15 rounded-[24px] scale-0 group-hover:scale-100 transition-transform duration-500"></div>
            <img

              //src="/robot.png"
              src="/robot.webp"
              alt="Chatbot Avatar"
              className="h-10 w-10 relative z-10 object-contain drop-shadow-md animate-in fade-in zoom-in duration-500"
            />

            {/* Puntito de notificación rojo con efecto ripple */}
            <span className="absolute -top-1.5 -right-1.5 flex h-7 w-7">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-7 w-7 bg-red-500 border-4 border-white shadow-md items-center justify-center text-[10px] font-extrabold text-white">1</span>
            </span>
          </button>
        </div>
      )}
    </div>

  );
};

export default ChatbotWidget;
