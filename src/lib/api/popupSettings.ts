import apiClient from "../../services/apiClient";

const POPUP_SETTINGS_ENDPOINT = "/api/v1/admin/popup-settings";
const PUBLIC_POPUP_SETTINGS_ENDPOINT = "/api/v1/popup-settings/public";

export interface PopupSettings {
  button_bg_color: string;
  button_text_color: string;
  popup_image: string;
  popup_mobile_image2_url?: string;
  popup_start_delay_minutes: number;
  product_popup_delay_minutes: number;
  email_btn_text?: string;
  email_btn_link?: string;
  email_btn_bg_color?: string;
  email_btn_text_color?: string;
}

export interface PopupSettingsResponse {
  data: PopupSettings;
}

export type UpdatePopupSettingsPayload = Pick<
  PopupSettings,
  "button_bg_color" | "button_text_color" | "popup_start_delay_minutes" | "product_popup_delay_minutes"
>;

export const isHexColor = (value: string): boolean =>
  /^#[0-9A-Fa-f]{6}$/.test(value);

export async function getPopupSettings(): Promise<PopupSettings> {
  const response = await apiClient.get<PopupSettingsResponse>(
    `${POPUP_SETTINGS_ENDPOINT}?t=${Date.now()}`,
  );
  return response.data.data;
}

export async function getPublicPopupSettings(): Promise<PopupSettings> {
  const response = await apiClient.get<PopupSettingsResponse>(
    `${PUBLIC_POPUP_SETTINGS_ENDPOINT}?t=${Date.now()}`,
  );
  return response.data.data;
}

export async function updatePopupSettings(
  payload: UpdatePopupSettingsPayload,
): Promise<PopupSettings> {
  const response = await apiClient.patch<PopupSettingsResponse>(
    POPUP_SETTINGS_ENDPOINT,
    {
      button_bg_color: payload.button_bg_color,
      button_text_color: payload.button_text_color,
      popup_start_delay_minutes: payload.popup_start_delay_minutes,
      product_popup_delay_minutes: payload.product_popup_delay_minutes,
    },
  );

  return response.data.data;
}

export async function updatePopupSettingsFormData(
  formData: FormData,
): Promise<PopupSettings> {
  const response = await apiClient.post<PopupSettingsResponse>(
    POPUP_SETTINGS_ENDPOINT,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data.data;
}
