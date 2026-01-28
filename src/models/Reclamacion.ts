 
export default interface Reclamacion {
  id: number;

  first_name: string;
  last_name: string;
  email: string;
  phone: string;

  document_number: string;
  document_type_id: number;
  claim_type_id: number;

  detail: string;
  claimed_amount: number;
  purchase_date: string;

  created_at: string;
  updated_at: string;

  document_type?: {
    id: number;
    code: string;  // Cambiado de name a code
    label: string; // Agregado por si quieres usar el nombre largo
  };

  claim_type?: {
    id: number;
    name: string;
  };
  claim_status?: {
    id: number;
    name: string;
  };

  product?: {
    id: number;
    name: string;
  };
}


