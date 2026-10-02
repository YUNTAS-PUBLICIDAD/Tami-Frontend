import { config, getApiUrl } from "../../../config";
import type { ContactData, HorarioData, ContactInfo } from "../../types/contacto.interface";

export async function fetchJson<T>(endpoint: string): Promise<T | null> {
  try {
    const res = await fetch(getApiUrl(endpoint));
    if (!res.ok) {
      console.error("FETCH FALLÓ:", endpoint, res.status);
      return null;
    }
    const json = await res.json();
    return (json?.data ?? json) as T;
  } catch (e) {
    console.error("FETCH ERROR:", endpoint, e);
    return null;
  }
}

function formatHora(h?: string | null): string {
  if (!h) return "";
  const [hh, mm] = h.split(":").map(Number);
  if (Number.isNaN(hh)) return h;
  return `${hh % 12 || 12}:${String(mm || 0).padStart(2, "0")} ${hh >= 12 ? "pm" : "am"}`;
}

function toWhatsapp(tel: string): string {
  const digits = tel.replace(/\D/g, "");
  return digits.length === 9 ? `51${digits}` : digits;
}

export async function getContactData(): Promise<ContactData | null> {
  const [info, horario] = await Promise.all([
    fetchJson<ContactInfo>(config.endpoints.configuracion.contacto),
    fetchJson<HorarioData>(config.endpoints.configuracion.horario),
  ]);

  if (!info) return null;

  return {
    email: info.correo,
    phones: [info.telefono, info.telefono_opcional].filter(Boolean) as string[],
    whatsapp: toWhatsapp(info.telefono),
    address: info.direccion,
    mapUrl: `https://www.google.com/maps?q=${encodeURIComponent(info.direccion)}&output=embed`,
    hours: (horario?.dias ?? []).map((d:any) => {
      const inicio = formatHora(d.hora_inicio);
      const fin = formatHora(d.hora_fin);
      return {
        label: d.dia,
        text: d.abierto && inicio && fin ? `${inicio} a ${fin}` : "Cerrado",
      };
    }),
  };
}