export interface Opcion {
  label: string;
  valor: string;
}

export interface ChatContext {
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

export interface ProductoInfo {
  nombre: string;
  descripcion: string;
  imagen: string;
  link_whatsapp: string;
}

export interface Message {
  role: 'bot' | 'user';
  tipo: 'texto' | 'producto' | 'opciones' | 'fin_flujo';
  respuesta: string;
  opciones?: Opcion[];
  productos?: ProductoInfo[];
  producto?: ProductoInfo;
  link_whatsapp?: string;
}
