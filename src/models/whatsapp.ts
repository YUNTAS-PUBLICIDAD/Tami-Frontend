export interface WhatsappPlantillaServiceResponse<T> {
    success: boolean;
    message: string;
    data?: T;
}
