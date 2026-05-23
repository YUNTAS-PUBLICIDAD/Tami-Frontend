export interface ApiProduct {
  nombre?: string;
  titulo?: string;
  link?: string;
}

interface CatalogMatch {
  product: ApiProduct;
  link: string;
  score: number;
}

export interface ChatContextMinimal {
  paso?: string;
}

export interface MessageMinimal {
  role: 'bot' | 'user';
  tipo: 'texto' | 'producto' | 'opciones' | 'fin_flujo';
  respuesta: string;
  link_producto?: string;
  link_whatsapp?: string;
}

export const DEFAULT_WHATSAPP =
  'https://wa.me/51978883199?text=Hola%20Tami%2C%20quisiera%20informaci%C3%B3n%20para%20mi%20negocio.';

export const buildProductLink = (link: string) => `/productos/${link}`;

const resolveProductLink = (rawLink?: string): string | null => {
  if (!rawLink) return null;
  const clean = rawLink.trim();
  if (!clean) return null;
  if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
  if (clean.startsWith('/productos/')) return clean;
  if (clean.startsWith('/')) return `/productos${clean}`;
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

const GREETING_REPLY =
  '¡Hola! 👋 Soy Tami Bot. ¿Qué estás buscando hoy para tu negocio o en qué te puedo ayudar? 😊\n\nPuedo ayudarte con negocio, maquinaria o decoración.';

interface ScriptedProductIntent {
  key: string;
  labels: string[];
  intro: string;
  fallbackSlug?: string;
}

const SCRIPTED_PRODUCT_INTENTS: ScriptedProductIntent[] = [
  { key: 'soldadora-spark-mig-250', labels: ['soldadora spark mig 250', 'spark mig 250', 'mig 250'], intro: '¡Excelente opción! ⚙️ La Spark MIG 250 te da un soldado más estable, preciso y profesional para trabajos exigentes.', fallbackSlug: 'soldadora-spark-mig-250' },
  { key: 'maquina-selladora-bolsas-liquidos', labels: ['maquina selladora de bolsas para liquidos', 'selladora de bolsas para liquidos', 'selladora de liquidos', 'selladora liquidos'], intro: '¡Buenísima opción! 🧪 Sella bolsas de jugos, agua o salsas de forma rápida, higiénica y sin derrames.', fallbackSlug: 'maquina-selladora-bolsas-liquidos' },
  { key: 'maquina-selladora-bolsas-solidos', labels: ['maquina selladora de bolsas para solidos', 'selladora de bolsas para solidos', 'selladora bolsas solidos', 'bolsas para solidos'], intro: '¡Excelente para empaque de sólidos! 📦 Te ayuda a sellar con rapidez y mantener mejor la calidad del producto.', fallbackSlug: 'maquina-selladora-bolsas-solidos' },
  { key: 'maquina-embalaje-te', labels: ['maquina de embalaje de te', 'embalaje de te', 'maquina de te', 'maquina te', 'te en saquitos'], intro: '¡Excelente elección! 🍃 Automatiza el empaque en saquitos, ahorra tiempo y eleva tu producción.', fallbackSlug: 'maquina-de-embalaje-de-te' },
  { key: 'selladora-vaso-manual', labels: ['selladora de vaso manual', 'selladora de vasos manual', 'selladora de vasos', 'selladora de vaso'], intro: '¡Perfecta para emprender! 🧋 Sella vasos de manera rápida y profesional, ideal para bebidas como bubble tea, jugos y postres.', fallbackSlug: 'selladora-de-vasos' },
  { key: 'selladora-por-induccion', labels: ['selladora por induccion', 'selladora de induccion', 'induccion'], intro: '¡Muy buena opción! ⚡ Sella envases de forma hermética y segura, ayudando a conservar mejor tus productos y dar una presentación más profesional.', fallbackSlug: 'selladora-de-induccion' },
  { key: 'soldadora-lingba', labels: ['soldadora lingba', 'selladora lingba', 'lingba'], intro: '¡Una de las más pedidas! 📦 Es súper resistente, ideal para sellar bolsas de plástico rápido y con acabado profesional.', fallbackSlug: 'soldadora-lingba' },
  { key: 'ventilador-holografico', labels: ['ventilador holografico', 'holografico', 'holograma'], intro: '¡Espectacular para llamar la atención! 👁️✨ Proyecta tus productos en 3D flotante y atrae clientes a tu local.', fallbackSlug: 'ventilador-holografico' },
  { key: 'sillas-cuadradas-o-de-cubo', labels: ['sillas cuadradas o de cubo', 'sillas de cubo', 'sillas cuadradas cubo', 'silla cuadrada de cubo'], intro: '¡Muy buena elección! ✨ Las sillas cuadradas o de cubo aportan un estilo moderno y práctico para tu espacio.', fallbackSlug: 'sillas-cuadradas-o-de-cubo' },
  { key: 'silla-bar-led-alta', labels: ['silla bar led alta', 'silla led alta', 'silla bar alta led', 'silla alta led'], intro: '¡Genial! ✨ La silla bar LED alta da un look moderno y llamativo para bares, eventos o zonas lounge.', fallbackSlug: 'silla-bar-led-alta' },
  { key: 'mesa-led-bar-alta-cuadrada', labels: ['mesa led bar alta cuadrada', 'mesa led alta cuadrada', 'mesa cuadrada led alta'], intro: '¡Genial! ✨ La mesa LED bar alta cuadrada es perfecta para bares o eventos con estilo moderno.', fallbackSlug: 'mesa-led-bar-alta-cuadrada' },
  { key: 'mesa-led-bar-alta', labels: ['mesa led bar alta', 'mesa led alta'], intro: '¡Genial! ✨ Tenemos muebles LED y opciones modernas para bares o eventos. ¿Cuál te gustaría conocer? 😍', fallbackSlug: 'mesa-led-bar-alta' },
  { key: 'purificador-agua', labels: ['purificador de agua', 'purificador agua', 'purificador'], intro: '¡Excelente elección! 💧 Obtén agua más limpia y segura para tu negocio u hogar con un sistema práctico y eficiente.', fallbackSlug: 'purificador-de-agua' },
];

const CATEGORY_KEYWORDS = {
  negocio: ['negocio', 'empresa', 'emprendimiento'],
  maquinaria: ['maquinaria', 'maquina', 'selladora', 'purificador', 'ventilador', 'sierra', 'compresor', 'taladro', 'lijadora', 'aspiradora', 'impresora', 'embalaje', 'induccion'],
  decoracion: ['decoracion', 'decorar', 'mueble', 'muebles', 'led'],
};

const CATEGORY_REPLIES = {
  negocio: '¡Perfecto! Cuéntame qué estás pensando mejorar o implementar en tu negocio hoy. 😊\n\nClaro 😊 ¿Buscas algo para maquinaria, decoración o para tu negocio? Cuéntame un poco más y te ayudo a encontrar lo ideal.',
  maquinaria: '¡Perfecto! 😊 Te ayudo con eso.\n\nTenemos máquinas para envasado, sellado y purificación de agua. Dime qué producto quieres trabajar y te recomiendo el ideal 👍',
  decoracion: '¡Genial! ✨ Tenemos muebles LED y opciones modernas para bares o eventos. ¿Es para un local, evento o algo especial? 😊',
};

let cachedCatalog: ApiProduct[] | null = null;
export const getCatalog = async (): Promise<ApiProduct[]> => {
  if (cachedCatalog) return cachedCatalog;
  try {
    const res = await fetch('/api/productos', { headers: { Accept: 'application/json' } });
    if (!res.ok) return [];
    const json = await res.json();
    const list = Array.isArray(json?.data) ? json.data : [];
    cachedCatalog = list;
    return list;
  } catch {
    return [];
  }
};

export const findProductLinkByTerms = async (terms: string[], fallbackSlug?: string): Promise<string | null> => {
  const catalog = await getCatalog();
  const normalizedTerms = terms.map((t) => normalizeText(t));

  let bestMatch: { score: number; link: string } | null = null;

  for (const product of catalog) {
    const haystack = normalizeText(`${product.nombre || ''} ${product.titulo || ''} ${product.link || ''}`);
    if (!haystack) continue;

    const link = resolveProductLink(product.link);
    if (!link) continue;

    const score = normalizedTerms.reduce((acc, term) => {
      if (!term) return acc;
      if (haystack === term) return acc + 100;
      if (haystack.includes(term)) return acc + Math.max(10, term.length);
      return acc;
    }, 0);

    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { score, link };
    }
  }

  if (bestMatch) return bestMatch.link;
  if (fallbackSlug) return buildProductLink(fallbackSlug);
  return null;
};

