import { formatWhatsAppTextToHTML } from "./popupsHelpers";
import { whatsappData, sharedState } from "./popupsState";

function normalizeWhatsappKey(value: string | undefined): "1" | "2" | "3" {
    return value === "2" || value === "3" ? value : "1";
}

export function initWhatsapp() {
    const whatsappMessageSelector = document.getElementById("whatsappMessageSelector") as HTMLSelectElement | null;
    const whatsappBlocks: Record<string, HTMLElement | null> = {
        "1": document.getElementById("waBlock1"),
        "2": document.getElementById("waBlock2"),
        "3": document.getElementById("waBlock3"),
    };

    const textareaWhatsapp = document.getElementById("whatsappMessage") as HTMLTextAreaElement | null;
    const previewWhatsappText = document.getElementById("previewWhatsappText");

    const syncWhatsAppPreview = (messageKey: string = sharedState.currentSelectedWaMessage) => {
        const key = normalizeWhatsappKey(messageKey);
        const data = whatsappData[key];
        if (previewWhatsappText) {
            previewWhatsappText.innerHTML = formatWhatsAppTextToHTML(data.text || "");
        }

        const previewWAImg = document.getElementById("previewWhatsappImageContainer");
        if (data.image) {
            if (previewWAImg) {
                previewWAImg.innerHTML = `<img src="${data.image}" class="w-full h-auto object-contain">`;
                previewWAImg.classList.remove("hidden");
            }
        } else if (previewWAImg) {
            previewWAImg.innerHTML = "";
            previewWAImg.classList.add("hidden");
        }
    };

    const setActiveWhatsappMessage = (messageKey: string) => {
        const key = normalizeWhatsappKey(messageKey);
        sharedState.currentSelectedWaMessage = key;
        if (whatsappMessageSelector && whatsappMessageSelector.value !== key) {
            whatsappMessageSelector.value = key;
        }

        Object.entries(whatsappBlocks).forEach(([entryKey, block]) => {
            block?.classList.toggle("hidden", entryKey !== key);
        });

        syncWhatsAppPreview(key);
    };

    textareaWhatsapp?.addEventListener("input", () => {
        whatsappData["1"].text = textareaWhatsapp.value;
        if (sharedState.currentSelectedWaMessage === "1") syncWhatsAppPreview("1");
    });

    whatsappMessageSelector?.addEventListener("change", () => {
        const val = whatsappMessageSelector?.value || "1";
        const normalized = (val === "2" || val === "3") ? val : "1";
        setActiveWhatsappMessage(normalized);
    });

    window.addEventListener("sync-whatsapp-selector", (e: any) => {
        const normalized = (String(e.detail) === "2" || String(e.detail) === "3") ? String(e.detail) : "1";
        setActiveWhatsappMessage(normalized);
    });

    window.addEventListener("update-whatsapp-preview", (e: any) => {
        const detail = typeof e.detail === "string" ? { text: e.detail } : (e.detail || {});
        whatsappData["1"] = {
            text: detail.text ?? whatsappData["1"].text,
            image: detail.image !== undefined ? detail.image : whatsappData["1"].image,
        };
        if (sharedState.currentSelectedWaMessage === "1") syncWhatsAppPreview("1");
    });

    window.addEventListener("update-whatsapp-preview-2", (e: any) => {
        const detail = typeof e.detail === "string" ? { text: e.detail } : (e.detail || {});
        whatsappData["2"] = {
            text: detail.text ?? whatsappData["2"].text,
            image: detail.image !== undefined ? detail.image : whatsappData["2"].image,
        };
        if (sharedState.currentSelectedWaMessage === "2") syncWhatsAppPreview("2");
    });

    window.addEventListener("update-whatsapp-preview-3", (e: any) => {
        const detail = typeof e.detail === "string" ? { text: e.detail } : (e.detail || {});
        whatsappData["3"] = {
            text: detail.text ?? whatsappData["3"].text,
            image: detail.image !== undefined ? detail.image : whatsappData["3"].image,
        };
        if (sharedState.currentSelectedWaMessage === "3") syncWhatsAppPreview("3");
    });

    // expose some helpers on window for other parts (optional)
    (window as any).popupsWhatsapp = { setActiveWhatsappMessage, syncWhatsAppPreview };
}

export default initWhatsapp;
