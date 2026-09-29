import { config, getApiUrl } from "../../../../../config";

export type Seccion = "contacto" | "redes" | "horario";

function authHeaders(): HeadersInit {
    const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
    return {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

async function request<T>(endpoint: string, init?: RequestInit): Promise<T> {
    const res = await fetch(getApiUrl(endpoint), { headers: authHeaders(), ...init });
    const json = await res.json().catch(() => null);

    if (!res.ok) {
        throw new Error(json?.message ?? `Error ${res.status}`);
    }

    return (json?.data ?? json) as T;
}

const endpointOf = (seccion: Seccion) => config.endpoints.configuracion[seccion];

export const getConfiguracion = <T>(seccion: Seccion) => request<T>(endpointOf(seccion));

export const saveConfiguracion = <T = unknown, TPayLoad = unknown>(seccion: Seccion, body: TPayLoad) =>
    request<T>(endpointOf(seccion), { method: "PUT", body: JSON.stringify(body) });