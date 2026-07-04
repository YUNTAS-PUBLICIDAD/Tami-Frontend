export interface ApiProduct {
  nombre?: string;
  titulo?: string;
  link?: string;
  seccion?: string;
}

interface CatalogMatch {
  product: ApiProduct;
  link: string;
  score: number;
}

export interface ChatContextMinimal {
  paso?: string;
  categoria?: 'negocio' | 'maquinaria' | 'decoracion' | string;
  producto?: string;
  uso?: string;
  ciudad?: string;
  nombre?: string;
  telefono?: string;
  pedido?: string;
  rubro?: string,
  referencia_pedido?: string;
}

export interface MessageMinimal {
  role: 'bot' | 'user';
  tipo: 'texto' | 'producto' | 'opciones' | 'fin_flujo';
  respuesta: string;
  link_producto?: string;
  link_whatsapp?: string;
}

const SEARCH_STOPWORDS = new Set([
  'a', 'ante', 'bajo', 'cabe', 'con', 'contra', 'de', 'desde', 'durante', 'en',
  'entre', 'hacia', 'hasta', 'mediante', 'para', 'por', 'segun', 'sin', 'so',
])

export const DEFAULT_WHATSAPP =
  'https://wa.me/51978883199?text=Hola%20Tami%2C%20quisiera%20informaci%C3%B3n%20para%20mi%20negocio.';

export const buildProductLink = (link: string) => `/catalogo-maquinarias/detalle?link=${link}`;

const resolveProductLink = (rawLink?: string): string | null => {
  if (!rawLink) return null;
  const clean = rawLink.trim();
  if (!clean) return null;
  if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
  if (clean.startsWith('/catalogo-maquinarias/detalle?link=')) return clean;
  if (clean.startsWith('/catalogo-maquinarias/')) return clean;
  if (clean.startsWith('/')) return `/catalogo-maquinarias/detalle?link=${clean.slice(1)}`;
  return buildProductLink(clean);
};

export const normalizeText = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const includesAny = (text: string, terms: string[]) =>
  terms.some((term) => text.includes(term));

const collapseWhitespace = (text: string) => text.replace(/\s+/g, ' ').trim();

const toDisplayCase = (text: string) =>
  collapseWhitespace(text)
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export const GREETING_REPLY =
  '¡Hola! 👋 Soy Tami Bot. ¿Qué estás buscando hoy para tu negocio o en qué te puedo ayudar? 😊\n\nPuedo ayudarte con negocio, maquinaria o decoración.';

interface LocalReplyResult {
  message: MessageMinimal;
  nextPaso?: string;
  contextPatch?: Partial<ChatContextMinimal>;
}


const collapseWhitespaceQuery = (query: string): string => {
  const normalized = normalizeText(query);
  if (!normalized) return '';
  const tokens = normalized.split(' ').filter(Boolean);
  const filtered = tokens.filter((token) => !SEARCH_STOPWORDS.has(token));
  if (filtered.length === 0) return tokens.slice(-2).join(' ').trim();
  return filtered.join(' ').trim();
};

export const getLocalReply = async (
  text: string,
  context: ChatContextMinimal | null,
  messages: MessageMinimal[]
): Promise<LocalReplyResult | null> => {
  const normalized = normalizeText(text);
  const currentPaso = context?.paso || '';

  // 1. FLUJO LOCAL ESTRUCTURADO: Capturar los datos para el asesor humano
  if (currentPaso === 'local_esperando_datos_asesor') {
    const datosIngresados = collapseWhitespace(text);

    const textoWhatsApp = `Hola Tami Maquinarias, solicito un asesor experto.\n\n` +
      `• *Información del cliente:* ${datosIngresados}`;

    const linkDinamicoAsesor = `https://wa.me/51978883199?text=${encodeURIComponent(textoWhatsApp)}`;

    return {
      message: {
        role: 'bot',
        tipo: 'fin_flujo',
        respuesta: '¡Buenísimo! Ya te conecto con el asesor experto en tu rubro. Te escribirá en un par de minutos por WhatsApp. 📲',
        link_whatsapp: linkDinamicoAsesor,
      },
      nextPaso: 'menu_principal',
      contextPatch: {
        rubro: datosIngresados,
      },
    };
  }

  // 4. Captura de datos de seguimiento de pedidos
  if (currentPaso === 'esperando_datos_pedido') {
    const referenciaPedido = collapseWhitespace(text);
    return {
      message: {
        role: 'bot',
        tipo: 'texto',
        respuesta: 'Entendido, dame un segundo para verificar...',
      },
      nextPaso: 'menu_principal',
      contextPatch: {
        pedido: referenciaPedido,
        referencia_pedido: referenciaPedido,
      },
    };
  }

  return null;
};

/**
 * Envía el mensaje al servidor Laravel para ser procesado por la IA de Groq (Llama 3)
 */export const fetchIaReply = async (mensajeUsuario: string): Promise<MessageMinimal> => {
  try {
    const baseUrl = import.meta.env.PUBLIC_API_URL || import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    const url = `${baseUrl}/api/v1/chat/responder`;

    const sessionId = localStorage.getItem('chatSessionId') || crypto.randomUUID();
    localStorage.setItem('chatSessionId', sessionId);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        chatbotTami: mensajeUsuario,
        mensaje: mensajeUsuario,
        sessionId,
      }),
    });

    const data = await response.json();
    console.log('Respuesta Laravel:', data);

    if (!response.ok) {
      throw new Error(`Error en servidor: ${response.status}`);
    }

   return {
    role: 'bot',
    tipo: data.link_whatsapp ? 'fin_flujo' : 'texto',
    respuesta: data.response || data.output || data.respuesta,
    link_whatsapp: data.link_whatsapp,
   };
  } catch (error) {
    console.error('Error frontend chatbot:', error);
    return {
      role: 'bot',
      tipo: 'texto',
      respuesta: 'No pude conectar con el servidor del chatbot.',
    };
  }

};