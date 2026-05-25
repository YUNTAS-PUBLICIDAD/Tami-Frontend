import Swal from "sweetalert2";

export function getSettingValue(settings: any, keys: string[], fallback: any = "") {
    for (const key of keys) {
        if (settings?.[key] !== undefined && settings?.[key] !== null && settings?.[key] !== "") {
            return settings[key];
        }
    }
    return fallback;
}

export function formatWhatsAppTextToHTML(text: string | null) {
    if (!text) return "";
    const normalized = text.replace(/\n([ \t]*\n)+/g, "\n\n");

    const formatInline = (value: string) => {
        return value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\*(.*?)\*/g, "<strong>$1</strong>")
            .replace(/_(.*?)_/g, "<em>$1</em>")
            .replace(/~(.*?)~/g, "<del>$1</del>");
    };

    let html = "";
    let activeList: "ul" | "ol" | null = null;

    const closeList = () => {
        if (!activeList) return;
        html += `</${activeList}>`;
        activeList = null;
    };

    const appendBreakIfNeeded = () => {
        if (!html) return;
        if (!html.endsWith("<br>") && !html.endsWith("</ul>") && !html.endsWith("</ol>")) {
            html += "<br>";
        }
    };

    normalized.split("\n").forEach((line) => {
        const trimmed = line.trim();

        if (!trimmed) {
            closeList();
            appendBreakIfNeeded();
            html += "<br>";
            return;
        }

        const bulletMatch = trimmed.match(/^(?:•|-|\*)\s+(.*)$/);
        const orderedMatch = trimmed.match(/^\d+[.)]\s+(.*)$/);

        if (bulletMatch) {
            if (activeList !== "ul") {
                closeList();
                appendBreakIfNeeded();
                html += "<ul>";
                activeList = "ul";
            }
            html += `<li>${formatInline(bulletMatch[1])}</li>`;
            return;
        }

        if (orderedMatch) {
            if (activeList !== "ol") {
                closeList();
                appendBreakIfNeeded();
                html += "<ol>";
                activeList = "ol";
            }
            html += `<li>${formatInline(orderedMatch[1])}</li>`;
            return;
        }

        closeList();
        appendBreakIfNeeded();
        html += formatInline(trimmed);
    });

    closeList();
    return html;
}

export function handleImageUpload(
    input: HTMLInputElement | any,
    callback: (url: string | ArrayBuffer | null | undefined) => void,
) {
    if (input && input.files && input.files[0]) {
        const file = input.files[0];

         // Validar formato webp
        if (file.type !== "image/webp") {
            Swal.fire({
                icon: "error",
                title: "Formato inválido",
                text: "Solo se aceptan imágenes en formato WEBP.",
            });

            input.value = "";
            return;
        }

        // Validar tamaño máximo 2MB
        const maxSize = 2 * 1024 * 1024; // 2MB en bytes

        if (file.size > maxSize) {
            Swal.fire({
                icon: "error",
                title: "Archivo demasiado grande",
                text: `El archivo no puede exceder 2MB. Tamaño actual: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
            });

            input.value = "";
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => callback(e.target?.result);
        reader.readAsDataURL(file);
    }
}

export const normalizeWhatsappKey = (value: string): "1" | "2" | "3" => {
    if (value === "2" || value === "3") return value as "2" | "3";
    return "1";
};