export const createProductPitch = async (
  intro: string,
  terms: string[],
  fallbackSlug?: string
): Promise<MessageMinimal> => {
  const link = await findProductLinkByTerms(terms, fallbackSlug);
  return {
    role: 'bot',
    tipo: 'texto',
    respuesta: `${intro}\n\n👉 Puedes ver los detalles aquí:`,
    link_producto: link || undefined,
    link_whatsapp: DEFAULT_WHATSAPP,
  };
};

const productLabel = (product: ApiProduct): string =>
  product.nombre?.trim() || product.titulo?.trim() || product.link?.trim() || 'Producto';

const productSearchText = (product: ApiProduct): string =>
  normalizeText(`${product.nombre || ''} ${product.titulo || ''} ${product.link || ''}`);

const SEARCH_STOPWORDS = new Set([
  'busco',
  'buscar',
  'necesito',
  'quiero',
  'deseo',
  'tienen',
  'tienes',
  'hay',
  'alguna',
  'alguno',
  'un',
  'una',
  'el',
  'la',
  'los',
  'las',
  'de',
  'del',
  'para',
  'por',
  'favor',
  'cotizar',
  'cotizacion',
  'info',
  'informacion',
  'sobre',
  'producto',
  'productos',
  'maquinaria',
]);

const GREETING_WORDS = [
  'hola',
  'buenas',
  'buenos dias',
  'buenas tardes',
  'buenas noches',
  'alo',
  'hello',
  'hi',
  'ey',
  'que tal',
];

