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
  producto?: string;
  uso?: string;
  ciudad?: string;
  nombre?: string;
  telefono?: string;
  pedido?: string;
  referencia_pedido?: string;
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

const PRODUCT_CONTACT_STEP_1 = 'esperando_uso_producto';
const PRODUCT_CONTACT_STEP_2 = 'esperando_ciudad_producto';
const PRODUCT_CONTACT_STEP_3 = 'esperando_nombre_producto';
const PRODUCT_CONTACT_STEP_4 = 'esperando_telefono_producto';

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

const collapseWhitespace = (text: string) => text.replace(/\s+/g, ' ').trim();

const toDisplayCase = (text: string) =>
  collapseWhitespace(text)
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export const GREETING_REPLY =
  '¡Hola! 👋 Soy Tami Bot. ¿Qué estás buscando hoy para tu negocio o en qué te puedo ayudar? 😊\n\nPuedo ayudarte con negocio, maquinaria o decoración.';

interface ScriptedProductIntent {
  key: string;
  labels: string[];
  intro: string;
  fallbackSlug?: string;
}

interface LocalReplyResult {
  message: MessageMinimal;
  nextPaso?: string;
  contextPatch?: Partial<ChatContextMinimal>;
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
  negocio: 'Perfecto 💪 Tenemos equipos de soldadura y maquinaria para negocio e industria. Cuéntame qué necesitas producir y te ayudo a elegir.',
  maquinaria: '¡Genial! Vendemos purificador de agua, selladora de vasos manual, ventilador holografico y más. ¿En qué productos estás interesado?',
  decoracion: '¡Me encanta! Tenemos sillas cubo, mesas y sillas altas con luces LED. ¿Cuál te gustaría conocer? 😍',
};

const INFO_OR_COTIZACION_REPLY =
  'Claro 😊 ¿Buscas algo para maquinaria, decoración o para tu negocio? Cuéntame un poco más y te ayudo a encontrar lo ideal.';

const BROAD_CATEGORY_PHRASES = [
  'busco maquinaria',
  'busco decoracion',
  'busco negocio',
  'maquinaria',
  'decoracion',
  'negocio',
  'para mi negocio',
  'para mi local',
  'para mi empresa',
  'info',
  'informacion',
  'cotizacion',
  'cotizar',
];

const ORDER_TRACKING_PHRASES = [
  'pedido',
  'seguimiento',
  'rastrear',
  'tracking',
  'estado de mi pedido',
  'numero de pedido',
  'número de pedido',
];

const CATEGORY_PRODUCT_LIMIT = 3;

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

const buildWhatsAppProductText = (context: ChatContextMinimal): string => {
  const nombre = toDisplayCase(context.nombre || 'Cliente');
  const producto = toDisplayCase(context.producto || 'el producto consultado');
  const ciudad = toDisplayCase(context.ciudad || 'tu ciudad');
  const uso = context.uso ? toDisplayCase(context.uso) : '';
  const telefono = context.telefono ? collapseWhitespace(context.telefono) : '';

  let text = `Hola, soy *${nombre}*. Estoy interesado en: *${producto}*. Ciudad: *${ciudad}*.`;
  if (uso) text += `\nUso: *${uso}*.`;
  if (telefono) text += `\nTeléfono: *${telefono}*.`;

  return text;
};

const buildWhatsAppProductLink = (context: ChatContextMinimal): string =>
  `https://wa.me/51978883199?text=${encodeURIComponent(buildWhatsAppProductText(context))}`;

const extractUsage = (text: string): string | undefined => {
  const normalized = normalizeText(text);
  if (includesAny(normalized, ['negocio', 'empresa', 'emprendimiento', 'local'])) return 'negocio';
  if (includesAny(normalized, ['personal', 'hogar', 'casa', 'particular'])) return 'uso personal';
  return undefined;
};

const extractCity = (text: string): string | undefined => {
  const raw = collapseWhitespace(text);
  const explicit = raw.match(/(?:ciudad|envio|envío)\s*[:\-]?\s*(.+)$/i);
  if (explicit?.[1]) return toDisplayCase(explicit[1].replace(/[.?!]+$/g, ''));

  const segments = raw
    .split(/[,;]|\by\b/i)
    .map((segment) => collapseWhitespace(segment))
    .filter(Boolean);

  const candidate = segments.find((segment) => {
    const normalized = normalizeText(segment);
    return normalized && !includesAny(normalized, ['personal', 'negocio', 'empresa', 'emprendimiento', 'local']);
  });

  const fallback = candidate || raw.replace(/\b(uso|personal|negocio|empresa|emprendimiento|local|ciudad|envio|envío|para|de|la|el|un|una|en)\b/gi, ' ');
  const city = collapseWhitespace(fallback);
  return city ? toDisplayCase(city) : undefined;
};

