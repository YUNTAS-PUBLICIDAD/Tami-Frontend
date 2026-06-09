import React, { useState, useEffect, useRef } from 'react';
import robotIcon from "../../../assets/icons/Icono-para--oficialpng.png";
import type { ApiProduct } from "./chatbotLogic";
import { getLocalReply, GREETING_REPLY, fetchIaReply } from "./chatbotLogic";
import apiClient from "src/services/apiClient";
import ChatbotIcon from "./ChatbotIcon";
import { config } from "config";
import ChatbotScreen from './ChatbotScreen';

interface Opcion {
  label: string;
  valor: string;
}

interface ChatContext {
  paso: string;
  categoria?: string;
  flujo?: string;
  producto?: string;
  ciudad?: string;
  uso?: string;
  nombre?: string;
  telefono?: string;
  etapa?: string;
  rubro?: string;
  necesidad?: string;
  tipo_negocio?: string;
  [key: string]: string | undefined;
}

interface Message {
  role: 'bot' | 'user';
  tipo: 'texto' | 'producto' | 'opciones' | 'fin_flujo';
  respuesta: string;
  opciones?: Opcion[];
  productos?: {
    nombre: string;
    descripcion: string;
    imagen: string;
    link_whatsapp: string;
  }[];
  producto?: {
    nombre: string;
    descripcion: string;
    imagen: string;
    link_whatsapp: string;
  };
  link_whatsapp?: string;
}

const MESSAGES_KEY = 'tami_chat_messages';
const CONTEXT_KEY = 'tami_chat_context';
const OPEN_KEY = 'tami_chat_open';

const mensajeInicial: Message = {
  role: 'bot',
  tipo: 'texto',
  respuesta: GREETING_REPLY,
};



