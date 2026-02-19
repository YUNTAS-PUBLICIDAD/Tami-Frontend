export default interface Cliente {
    id: number;
    name: string;
    email: string;
    celular: string;
    producto?: string;
    source?: string;
    source_id?: string;
    created_at?: string;
  }