const extractCoreProductQuery = (query: string): string => {
  const normalized = normalizeText(query);
  if (!normalized) return '';

  const tokens = normalized.split(' ').filter(Boolean);
  const filtered = tokens.filter((token) => !SEARCH_STOPWORDS.has(token));

  if (filtered.length === 0) {
    return tokens.slice(-2).join(' ').trim();
  }

  return filtered.join(' ').trim();
};

const findCatalogMatches = async (query: string): Promise<{ exact: CatalogMatch | null; related: CatalogMatch[]; normalizedQuery: string }> => {
  const catalog = await getCatalog();
  const normalizedQuery = extractCoreProductQuery(query);
  if (!normalizedQuery || normalizedQuery.length < 3) return { exact: null, related: [], normalizedQuery };

  const queryTokens = normalizedQuery.split(' ').filter((token) => token.length >= 3);
  const exactCandidates: CatalogMatch[] = [];
  const relatedCandidates: CatalogMatch[] = [];

  for (const product of catalog) {
    const text = productSearchText(product);
    if (!text) continue;

    const link = resolveProductLink(product.link);
    if (!link) continue;

    if (text.includes(normalizedQuery)) {
      const score = 100 + normalizedQuery.length + (text.startsWith(normalizedQuery) ? 20 : 0);
      exactCandidates.push({ product, link, score });
      continue;
    }

    const overlapScore = queryTokens.reduce((acc, token) => {
      if (text.includes(token)) return acc + token.length;
      return acc;
    }, 0);

    if (overlapScore > 0) {
      relatedCandidates.push({ product, link, score: overlapScore });
    }
  }

  exactCandidates.sort((a, b) => b.score - a.score);
  relatedCandidates.sort((a, b) => b.score - a.score);

  return {
    exact: exactCandidates[0] || null,
    related: relatedCandidates.slice(0, 3),
    normalizedQuery,
  };
};

const looksLikeProductSearch = (normalized: string, lastBotMessage?: MessageMinimal): boolean => {
  const lastBotText = normalizeText(lastBotMessage?.respuesta || '');
  const userWasAskedForProduct = includesAny(lastBotText, [
    'en que productos estas interesado',
    'cual te gustaria conocer',
    'te ayudo a encontrar lo ideal',
  ]);

  const tokens = normalized.split(' ').filter(Boolean);
  const shortDirectQuery = tokens.length > 0 && tokens.length <= 3 && !includesAny(normalized, ['asesor', 'whatsapp', 'precio']);

  const hasProductHint = includesAny(normalized, [
    'busco',
    'quiero',
    'necesito',
    'tienen',
    'producto',
    'maquina',
    'maquinaria',
    'selladora',
    'purificador',
    'ventilador',
    'soldadora',
    'taladro',
    'sierra',
    'lijadora',
    'compresor',
    'aspiradora',
    'impresora',
    'embalaje',
    'induccion',
  ]);

  return userWasAskedForProduct || hasProductHint || shortDirectQuery;
};

const looksLikeGreeting = (normalized: string): boolean => {
  if (!normalized) return false;
  return GREETING_WORDS.some((word) => normalized === word || normalized.startsWith(`${word} `) || normalized.includes(` ${word} `));
};