const extractName = (text: string): string | undefined => {
  const raw = collapseWhitespace(text);
  const explicit = raw.match(/(?:mi nombre es|me llamo|soy)\s+([A-Za-zÁÉÍÓÚÜÑáéíóúüñ][A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'’-]{1,50})/i);
  if (explicit?.[1]) return toDisplayCase(explicit[1]);

  const withoutPhone = raw.replace(/\+?\d[\d\s()-]{6,}\d/g, ' ').trim();
  const candidate = withoutPhone.split(/[,.;]/)[0]?.trim();
  if (!candidate) return undefined;

  const normalized = normalizeText(candidate);
  if (includesAny(normalized, ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'buenas noches'])) return undefined;

  return toDisplayCase(candidate);
};

const extractPhone = (text: string): string | undefined => {
  const explicit = text.match(/(?:telefono|tel|celular|cel)\s*[:\-]?\s*(\+?\d[\d\s()-]{6,}\d)/i);
  if (explicit?.[1]) return collapseWhitespace(explicit[1]);

  const generic = text.match(/\+?\d[\d\s()-]{6,}\d/);
  return generic?.[0] ? collapseWhitespace(generic[0]) : undefined;
};

const buildProductContactReply = (match: CatalogMatch, intro?: string): LocalReplyResult => ({
  message: {
    role: 'bot',
    tipo: 'texto',
    respuesta: `${intro ? `${intro}\n\n` : `¡Sí! Tenemos ${productLabel(match.product)}.\n\n`}Antes de enviarte al WhatsApp, cuéntame: ¿es para uso personal o negocio?`,
    link_producto: match.link,
  },
  nextPaso: PRODUCT_CONTACT_STEP_1,
  contextPatch: {
    producto: productLabel(match.product),
  },
});

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

const getCategoryProducts = async (category: keyof typeof CATEGORY_KEYWORDS, limit = CATEGORY_PRODUCT_LIMIT): Promise<ApiProduct[]> => {
  const catalog = await getCatalog();
  const keywords = CATEGORY_KEYWORDS[category];

  const matches = catalog.filter((product) => {
    const haystack = normalizeText(`${product.nombre || ''} ${product.titulo || ''} ${product.link || ''} ${product.seccion || ''}`);
    const section = normalizeText(product.seccion || '');
    return includesAny(haystack, keywords) || includesAny(section, keywords);
  });

  return matches.slice(0, limit);
};

const formatProductNames = (products: ApiProduct[]): string =>
  products
    .map((product) => product.nombre?.trim() || product.titulo?.trim() || product.link?.trim() || 'Producto')
    .filter(Boolean)
    .join(', ');

const buildCategoryReply = async (category: keyof typeof CATEGORY_KEYWORDS): Promise<LocalReplyResult> => {
  const products = await getCategoryProducts(category);
  const productNames = formatProductNames(products);

  if (category === 'decoracion') {
    return {
      message: {
        role: 'bot',
        tipo: 'texto',
        respuesta: productNames
          ? `¡Me encanta! Tenemos ${productNames}. ¿Cuál te gustaría conocer? 😍`
          : CATEGORY_REPLIES.decoracion,
      },
      nextPaso: 'esperando_producto',
    };
  }

  if (category === 'negocio') {
    return {
      message: {
        role: 'bot',
        tipo: 'texto',
        respuesta: productNames
          ? `Perfecto 💪 Tenemos ${productNames} y más. Cuéntame qué necesitas producir y te ayudo a elegir.`
          : CATEGORY_REPLIES.negocio,
      },
      nextPaso: 'esperando_producto',
    };
  }

  return {
    message: {
      role: 'bot',
      tipo: 'texto',
      respuesta: productNames
        ? `¡Genial! Vendemos ${productNames} y más. ¿En qué productos estás interesado?`
        : CATEGORY_REPLIES.maquinaria,
    },
    nextPaso: 'esperando_producto',
  };
};

const isBroadCategoryIntent = (normalized: string): boolean =>
  includesAny(normalized, BROAD_CATEGORY_PHRASES);

const looksLikeOrderTracking = (normalized: string): boolean =>
  includesAny(normalized, ORDER_TRACKING_PHRASES);

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
): Promise<LocalReplyResult | null> => {
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
    return buildProductContactReply(match, scriptedIntent?.intro);
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
    return buildProductContactReply(fallbackMatches.exact, scriptedIntent?.intro);
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
    return buildProductContactReply(match, scriptedIntent?.intro);
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

const buildUnmatchedProductReply = (query: string): LocalReplyResult => ({
  message: {
    role: 'bot',
    tipo: 'texto',
    respuesta: `No encontré "${query}" exacto todavía 😅. Si me dices el nombre completo o para qué lo necesitas, te ayudo a ubicar la mejor opción. También puedo pasarte a WhatsApp si prefieres.`,
    link_whatsapp: DEFAULT_WHATSAPP,
  },
  nextPaso: 'esperando_producto',
});

export const getLocalReply = async (
  text: string,
  context: ChatContextMinimal | null,
  messages: MessageMinimal[]
): Promise<LocalReplyResult | null> => {
  const normalized = normalizeText(text);
  const currentPaso = context?.paso || '';
  const lastBotMessage = [...messages].reverse().find((msg) => msg.role === 'bot');

  if (currentPaso === PRODUCT_CONTACT_STEP_1) {
    const usage = extractUsage(text);

    if (!usage) {
      return {
        message: {
          role: 'bot',
          tipo: 'texto',
          respuesta: 'Respóndeme con el uso. Ejemplo: negocio o personal.',
        },
        nextPaso: PRODUCT_CONTACT_STEP_1,
        contextPatch: {
          uso: usage,
        },
      };
    }

    return {
      message: {
        role: 'bot',
        tipo: 'texto',
        respuesta: 'Perfecto. Ahora dime en qué ciudad sería el envío.',
      },
      nextPaso: PRODUCT_CONTACT_STEP_2,
      contextPatch: {
        uso: usage,
      },
    };
  }

  if (currentPaso === PRODUCT_CONTACT_STEP_2) {
    const city = extractCity(text);

    if (!city) {
      return {
        message: {
          role: 'bot',
          tipo: 'texto',
          respuesta: 'Dime la ciudad del envío. Ejemplo: Lima.',
        },
        nextPaso: PRODUCT_CONTACT_STEP_2,
        contextPatch: {
          ciudad: undefined,
        },
      };
    }

    return {
      message: {
        role: 'bot',
        tipo: 'texto',
        respuesta: 'Perfecto. Ahora dime tu nombre.',
      },
      nextPaso: PRODUCT_CONTACT_STEP_3,
      contextPatch: {
        ciudad: city,
      },
    };
  }

  if (currentPaso === PRODUCT_CONTACT_STEP_3) {
    const nombre = extractName(text);

    if (!nombre) {
      return {
        message: {
          role: 'bot',
          tipo: 'texto',
          respuesta: 'Ahora dime tu nombre. Ejemplo: Adriano.',
        },
        nextPaso: PRODUCT_CONTACT_STEP_3,
        contextPatch: {
          nombre,
        },
      };
    }

    return {
      message: {
        role: 'bot',
        tipo: 'texto',
        respuesta: 'Perfecto. Ahora dime tu número de teléfono.',
      },
      nextPaso: PRODUCT_CONTACT_STEP_4,
      contextPatch: {
        nombre,
      },
    };
  }

  if (currentPaso === PRODUCT_CONTACT_STEP_4) {
    const telefono = extractPhone(text);

    if (!telefono) {
      return {
        message: {
          role: 'bot',
          tipo: 'texto',
          respuesta: 'Ahora envíame tu número de teléfono. Ejemplo: 940745374.',
        },
        nextPaso: PRODUCT_CONTACT_STEP_4,
        contextPatch: {
          telefono,
        },
      };
    }

    const whatsappLink = buildWhatsAppProductLink({
      ...context,
      telefono,
    });

    return {
      message: {
        role: 'bot',
        tipo: 'texto',
        respuesta: 'Listo, ya tengo tus datos. Te dejo WhatsApp para seguir con tu atención.',
        link_whatsapp: whatsappLink,
      },
      nextPaso: 'menu_principal',
      contextPatch: {
        telefono,
      },
    };
  }

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

  if (looksLikeOrderTracking(normalized)) {
    return {
      message: {
        role: 'bot',
        tipo: 'texto',
        respuesta: '¡Claro! Escríbeme tu número de pedido, nombre o el WhatsApp con el que hiciste la compra para buscarlo. 🔍',
      },
      nextPaso: 'esperando_datos_pedido',
    };
  }

  if (currentPaso === 'menu_principal' && includesAny(normalized, ['info', 'informacion', 'cotizacion', 'cotizar'])) {
    return {
      message: {
        role: 'bot',
        tipo: 'texto',
        respuesta: INFO_OR_COTIZACION_REPLY,
      },
      nextPaso: 'menu_principal',
    };
  }

  if (currentPaso === 'esperando_datos_pedido') {
    const referenciaPedido = collapseWhitespace(text);
    return {
      message: {
        role: 'bot',
        tipo: 'texto',
        respuesta: 'Entendido, dame un segundo para verificar... 🔄',
      },
      nextPaso: 'menu_principal',
      contextPatch: {
        pedido: referenciaPedido,
        referencia_pedido: referenciaPedido,
      },
    };
  }

  const category = getCategoryFromQuery(normalized);
  if (category && (currentPaso === 'menu_principal' || currentPaso === 'esperando_producto')) {
    return buildCategoryReply(category);
  }

  if (currentPaso === 'menu_principal' && looksLikeProductSearch(normalized, lastBotMessage) && !isBroadCategoryIntent(normalized)) {
    const productReply = await resolveProductQuery(text);
    return productReply || buildUnmatchedProductReply(text.trim());
  }

  if (currentPaso === 'esperando_producto') {
    const productReply = await resolveProductQuery(text);
    if (productReply) return productReply;

    if (looksLikeProductSearch(normalized, lastBotMessage)) {
      return buildUnmatchedProductReply(text.trim());
    }

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
