import React, { useState, useEffect, useRef } from 'react';
import robotIcon from "../../../assets/icons/Icono-para--oficialpng.png";
import type { Opcion, Message, ChatContext } from "./types";
import { getLocalReply, GREETING_REPLY, fetchIaReply } from "./chatbotLogic";
import ChatbotIcon from "./ChatbotIcon";
import ChatbotScreen from "./ChatbotScreen";
import type { ChatbotScreenProps } from "./ChatbotScreen";
import { apiClient } from 'src/services/apiClient';
import { config } from 'config';

const MESSAGES_KEY = 'tami_chat_messages';
const CONTEXT_KEY = 'tami_chat_context';
const OPEN_KEY = 'tami_chat_open';

const mensajeInicial: Message = {
  role: 'bot',
  tipo: 'texto',
  respuesta: GREETING_REPLY,
};

const ChatbotWidget: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([mensajeInicial]);
  const [context, setContext] = useState<ChatContext | null>({ paso: 'menu_principal' });

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hasHydratedStorage, setHasHydratedStorage] = useState(false);

  const [showBubble, setShowBubble] = useState(true);
  const [isTyping, setIsTyping] = useState(true);
  const [isPopping, setIsPopping] = useState(false);
  const [bubbleIndex, setBubbleIndex] = useState(0);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [icono, setIcono] = useState(robotIcon);
  const [activeSalute, setActiveSalute] = useState<string>(GREETING_REPLY);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isFirstBubble = useRef(true);

  // Cargar saludo e icono
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await apiClient.get(config.endpoints.chatbot.getSalute);
        if (response.data?.success && response.data?.salute) {
          const dbSalute = response.data.salute;
          setActiveSalute(dbSalute);
          setMessages((prev) => {
            if (
              prev.length === 1 &&
              prev[0].role === 'bot' &&
              (prev[0].respuesta === GREETING_REPLY || prev[0].respuesta.startsWith('¡Hola! 👋 Soy Tamara'))
            ) {
              return [{ ...prev[0], respuesta: dbSalute }];
            }
            return prev;
          });
        }
      } catch (err) {
        console.error("Error al obtener saludo del chatbot:", err);
      }
    };

    const idleId = 'requestIdleCallback' in window
      ? window.requestIdleCallback(fetchConfig)
      : setTimeout(fetchConfig, 1500);

    return () => {
      if ('cancelIdleCallback' in window && typeof idleId === 'number') window.cancelIdleCallback(idleId);
      else clearTimeout(idleId as any);
    };
  }, []);

  // If we have only the greeting message shown and default context, move to expecting product
  useEffect(() => {
    try {
      if (messages.length === 1 && messages[0].role === 'bot' && context?.paso === 'menu_principal') {
        setContext((prev) => ({ ...(prev || { paso: 'menu_principal' }), paso: 'esperando_producto' }));
      }
    } catch (e) {
      // ignore
    }
  }, [messages, context]);

  const bubbleMessages = [
    "¿Tienes dudas sobre nuestros productos? ¡Pregúntame! 🌾",
    "¡Hola! ¿Buscas alguna maquinaria en especial? 🚜",
    "¿Sabías que tenemos financiamiento disponible? 💳",
    "¿Necesitas repuestos? Puedo ayudarte a ubicarlos. ⚙️",
    "¿Buscas algo para tu negocio? 👨‍💼",
  ];

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

  const isFirstOpenRef = useRef(true);

  useEffect(() => {
    if (!isOpen) {
      isFirstOpenRef.current = true;
      return;
    }
    if (!messagesEndRef.current) return;

    const behavior = isFirstOpenRef.current ? 'auto' : 'smooth';
    messagesEndRef.current.scrollIntoView({ behavior });
    isFirstOpenRef.current = false;
  }, [messages, isOpen]);

  const toggleChat = () => {
    setIsOpen(prev => !prev);
    if (!isOpen) { setShowBubble(false); setIsPopping(false); }
  };

  const reiniciarChat = () => {
    if (isLoading || isResetting) return;
    setIsResetting(true);
    setTimeout(() => {
      setMessages([{
        role: 'bot',
        tipo: 'texto',
        respuesta: activeSalute,
      }]);
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
    if (valorEnviado.trim().length > 300) {
      setMessages(prev => [
        ...prev,
        { role: 'user', tipo: 'texto', respuesta: labelMostrado },
        {
          role: 'bot',
          tipo: 'texto',
          respuesta: '⚠️ Tu mensaje es demasiado largo. Por favor, escribe una consulta más breve y directa para poder ayudarte mejor. 😊'
        }
      ]);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 60);
      return;
    }

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

      const botMessage = await fetchIaReply(valorEnviado);

      await new Promise(resolve => setTimeout(resolve, 1200));

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error("Error en Chatbot Fallback:", error);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessages(prev => [...prev, {
        role: 'bot',
        tipo: 'texto',
        respuesta: 'Ups, tuvimos un problema de conexión 😅. Si urge, contáctanos directo a nuestro WhatsApp.',
        link_whatsapp: 'https://wa.me/51978883199?text=Hola,%20me%20fall%C3%B3%20el%20bot%20y%20necesito%20ayuda.'
      }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 60);
    }
  };

  const screenProps: ChatbotScreenProps = {
    messages,
    context,
    isLoading,
    isResetting,
    input,
    messagesEndRef,
    inputRef,
    onClose: toggleChat,
    onReset: reiniciarChat,
    onInputChange: setInput,
    onSendMessage: sendMessage,
    onOpcionClick: handleOpcionClick,
  };

  return (
    <div className="fixed z-50 bottom-0 right-6 flex flex-col items-end font-montserrat pointer-events-none">
      {isOpen ? (
        <ChatbotScreen {...screenProps} />
      ) : (
        /* Botón Flotante */
        <div className="relative flex items-end mb-8 pointer-events-auto">
          {showBubble && (
            <div className={`absolute bottom-0 right-[80px] group w-max max-w-[220px] sm:max-w-[280px] origin-bottom-right ${isPopping ? "animate-balloon-pop" : "animate-in slide-in-from-right-10 fade-in duration-500"}`}>
              <div
                className="w-full min-h-[72px] sm:min-h-[88px] flex flex-col justify-center bg-white/90 backdrop-blur-xl border border-white/40 p-3 sm:p-5 rounded-[24px] rounded-br-[4px] shadow-[0_15px_50px_rgba(0,0,0,0.15)] relative cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95"
                onClick={() => {
                  setIsOpen(true);
                  setShowBubble(false);
                }}
              >
                <button
                  onClick={handleCloseBubble}
                  aria-label="Cerrar"
                  className="absolute -top-1.5 -right-1.5 sm:-top-2.5 sm:-right-2.5 w-6 h-6 sm:w-7 sm:h-7 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 shadow-lg transition-all hover:scale-110 active:scale-90"
                >
                  <svg width="12" height="12" className="sm:w-3.5 sm:h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>

                {isTyping ? (
                  <div className="flex items-center gap-1.5 py-2 px-3 justify-center bg-grey-600 min-w-[65px] mx-auto rounded-xl">
                    <div className="w-2 h-2 bg-[#015f86] rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-[#015f86] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                    <div className="w-2 h-2 bg-[#015f86] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                  </div>
                ) : (
                  <p className="text-[13px] sm:text-[14px] font-medium text-gray-800 leading-tight">
                    {bubbleMessages[bubbleIndex]}
                  </p>
                )}

                <div className="mt-1 sm:mt-2.5 flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wide sm:tracking-widest text-[#015f86]">
                    Asistente Tamara
                  </span>
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]"></span>
                </div>
              </div>
              <div className="absolute bottom-6 -right-2 w-5 h-5 bg-white/90 backdrop-blur-xl border-r border-b border-white/40 transform rotate-[-45deg] rounded-sm"></div>
            </div>
          )}
          <button
            onClick={toggleChat}
            className="relative group w-16 h-16 rounded-[24px] bg-gradient-to-tr from-[#015f86]/0 to-[#0d9488]/0 text-white shadow-[0_15px_35px_rgba(1,95,134,0.3)] flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-110 hover:-translate-y-1 active:scale-95 active:shadow-inner"
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