const getCategoryFromQuery = (normalized: string): keyof typeof CATEGORY_KEYWORDS | null => {
  if (includesAny(normalized, CATEGORY_KEYWORDS.decoracion)) return 'decoracion';
  if (includesAny(normalized, CATEGORY_KEYWORDS.maquinaria)) return 'maquinaria';
  if (includesAny(normalized, CATEGORY_KEYWORDS.negocio)) return 'negocio';
  return null;
};

const findScriptedIntent = (normalized: string): ScriptedProductIntent | null => {
  for (const intent of SCRIPTED_PRODUCT_INTENTS) {
    if (includesAny(normalized, intent.labels)) return intent;
  }
  return null;
};

const extractPrefixedProductTokens = (query: string): string[] => {
  const normalized = extractCoreProductQuery(query);
  if (!normalized) return [];
  return normalized.split(' ').filter(Boolean);
};

const findProductsByPrefix = async (query: string): Promise<{ exact: CatalogMatch | null; exactCandidates: CatalogMatch[]; prefixed: CatalogMatch[] }> => {
  const catalog = await getCatalog();
  const normalizedQuery = extractCoreProductQuery(query);
  if (!normalizedQuery || normalizedQuery.length < 2) return { exact: null, exactCandidates: [], prefixed: [] };

  const exactCandidates: CatalogMatch[] = [];
  const prefixedCandidates: CatalogMatch[] = [];

  for (const product of catalog) {
    const text = productSearchText(product);
    const link = resolveProductLink(product.link);
    if (!text || !link) continue;

    const containsQuery = text.includes(normalizedQuery);

    if (containsQuery) {
      const score = 100 + normalizedQuery.length;
      exactCandidates.push({ product, link, score });
      continue;
    }

    if (text.startsWith(normalizedQuery)) {
      const score = normalizedQuery.length + 15;
      prefixedCandidates.push({ product, link, score });
    }
  }

  exactCandidates.sort((a, b) => b.score - a.score);
  prefixedCandidates.sort((a, b) => b.score - a.score);

  return {
    exact: exactCandidates[0] || null,
    exactCandidates,
    prefixed: prefixedCandidates,
  };
};

const resolveProductQuery = async (
  query: string
): Promise<{ message: MessageMinimal; nextPaso?: string } | null> => {
  const normalizedQuery = extractCoreProductQuery(query);
  if (!normalizedQuery) return null;

  const scriptedIntent = findScriptedIntent(normalizedQuery);
  const prefixMatches = await findProductsByPrefix(query);
  const fallbackMatches = await findCatalogMatches(query);
  const displayQuery = fallbackMatches.normalizedQuery || normalizedQuery;

  const exactCandidates = prefixMatches.exactCandidates;
  const uniqueCandidates = Array.from(
    new Map(
      [...exactCandidates, ...prefixMatches.prefixed].map((item) => [item.link, item])
    ).values()
  );

  if (exactCandidates.length === 1) {
    const match = exactCandidates[0];
    return {
      message: {
        role: 'bot',
        tipo: 'texto',
        respuesta: scriptedIntent
          ? `${scriptedIntent.intro}\n\n👉 Puedes ver los detalles aquí:`
          : `¡Sí! Tenemos ${productLabel(match.product)}.\n\n👉 Puedes ver los detalles aquí:`,
        link_producto: match.link,
        link_whatsapp: DEFAULT_WHATSAPP,
      },
    };
  }

  if (exactCandidates.length > 1) {
    const options = uniqueCandidates.slice(0, 4).map((item) => `• ${productLabel(item.product)}`).join('\n');
    return {
      message: {
        role: 'bot',
        tipo: 'texto',
        respuesta: `Encontré varias opciones para "${displayQuery}". ¿Cuál de estas buscas?\n${options}`,
      },
    };
  }

  if (fallbackMatches.exact) {
    return {
      message: {
        role: 'bot',
        tipo: 'texto',
        respuesta: scriptedIntent
          ? `${scriptedIntent.intro}\n\n👉 Puedes ver los detalles aquí:`
          : `¡Sí! Tenemos ${productLabel(fallbackMatches.exact.product)}.\n\n👉 Puedes ver los detalles aquí:`,
        link_producto: fallbackMatches.exact.link,
        link_whatsapp: DEFAULT_WHATSAPP,
      },
    };
  }

  if (uniqueCandidates.length > 1) {
    const options = uniqueCandidates.slice(0, 4).map((item) => `• ${productLabel(item.product)}`).join('\n');
    return {
      message: {
        role: 'bot',
        tipo: 'texto',
        respuesta: `Encontré varias opciones parecidas para "${displayQuery}". ¿Cuál te interesa exactamente?\n${options}`,
      },
    };
  }

  if (uniqueCandidates.length === 1) {
    const match = uniqueCandidates[0];
    return {
      message: {
        role: 'bot',
        tipo: 'texto',
        respuesta: scriptedIntent
          ? `${scriptedIntent.intro}\n\n👉 Puedes ver los detalles aquí:`
          : `¡Sí! Tenemos ${productLabel(match.product)}.\n\n👉 Puedes ver los detalles aquí:`,
        link_producto: match.link,
        link_whatsapp: DEFAULT_WHATSAPP,
      },
    };
  }

  if (fallbackMatches.related.length > 0) {
    const relatedLines = fallbackMatches.related.map((item) => `• ${productLabel(item.product)}`).join('\n');
    return {
      message: {
        role: 'bot',
        tipo: 'texto',
        respuesta: `No vi exactamente "${displayQuery}", pero sí tengo opciones parecidas que te pueden servir:\n${relatedLines}\n\n👉 Te dejo una opción relacionada aquí:`,
        link_producto: fallbackMatches.related[0].link,
        link_whatsapp: DEFAULT_WHATSAPP,
      },
    };
  }

  if (scriptedIntent) {
    return {
      message: {
        role: 'bot',
        tipo: 'texto',
        respuesta: `No logré ubicar "${displayQuery}" por ahora 😅, pero si me cuentas un poquito más de lo que necesitas, te recomiendo una opción ideal o te conecto por WhatsApp.`,
        link_whatsapp: DEFAULT_WHATSAPP,
      },
    };
  }

  return null;
};

