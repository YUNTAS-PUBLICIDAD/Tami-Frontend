export interface WhatsappMessageStats {
  total_messages: number;
  ult_envio: string | null;
}

export interface WhatsappStats {
  popup: WhatsappMessageStats;
}

export interface ClienteStats {
  whatsapp: WhatsappStats;
}

export interface GlobalTotals {
  whatsapp: WhatsappStats;
}

export default interface Cliente {
  id: number;
  name: string;
  email: string;
  celular: string;
  producto?: string;
  source?: string;
  source_id?: string;
  stats?: ClienteStats;
  created_at?: string;
}