const ChatbotWidget: React.FC = () => {
  // Estado persistente 
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(MESSAGES_KEY);
      return saved ? JSON.parse(saved) : [mensajeInicial];
    } catch { return [mensajeInicial]; }
  });

  const [context, setContext] = useState<ChatContext | null>({ paso: 'menu_principal' });

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hasHydratedStorage, setHasHydratedStorage] = useState(false);
  const [showBubble, setShowBubble] = useState(true);
  const [isTyping, setIsTyping] = useState(true); // 🚀 REPARADO: Estado maestro para los 3 puntitos
  const [isPopping, setIsPopping] = useState(false);
  const [bubbleIndex, setBubbleIndex] = useState(0);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [icono, setIcono] = useState(robotIcon);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isFirstBubble = useRef(true);
  const [isLeft, setIsLeft] = useState<boolean>(false);

  // 1. Consultamos la posición a la API cuando el widget se monta
  useEffect(() => {
    const fetchPosicion = async () => {
      try {
        const url = config.endpoints.chatbot.getPosition || "/v1/chatbot/posicion";
        const response = await apiClient.get(url);
        if (response.data && response.data.success) {
          setIsLeft(!!response.data.is_left);
        }
      } catch (error) {
        console.error("Error al obtener la posición del chatbot widget:", error);
      }
    };

    fetchPosicion();
  }, []);

  // If we have only the greeting message shown and default context, move to expecting product
  useEffect(() => {
    try {
      if (messages.length === 1 && messages[0].respuesta === GREETING_REPLY && context?.paso === 'menu_principal') {
        setContext((prev) => ({ ...(prev || { paso: 'menu_principal' }), paso: 'esperando_producto' }));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const bubbleMessages = [
    "¿Tienes dudas sobre nuestros productos? ¡Pregúntame! 🌾",
    "¡Hola! ¿Buscas alguna maquinaria en especial? 🚜",
    "¿Sabías que tenemos financiamiento disponible? 💳",
    "¿Necesitas repuestos? Puedo ayudarte a ubicarlos. ⚙️",
    "¿Buscas algo para tu negocio? 👨‍💼",
  ];

  const fetchCurrentIcon = async () => {
    try {
      const response = await apiClient.get(config.endpoints.chatbot.getIcon);
      const data = response.data;
      if (data && data.url_icono) {
        setIcono(data.url_icono);
      }
    } catch (err) {
      console.error("Error al obtener el ícono del chatbot:", err);
    }
  };

  useEffect(() => {
    fetchCurrentIcon();
  }, []);

  useEffect(() => {
    if (!hasHydratedStorage) return;
    try { localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages)); }
    catch { }
  }, [messages, hasHydratedStorage]);

  useEffect(() => {
    if (!hasHydratedStorage) return;
    try { localStorage.setItem(CONTEXT_KEY, JSON.stringify(context)); }
    catch { }
  }, [context, hasHydratedStorage]);

  useEffect(() => {
    if (!hasHydratedStorage) return;
    try { localStorage.setItem(OPEN_KEY, String(isOpen)); }
    catch { }
  }, [isOpen, hasHydratedStorage]);


  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem(MESSAGES_KEY);
      if (savedMessages) setMessages(JSON.parse(savedMessages));
      const savedContext = localStorage.getItem(CONTEXT_KEY);
      if (savedContext) setContext(JSON.parse(savedContext));
      setIsOpen(localStorage.getItem(OPEN_KEY) === 'true');
    } catch {
    } finally {
      setHasHydratedStorage(true);
    }
  }, []);

  useEffect(() => {
    if (isOpen) { setShowBubble(false); return; }
    const activeTimeouts: any[] = [];
    const scheduleNextBubble = () => {
      const min = isFirstBubble.current ? 3000 : 60000;
      const max = isFirstBubble.current ? 3000 : 90000;
      const delay = Math.floor(Math.random() * (max - min + 1)) + min;
      const mainTimeout = setTimeout(() => {
        if (isOpen) return;
        if (isFirstBubble.current) {
          setIsTyping(false);
          setBubbleIndex(0);
          isFirstBubble.current = false;
          setShowBubble(true);
          const hideTimeout = setTimeout(() => {
            setShowBubble(false);
            setIsTyping(true);
            scheduleNextBubble();
          }, 20000);
          activeTimeouts.push(hideTimeout);
        } else {
          setIsTyping(false);
          setBubbleIndex((prev) => (prev + 1) % bubbleMessages.length);
          setShowBubble(true);
          const hideRegularTimeout = setTimeout(() => {
            setShowBubble(false);
            setIsTyping(true);
            scheduleNextBubble();
          }, 20000);
          activeTimeouts.push(hideRegularTimeout);
        }
      }, delay);
      activeTimeouts.push(mainTimeout);
    };
    scheduleNextBubble();
    return () => { activeTimeouts.forEach((timeoutId) => clearTimeout(timeoutId)); };
  }, [isOpen]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const toggleChat = () => {
    setIsOpen(prev => !prev);
    if (!isOpen) { setShowBubble(false); setIsPopping(false); }
  };

  const reiniciarChat = () => {
    if (isLoading || isResetting) return;
    setIsResetting(true);
    setTimeout(() => {
      setMessages([mensajeInicial]);
      setContext({ paso: 'menu_principal' });
      setInput('');
      try {
        localStorage.removeItem(MESSAGES_KEY);
        localStorage.removeItem(CONTEXT_KEY);
      } catch { }
      setTimeout(() => { setIsResetting(false); }, 180);
    }, 2000);
  };

  const handleCloseBubble = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsPopping(true);
    setTimeout(() => { setShowBubble(false); setIsPopping(false); }, 400);
  };

  const handleOpcionClick = async (opcion: Opcion) => {
    if (isLoading) return;
    await enviarMensaje(opcion.label, opcion.valor);
  };

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;
    const texto = input.trim();
    setInput('');
    await enviarMensaje(texto, texto);
  };

  const enviarMensaje = async (labelMostrado: string, valorEnviado: string) => {
    const userMessage: Message = { role: 'user', tipo: 'texto', respuesta: labelMostrado };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // 1. Evaluamos si el chatbot local basado en reglas sabe qué responder
      const localReply = await getLocalReply(valorEnviado, context, messages);

      if (localReply) {
        await new Promise((resolve) => setTimeout(resolve, 700));
        const nextPaso = localReply.nextPaso;
        if (nextPaso || localReply.contextPatch) {
          setContext((prev) => ({
            ...(prev || { paso: "menu_principal" }),
            ...(localReply.contextPatch || {}),
            ...(nextPaso ? { paso: nextPaso } : {}),
          }));
        }
        setMessages((prev) => [...prev, localReply.message]);
        return;
      }

      // 2. 🚀 FALLBACK INTELIGENTE: Si el bot viejo da null, entra a tallar tu IA de Groq en local
      // Llamamos a la función fetchIaReply que creamos en chatbotLogic.ts
      const botMessage = await fetchIaReply(valorEnviado);

      // Simulamos un retraso natural de escritura (1.2 segundos) para que se sienta humano
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Pintamos la respuesta de Llama 3 en la pantalla
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error("Error en Chatbot Fallback:", error);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessages(prev => [...prev, {
        role: 'bot',
        tipo: 'texto',
        respuesta: 'Ups, tuvimos un problema de conexión 😅. Si urge, contáctanos directo a nuestro WhatsApp.',
        link_whatsapp: 'https://wa.me/51978883199?text=Hola,%20me%20falló%20el%20bot%20y%20necesito%20ayuda.'
      }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 60);
    }
  };



  /*const enviarMensaje = async (labelMostrado: string, valorEnviado: string) => {
    const userMessage: Message = { role: 'user', tipo: 'texto', respuesta: labelMostrado };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const localReply = await getLocalReply(valorEnviado, context, messages);
      if (localReply) {
        await new Promise((resolve) => setTimeout(resolve, 700));
        const nextPaso = localReply.nextPaso;
        if (nextPaso || localReply.contextPatch) {
          setContext((prev) => ({
            ...(prev || { paso: "menu_principal" }),
            ...(localReply.contextPatch || {}),
            ...(nextPaso ? { paso: nextPaso } : {}),
          }));
        }
        setMessages((prev) => [...prev, localReply.message]);
        return;
      }

      const apiUrl = import.meta.env.PUBLIC_API_URL || "https://apitami.tamimaquinarias.com";
      const response = await fetch(`${apiUrl}/api/v1/chat/responder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ mensaje: valorEnviado, context }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (data.context !== undefined) setContext(data.context);

      const botMessage: Message = {
        role: 'bot',
        tipo: data.tipo,
        respuesta: data.respuesta,
        opciones: data.opciones,
        productos: data.productos,
        producto: data.producto,
        link_whatsapp: data.link_whatsapp
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error en Chatbot:", error);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessages(prev => [...prev, {
        role: 'bot',
        tipo: 'texto',
        respuesta: 'Ups, tuvimos un problema de conexión 😅. Si urge, contáctanos directo a nuestro WhatsApp.',
        link_whatsapp: 'https://wa.me/51978883199?text=Hola,%20me%20falló%20el%20bot%20y%20necesito%20ayuda.'
      }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 60);
    }
  };

// Clases específicas para el globito de texto (bubble)
const bubbleClasses = isLeft
  ? "origin-bottom-right md:origin-bottom-left"
  : "origin-bottom-right";

// Clases para el piquito/triángulo del globito de texto
const tailClasses = isLeft
  ? "absolute bottom-6 -right-2 md:-left-2 md:right-auto transform rotate-[-45deg] md:rotate-[135deg]"
  : "absolute bottom-6 -right-2 transform rotate-[-45deg]";

// Clases para el contenedor del botón y el globo
const rowClasses = isLeft
  ? "flex items-end gap-4 mb-8 pointer-events-auto md:flex-row-reverse"
  : "flex items-end gap-4 mb-8 pointer-events-auto";
  return (
<div className={`fixed z-50 bottom-0 flex flex-col font-montserrat pointer-events-none
  right-6
  ${isLeft ? "md:left-6 md:right-auto md:items-start items-end" : "md:right-6 md:left-auto items-end"}
`}>      
      {isOpen ? (
        <ChatbotScreen
          messages={messages}
          context={context}
          isLoading={isLoading}
          isResetting={isResetting}
          input={input}
          messagesEndRef={messagesEndRef}
          onClose={toggleChat}
          onReset={reiniciarChat}
          onInputChange={setInput}
          onSendMessage={sendMessage}
          onOpcionClick={handleOpcionClick}
        />
      ) : (
        /* 🔥 PASO 3: El contenedor flex cambia de orden en Desktop si está a la izquierda (rowClasses) */
        <div className={rowClasses}>

        {showBubble && (
          /* 🔥 PASO 4: Cambiamos el punto de origen de la animación si está a la izquierda (bubbleClasses) */
          <div
            className={`relative group w-fit max-w-[200px] sm:max-w-[280px] rounded-[24px] ${bubbleClasses} ${
              isPopping
                ? "animate-balloon-pop"
                : isLeft 
                  ? "animate-in md:slide-in-from-left-10 slide-in-from-right-10 fade-in duration-500"
                  : "animate-in slide-in-from-right-10 fade-in duration-500"
            }`}
          >
            {/* 🔥 PASO 5: Cambiamos qué esquina se ve redondeada en Desktop si está a la izquierda */}
            <div
              className={`w-fit bg-white/90 backdrop-blur-xl border border-white/40 p-3 sm:p-5 rounded-[24px] shadow-[0_15px_50px_rgba(0,0,0,0.15)] relative cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95 ${
                isLeft ? "rounded-br-[4px] md:rounded-br-[24px] md:rounded-bl-[4px]" : "rounded-br-[4px]"
              }`}
              onClick={() => {
                setIsOpen(true);
                setShowBubble(false);
              }}
            >
              <button
                onClick={handleCloseBubble}
                className="absolute -top-1.5 -right-1.5 sm:-top-2.5 sm:-right-2.5 w-6 h-6 sm:w-7 sm:h-7 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 shadow-lg transition-all hover:scale-110 active:scale-90"
              >
                <svg
                  width="12"
                  height="12"
                  className="sm:w-3.5 sm:h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>

              <p className="text-[13px] sm:text-[14px] font-medium text-gray-800 leading-tight">
                {bubbleMessages[bubbleIndex]}
              </p>

              <div className="mt-1 sm:mt-2.5 flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wide sm:tracking-widest text-[#015f86]">
                  Asistente Tami
                </span>

                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]"></span>
              </div>
            </div>

            {/* 🔥 PASO 6: El piquito del globo cambia de lado en Desktop (tailClasses) */}
            <div className={`bg-white/90 backdrop-blur-xl border-r border-b border-white/40 w-5 h-5 rounded-sm ${tailClasses}`}></div>
          </div>
        )}

        <button
          onClick={toggleChat}
          className="relative group w-16 h-16 rounded-[24px] bg-gradient-to-tr from-[#015f86] to-[#0d9488] text-white shadow-[0_15px_35px_rgba(1,95,134,0.3)] flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-110 hover:-translate-y-1 active:scale-95 active:shadow-inner"
          aria-label="Abrir Chatbot"
        >
          <div className="absolute inset-0 bg-white/15 rounded-[24px] scale-0 group-hover:scale-100 transition-transform duration-500"></div>

          <ChatbotIcon />

          <span className="absolute -top-1.5 -right-1.5 flex h-7 w-7">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>

            <span className="relative inline-flex rounded-full h-7 w-7 bg-red-500 border-4 border-white shadow-md items-center justify-center text-[10px] font-extrabold text-white">
              1
            </span>
          </span>
        </button>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;