export const getLocalReply = async (
  text: string,
  context: ChatContextMinimal | null,
  messages: MessageMinimal[]
): Promise<{ message: MessageMinimal; nextPaso?: string } | null> => {
  const normalized = normalizeText(text);
  const currentPaso = context?.paso || '';
  const lastBotMessage = [...messages].reverse().find((msg) => msg.role === 'bot');

  if (looksLikeGreeting(normalized)) {
    return {
      message: {
        role: 'bot',
        tipo: 'texto',
        respuesta: GREETING_REPLY,
      },
      nextPaso: 'esperando_producto',
    };
  }

  if (currentPaso === 'esperando_producto') {
    const category = getCategoryFromQuery(normalized);
    if (category) {
      return {
        message: {
          role: 'bot',
          tipo: 'texto',
          respuesta: CATEGORY_REPLIES[category],
        },
      };
    }

    const productReply = await resolveProductQuery(text);
    if (productReply) return productReply;

    if (!looksLikeProductSearch(normalized, lastBotMessage)) {
      return {
        message: {
          role: 'bot',
          tipo: 'texto',
          respuesta:
            'Para tener una mejor comunicación, mejor escríbeme por WhatsApp y te ayudo directamente con lo que necesites. 📲',
          link_whatsapp: DEFAULT_WHATSAPP,
        },
        nextPaso: 'menu_principal',
      };
    }
  }

  if (currentPaso === 'local_esperando_datos_asesor') {
    return {
      message: {
        role: 'bot',
        tipo: 'fin_flujo',
        respuesta: '¡Buenísimo! Ya te conecto con el asesor experto en tu rubro. Te escribirá en un par de minutos por WhatsApp. 📲',
        link_whatsapp: DEFAULT_WHATSAPP,
      },
      nextPaso: 'menu_principal',
    };
  }

  if (includesAny(normalized, ['asesor', 'humano', 'persona', 'agente', 'vendedor'])) {
    return {
      message: {
        role: 'bot',
        tipo: 'texto',
        respuesta: '¡Por supuesto! Para pasarte con el asesor ideal: ¿De qué es tu negocio y en qué ciudad estás? 😊',
      },
      nextPaso: 'local_esperando_datos_asesor',
    };
  }

  if (looksLikeProductSearch(normalized, lastBotMessage)) {
    const productReply = await resolveProductQuery(text);
    if (productReply) return productReply;
  }

  if (includesAny(normalized, ['busco maquinaria', 'maquinaria', 'maquina', 'selladora', 'embalaje', 'negocio'])) {
    return {
      message: {
        role: 'bot',
        tipo: 'texto',
        respuesta: '¡Genial! Vendemos purificador de agua, selladora de vasos manual, ventilador holográfico y más. ¿En qué productos estás interesado?',
      },
    };
  }

  return null;
};
