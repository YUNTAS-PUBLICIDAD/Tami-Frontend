import { emailsState, sharedState } from "./popupsState";

export function initEmail() {
    const emailTitleInput = document.getElementById("emailTitle") as HTMLInputElement | null;
    const emailBody = document.getElementById("emailBody") as HTMLTextAreaElement | null;
    const emailImage = document.getElementById("emailImage") as HTMLInputElement | null;
    const clearEmailImage = document.getElementById("clearEmailImage");
    const deleteEmailInput = document.getElementById("delete_emailImage") as HTMLInputElement | null;

    const emailBtnTextInput = document.getElementById("emailBtnText") as HTMLInputElement | null;
    const emailBtnBgColorInput = document.getElementById("emailBtnBgColor") as HTMLInputElement | null;
    const emailBtnTextColorInput = document.getElementById("emailBtnTextColor") as HTMLInputElement | null;
    const emailBtnLinkInput = document.getElementById("emailBtnLink") as HTMLInputElement | null;
    const previewEmailBtn = document.getElementById("previewEmailBtn") as HTMLAnchorElement | HTMLButtonElement | null;

    const emailSelector = document.getElementById("emailSelector") as HTMLSelectElement | null;

    function syncUIFromEmailState(idx: string) {
        const state = emailsState[idx];
        if (emailTitleInput) emailTitleInput.value = state.title;
        if (emailBtnTextInput) emailBtnTextInput.value = state.btnText;
        if (emailBtnLinkInput) emailBtnLinkInput.value = state.btnLink;
        if (emailBtnBgColorInput) emailBtnBgColorInput.value = state.btnBgColor;
        if (emailBtnTextColorInput) emailBtnTextColorInput.value = state.btnTextColor;

        const emailSendDelayInput = document.getElementById("emailSendDelay") as HTMLSelectElement | null;
        if (emailSendDelayInput) emailSendDelayInput.value = state.delay;

        const emailTitleDisplay = document.getElementById("emailTitleDisplay");
        if (emailTitleDisplay) emailTitleDisplay.textContent = `Correo Electrónico #${idx}`;

        window.dispatchEvent(new CustomEvent("update-email-editor", { detail: state.body }));

        const previewImg = document.getElementById("previewEmailImageThumb");
        const container = document.getElementById("previewEmailAttachementContainer");
        const imgUrl = state.file ? URL.createObjectURL(state.file) : state.imageUrl;

        if (imgUrl) {
            if (previewImg && container) {
                previewImg.innerHTML = `<img src="${imgUrl}" class="max-w-full h-auto object-contain rounded-lg shadow-sm" style="max-height: 400px;">`;
                container.classList.remove("hidden");
            }
            if (clearEmailImage) clearEmailImage.classList.remove("hidden");
        } else {
            if (previewImg && container) {
                previewImg.innerHTML = "";
                container.classList.add("hidden");
            }
            if (clearEmailImage) clearEmailImage.classList.add("hidden");
        }

        // Sync preview with the selected email state.
        window.dispatchEvent(new CustomEvent("update-email-preview", {
            detail: {
                title: state.title,
                body: state.body,
                image: imgUrl,
                btnText: state.btnText,
                btnLink: state.btnLink,
                btnBgColor: state.btnBgColor,
                btnTextColor: state.btnTextColor,
            },
        }));
    }

    function saveCurrentEmailToState() {
        const state = emailsState[sharedState.currentEmailIdx];

        const titleInput = document.getElementById("emailTitle") as HTMLInputElement | null;
        if (titleInput) state.title = titleInput.value || "";

        const bodyInput = document.getElementById("emailBody") as HTMLInputElement | null;
        if (bodyInput) state.body = bodyInput.value || "";

        const btnTextInput = document.getElementById("emailBtnText") as HTMLInputElement | null;
        if (btnTextInput) state.btnText = btnTextInput.value || "";

        const btnLinkInput = document.getElementById("emailBtnLink") as HTMLInputElement | null;
        if (btnLinkInput) state.btnLink = btnLinkInput.value || "";

        const btnBgColorInput = document.getElementById("emailBtnBgColor") as HTMLInputElement | null;
        if (btnBgColorInput) state.btnBgColor = btnBgColorInput.value || "";

        const btnTextColorInput = document.getElementById("emailBtnTextColor") as HTMLInputElement | null;
        if (btnTextColorInput) state.btnTextColor = btnTextColorInput.value || "";

        const delayInput = document.getElementById("emailSendDelay") as HTMLSelectElement | null;
        if (delayInput) state.delay = delayInput.value || "5";

        const delImgInput = document.getElementById("delete_emailImage") as HTMLInputElement | null;
        if (delImgInput) state.deleteImage = delImgInput.value || "0";
    }

    emailSelector?.addEventListener("change", () => {
        saveCurrentEmailToState();
        sharedState.currentEmailIdx = emailSelector.value;
        syncUIFromEmailState(sharedState.currentEmailIdx);
    });

    emailImage?.addEventListener("change", function () {
        const input = this as HTMLInputElement;
        if (input && input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const url = e.target?.result as string;
                const file = input.files?.[0];
                if (file) {
                    emailsState[sharedState.currentEmailIdx].file = file;
                    emailsState[sharedState.currentEmailIdx].deleteImage = "0";
                }

                const previewImg = document.getElementById("previewEmailImageThumb");
                const container = document.getElementById("previewEmailAttachementContainer");
                if (previewImg && container) {
                    previewImg.innerHTML = `<img src="${url}" class="max-w-full h-auto object-contain rounded-lg shadow-sm" style="max-height: 400px;">`;
                    container.classList.remove("hidden");
                }
                const clearEmailImageEl = document.getElementById("clearEmailImage");
                clearEmailImageEl?.classList.remove("hidden");
            };
            reader.readAsDataURL(input.files[0]);
        }
    });

    const clearEmailImageEl = document.getElementById("clearEmailImage");
    clearEmailImageEl?.addEventListener("click", () => {
        const emailImageEl = document.getElementById("emailImage") as HTMLInputElement | null;
        if (emailImageEl) emailImageEl.value = "";
        emailsState[sharedState.currentEmailIdx].file = null;
        emailsState[sharedState.currentEmailIdx].imageUrl = null;
        emailsState[sharedState.currentEmailIdx].deleteImage = "1";

        const previewImg = document.getElementById("previewEmailImageThumb");
        const container = document.getElementById("previewEmailAttachementContainer");
        if (previewImg && container) {
            previewImg.innerHTML = "";
            container.classList.add("hidden");
        }
        clearEmailImageEl.classList.add("hidden");
        const del = document.getElementById("delete_emailImage") as HTMLInputElement | null;
        if (del) del.value = "1";
    });

    window.addEventListener("update-email-preview", (e: any) => {
        // If the event includes a `source` and it's from product, ignore it here
        // because product previews should not override Inicio previews.
        if (e?.detail && typeof e.detail === 'object' && e.detail.source === 'product') return;

        const data = typeof e.detail === "string" ? { body: e.detail } : e.detail;
            const previewCorreoBody = document.getElementById("previewCorreoBody");
            // Only update the preview body if the event explicitly provides a `body` field.
            // This prevents partial updates (e.g. only `title`) from clearing the current body.
            if (previewCorreoBody && Object.prototype.hasOwnProperty.call(data, "body")) {
                previewCorreoBody.innerHTML = data.body || "";
            }

        if (data.title !== undefined) {
            const previewCorreoTitle = document.getElementById("previewCorreoTitle");
            if (previewCorreoTitle) previewCorreoTitle.textContent = data.title;
        }

        const previewImg = document.getElementById("previewEmailImageThumb");
        const container = document.getElementById("previewEmailAttachementContainer");

        if (data.image) {
            if (previewImg && container) {
                previewImg.innerHTML = `<img src="${data.image}" class="max-w-full h-auto object-contain rounded-lg shadow-sm" style="max-height: 400px;">`;
                container.classList.remove("hidden");
            }
        } else if (data.image === null) {
            if (previewImg && container) {
                previewImg.innerHTML = "";
                container.classList.add("hidden");
            }
        }

        const previewEmailBtnEl = document.getElementById("previewEmailBtn") as HTMLAnchorElement | HTMLButtonElement | null;
        if (previewEmailBtnEl) {
            if (data.btnText !== undefined) previewEmailBtnEl.textContent = data.btnText || "Ver Productos";
            if (data.btnLink !== undefined && 'href' in previewEmailBtnEl) previewEmailBtnEl.href = data.btnLink || "#";
            if (data.btnBgColor !== undefined) previewEmailBtnEl.style.backgroundColor = data.btnBgColor || "#0b1c3c";
            if (data.btnTextColor !== undefined) previewEmailBtnEl.style.color = data.btnTextColor || "#ffffff";
        }
    });

    // expose minimal functions
    (window as any).popupsEmail = { syncUIFromEmailState, saveCurrentEmailToState };
}

export default initEmail;
