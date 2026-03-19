import apiClient from "../../services/apiClient";

const POPUP_SETTINGS_ENDPOINT = "/api/v1/admin/popup-settings";

export interface PopupSettings {
  button_bg_color: string;
  button_text_color: string;
  popup_image: string;
}

export interface PopupSettingsResponse {
  data: PopupSettings;
}

export type UpdatePopupSettingsPayload = Pick<
  PopupSettings,
  "button_bg_color" | "button_text_color"
>;

export const isHexColor = (value: string): boolean =>
  /^#[0-9A-Fa-f]{6}$/.test(value);

export async function getPopupSettings(): Promise<PopupSettings> {
  const response = await apiClient.get<PopupSettingsResponse>(POPUP_SETTINGS_ENDPOINT);
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
    },
  );

  return response.data.data;
}
