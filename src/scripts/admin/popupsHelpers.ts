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
    let html = text;

    // If text already contains HTML, don't escape tags
    const hasHTML = /<[a-z][\s\S]*>/i.test(html);

    if (!hasHTML) {
        html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    // format whatsapp markdown
    html = html.replace(/\*(.*?)\*/g, "<strong>$1</strong>");
    html = html.replace(/_(.*?)_/g, "<em>$1</em>");
    html = html.replace(/~(.*?)~/g, "<del>$1</del>");
    html = html.replace(/\n/g, "<br>");
    return html;
}

export function handleImageUpload(
    input: HTMLInputElement | any,
    callback: (url: string | ArrayBuffer | null | undefined) => void,
) {
    if (input && input.files && input.files[0]) {
        const file = input.files[0];

        // Validar formato webp
        if (!file.type.includes('webp')) {
            alert('❌ Solo se aceptan imágenes en formato WEBP.');
            input.value = '';
            return;
        }

        // Validar tamaño máximo 2MB
        const maxSize = 2 * 1024 * 1024; // 2MB en bytes
        if (file.size > maxSize) {
            alert(`❌ El archivo no puede exceder 2MB. Tamaño actual: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
            input.value = '';
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
