export interface WhatsappPlantilla {
    id: number;
    producto_id?: number | null;
    mensaje: string;
    imagen_principal: string | null;
    is_default: boolean;
}

export interface WhatsappPlantillaInput {
    producto_id?: number | null;
    mensaje: string;
    imagen_principal?: File | null;
    is_default?: boolean;
}

export interface WhatsappPlantillaServiceResponse<T> {
    success: boolean;
    message: string;
    data?: T;
}

export interface sendWhatsappCampanaResponse {
    success: boolean;
    message: string;
    total_leads: number;
    exitosos: number;
    fallidos: number;
}

export interface LeadInput {
    id: number;
    nombre: string;
    telefono: string;
    // Add other relevant fields if needed
}
