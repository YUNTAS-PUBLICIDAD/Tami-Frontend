export default interface Cliente {
    id: number;
    name: string;
    email: string;
    celular: string;
    producto?: string;
    source?: string;
    updated_at?: string;
  }