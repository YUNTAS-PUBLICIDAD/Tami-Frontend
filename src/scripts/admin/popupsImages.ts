import { handleImageUpload } from "./popupsHelpers";
import { currentInicioImages, whatsappData, sharedState } from "./popupsState";

export function initImages(updatePreview: (settings?: any, mode?: string | null) => void) {
    const bindImageEvents = (
        inputId: string,
        clearId: string,
        previewKey: string,
        imageName: string,
        deleteId: string,
    ) => {
        const input = document.getElementById(inputId) as HTMLInputElement | null;
        const clearBtn = document.getElementById(clearId) as HTMLButtonElement | null;
        const deleteInput = document.getElementById(deleteId) as HTMLInputElement | null;

        input?.addEventListener("change", function () {
            handleImageUpload(this as HTMLInputElement, (url) => {
                currentInicioImages[previewKey] = url as string;

                if (previewKey === "whatsappImage") whatsappData["1"].image = url as string;
                if (previewKey === "whatsappImage2") whatsappData["2"].image = url as string;
                if (previewKey === "whatsappImage3") whatsappData["3"].image = url as string;

                // sync whatsapp preview via event
                window.dispatchEvent(new CustomEvent("sync-whatsapp-selector", { detail: sharedState.currentSelectedWaMessage || "1" }));

                if (previewKey.startsWith("popup_mobile")) {
                    updatePreview({ [previewKey]: url as string }, "mobile");
                } else if (previewKey.startsWith("popup_")) {
                    updatePreview({ [previewKey]: url as string }, "desktop");
                }

                clearBtn?.classList.remove("hidden");
                if (deleteInput) deleteInput.value = "0";
            });
        });

        clearBtn?.addEventListener("click", () => {
            if (input) input.value = "";
            currentInicioImages[previewKey] = null;

            if (previewKey === "whatsappImage") whatsappData["1"].image = null;
            if (previewKey === "whatsappImage2") whatsappData["2"].image = null;
            if (previewKey === "whatsappImage3") whatsappData["3"].image = null;

            window.dispatchEvent(new CustomEvent("sync-whatsapp-selector", { detail: sharedState.currentSelectedWaMessage || "1" }));

            if (previewKey.startsWith("popup_mobile")) {
                updatePreview({ [previewKey]: null }, "mobile");
            } else if (previewKey.startsWith("popup_")) {
                updatePreview({ [previewKey]: null }, "desktop");
            }

            clearBtn?.classList.add("hidden");
            if (deleteInput) deleteInput.value = "1";
        });
    };

    bindImageEvents("popupImage1", "clearImage1", "popup_image_url", "popupImage", "delete_popupImage1");
    bindImageEvents("popupImage2", "clearImage2", "popup_image2_url", "popupImage2", "delete_popupImage2");
    bindImageEvents("popupImageMobile", "clearImageMobile", "popup_mobile_image_url", "popupImageMobile", "delete_popupImageMobile");
    bindImageEvents("popupImageMobile2", "clearImageMobile2", "popup_mobile_image2_url", "popupImageMobile2", "delete_popupImageMobile2");
    bindImageEvents("whatsappImage", "clearWhatsappImage", "whatsappImage", "whatsappImage", "delete_whatsappImage");
    bindImageEvents("whatsappImage2", "clearWhatsappImage2", "whatsappImage2", "whatsappImage2", "delete_whatsappImage2");
    bindImageEvents("whatsappImage3", "clearWhatsappImage3", "whatsappImage3", "whatsappImage3", "delete_whatsappImage3");
}

export function addFileToForm(formData: FormData, id: string, name: string) {
    const input = document.getElementById(id) as HTMLInputElement | null;
    if (input && input.files && input.files.length > 0) {
        formData.append(name, input.files[0]);
    } else {
        const deleteInput = document.getElementById("delete_" + id) as HTMLInputElement | null;
        if (deleteInput && deleteInput.value === "1") {
            formData.append("delete_" + name, "1");
        }
    }
}

export default initImages;
