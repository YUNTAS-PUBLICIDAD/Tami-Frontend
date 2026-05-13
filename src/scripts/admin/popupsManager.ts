import Swal from "sweetalert2";
import {
    getPopupSettings,
    updatePopupSettingsFormData,
    isHexColor,
} from "../../lib/api/popupSettings";

export function initPopupManager() {
    const navInicio = document.getElementById("navInicio");
    const navProducto = document.getElementById("navProducto");
    const sectionInicio = document.getElementById("sectionInicio");
    const sectionProducto = document.getElementById("sectionProducto");

    const tabPopups = document.getElementById("tabPopups");
    const tabWhatsapp = document.getElementById("tabWhatsapp");
    const tabCorreo = document.getElementById("tabCorreo");

    const contentPopups = document.getElementById("contentPopups");
    const contentWhatsapp = document.getElementById("contentWhatsapp");
    const contentCorreo = document.getElementById("contentCorreo");

    const btnDesktop = document.getElementById("btnDesktop");
    const btnMobile = document.getElementById("btnMobile");

    const previewScrollModalContainer = document.getElementById(
        "previewScrollModalContainer",
    );
    const previewWhatsapp = document.getElementById("previewWhatsapp");
    const previewCorreo = document.getElementById("previewCorreo");
    const previewOverlay = document.getElementById("previewOverlay");
    const previewModesToggle =
        document.getElementById("previewModesToggle");
    const previewStage = document.getElementById("previewStage");
    const previewWhatsappText = document.getElementById("previewWhatsappText");
    const statusElement = document.getElementById("popupStatus");

    let savedHomeSettings: any = null;
    let currentInicioImages: any = {
        popup_image_url: null,
        popup_image2_url: null,
        popup_mobile_image_url: null,
        popup_mobile_image2_url: null,
        whatsappImage: null,
        whatsappImage2: null,
        whatsappImage3: null,
        emailImage: null
    };

    // State for 3 different emails
    let currentEmailIdx = "1";
    const emailsState: any = {
        "1": { title: "", body: "", imageUrl: null, file: null, btnText: "", btnLink: "", btnBgColor: "", btnTextColor: "", delay: "5", deleteImage: "0" },
        "2": { title: "", body: "", imageUrl: null, file: null, btnText: "", btnLink: "", btnBgColor: "", btnTextColor: "", delay: "5", deleteImage: "0" },
        "3": { title: "", body: "", imageUrl: null, file: null, btnText: "", btnLink: "", btnBgColor: "", btnTextColor: "", delay: "5", deleteImage: "0" }
    };

    const isMobileScreen = window.innerWidth < 1024;
    let currentMode = isMobileScreen ? "mobile" : "desktop";

    const sharedSaveFooter = document.getElementById("sharedSaveFooter");

    const emailTitleInput = document.getElementById("emailTitle") as HTMLInputElement;
    const emailBody = document.getElementById("emailBody") as HTMLTextAreaElement;
    const emailImage = document.getElementById("emailImage") as HTMLInputElement;
    const clearEmailImage = document.getElementById("clearEmailImage");
    const deleteEmailInput = document.getElementById("delete_emailImage") as HTMLInputElement;

    const emailBtnTextInput = document.getElementById("emailBtnText") as HTMLInputElement;
    const emailBtnBgColorInput = document.getElementById("emailBtnBgColor") as HTMLInputElement;
    const emailBtnTextColorInput = document.getElementById("emailBtnTextColor") as HTMLInputElement;
    const emailBtnLinkInput = document.getElementById("emailBtnLink") as HTMLInputElement;
    const previewEmailBtn = document.getElementById("previewEmailBtn") as HTMLAnchorElement | HTMLButtonElement | null;

    if (
        !tabPopups ||
        !tabWhatsapp ||
        !tabCorreo ||
        !btnDesktop ||
        !btnMobile ||
        !navInicio ||
        !navProducto ||
        !sectionInicio ||
        !sectionProducto ||
        !sharedSaveFooter
    ) {
        setTimeout(initPopupManager, 200);
        return;
    }

    const tabs = [tabPopups, tabWhatsapp, tabCorreo];
    const contents = [contentPopups, contentWhatsapp, contentCorreo];

    function updatePreview(settings: any = {}, mode: string | null = null) {
        window.dispatchEvent(
            new CustomEvent("update-popup-preview", {
                detail: { settings, mode },
            }),
        );
    }

    const setStatus = (msg: string, type: string = "idle") => {
        if (!statusElement) return;
        statusElement.innerText = msg;
        statusElement.className = `text-sm transition-colors duration-300 ${type === "error"
            ? "text-red-500 font-medium"
            : type === "success"
                ? "text-teal-600 font-medium"
                : type === "loading"
                    ? "text-blue-500 animate-pulse"
                    : "text-gray-500 dark:text-gray-400"
            }`;
    };

    function activarSubTab(tab: HTMLElement, content: HTMLElement | null, type: string) {
        const activeClasses = [
            "bg-teal-600",
            "dark:bg-teal-500",
            "text-white",
            "shadow-sm",
        ];
        const inactiveClasses = [
            "text-gray-500",
            "dark:text-gray-400",
            "hover:bg-gray-100",
            "dark:hover:bg-gray-700/50",
            "hover:text-gray-700",
            "dark:hover:text-gray-200",
        ];

        tabs.forEach((t) => {
            t.classList.remove(...activeClasses);
            t.classList.add(...inactiveClasses);
        });
        contents.forEach((c) => c?.classList.add("hidden"));

        if (previewWhatsapp) previewWhatsapp.classList.add("hidden");
        if (previewCorreo) previewCorreo.classList.add("hidden");

        tab.classList.remove(...inactiveClasses);
        tab.classList.add(...activeClasses);
        content?.classList.remove("hidden");

        if (previewScrollModalContainer) {
            type === "popups" ? previewScrollModalContainer.classList.remove("hidden") : previewScrollModalContainer.classList.add("hidden");
        }
        if (previewOverlay) previewOverlay.classList.add("hidden");
        if (previewModesToggle) {
            type === "popups" ? previewModesToggle.classList.remove("hidden") : previewModesToggle.classList.add("hidden");
        }
        if (previewStage) {
            type === "correo" ? previewStage.classList.add("is-gmail") : previewStage.classList.remove("is-gmail");
            type === "popups" && currentMode === "mobile" ? previewStage.classList.add("is-mobile-view") : previewStage.classList.remove("is-mobile-view");
        }

        if (type === "popups") {
            updatePreview({}, currentMode);
        } else if (type === "whatsapp" && previewWhatsapp) {
            previewWhatsapp.classList.remove("hidden");
        } else if (type === "correo" && previewCorreo) {
            previewCorreo.classList.remove("hidden");
        }
    }

    function restoreInicioPreview() {
        if (!savedHomeSettings) return;

        const btnTextInput = document.getElementById("btnText") as HTMLInputElement;
        const btnBgColorInput = document.getElementById("btnBgColor") as HTMLInputElement;
        const btnTextColorInput = document.getElementById("btnTextColor") as HTMLInputElement;
        const waMsgHidden1 = document.getElementById("whatsappMessage") as HTMLInputElement;
        const waMsgHidden2 = document.getElementById("whatsappMessage2") as HTMLInputElement;
        const waMsgHidden3 = document.getElementById("whatsappMessage3") as HTMLInputElement;

        updatePreview({
            popup_image_url: currentInicioImages.popup_image_url,
            popup_image2_url: currentInicioImages.popup_image2_url,
            popup_mobile_image_url: currentInicioImages.popup_mobile_image_url,
            popup_mobile_image2_url: currentInicioImages.popup_mobile_image2_url,
            button_bg_color: btnBgColorInput ? btnBgColorInput.value : (savedHomeSettings.button_bg_color || "#14b8a6"),
            button_text_color: btnTextColorInput ? btnTextColorInput.value : (savedHomeSettings.button_text_color || "#ffffff"),
            button_text: btnTextInput ? btnTextInput.value : (savedHomeSettings.button_text || savedHomeSettings.btnText || "CONOCER MAS"),
        }, currentMode);

        window.dispatchEvent(new CustomEvent("update-whatsapp-preview", {
            detail: {
                text: waMsgHidden1 ? waMsgHidden1.value : (savedHomeSettings.whatsappMessage || ""),
                image: currentInicioImages.whatsappImage
            }
        }));

        window.dispatchEvent(new CustomEvent("update-whatsapp-preview-2", {
            detail: {
                text: waMsgHidden2 ? waMsgHidden2.value : (savedHomeSettings.whatsappMessage2 || ""),
                image: currentInicioImages.whatsappImage2
            }
        }));

        window.dispatchEvent(new CustomEvent("update-whatsapp-preview-3", {
            detail: {
                text: waMsgHidden3 ? waMsgHidden3.value : (savedHomeSettings.whatsappMessage3 || ""),
                image: currentInicioImages.whatsappImage3
            }
        }));

        const emailTitleInput = document.getElementById("emailTitle") as HTMLInputElement;
        const emailBodyHidden = document.getElementById("emailBody") as HTMLInputElement;
        const emailBtnText = document.getElementById("emailBtnText") as HTMLInputElement;
        const emailBtnLink = document.getElementById("emailBtnLink") as HTMLInputElement;
        const emailBtnBg = document.getElementById("emailBtnBgColor") as HTMLInputElement;
        const emailBtnTextCol = document.getElementById("emailBtnTextColor") as HTMLInputElement;

        // Restore based on CURRENTLY SELECTED email index
        const state = emailsState[currentEmailIdx];

        window.dispatchEvent(new CustomEvent("update-email-preview", {
            detail: {
                title: emailTitleInput ? emailTitleInput.value : (state.title || ""),
                body: emailBodyHidden ? emailBodyHidden.value : (state.body || ""),
                image: state.file ? URL.createObjectURL(state.file) : state.imageUrl,
                btnText: emailBtnText ? emailBtnText.value : (state.btnText || "Ver Productos"),
                btnLink: emailBtnLink ? emailBtnLink.value : (state.btnLink || "https://tami.com/productos"),
                btnBgColor: emailBtnBg ? emailBtnBg.value : (state.btnBgColor || "#0b1c3c"),
                btnTextColor: emailBtnTextCol ? emailBtnTextCol.value : (state.btnTextColor || "#ffffff")
            }
        }));
    }

    // Top Level Navigation: Inicio / Producto
    navInicio.addEventListener("click", () => {
        sectionInicio.classList.remove("hidden");
        sectionProducto.classList.add("hidden");

        navInicio.classList.add("bg-teal-600", "text-white", "shadow-md");
        navInicio.classList.remove("bg-gray-100", "dark:bg-gray-700", "text-gray-600", "dark:text-gray-300");

        navProducto.classList.remove("bg-teal-600", "text-white", "shadow-md");
        navProducto.classList.add("bg-gray-100", "dark:bg-gray-700", "text-gray-600", "dark:text-gray-300");

        // Por defecto activar la primera sub-tab de Inicio (Pop-ups)
        activarSubTab(tabPopups, contentPopups, "popups");

        restoreInicioPreview();
    });

    navProducto.addEventListener("click", () => {
        sectionInicio.classList.add("hidden");
        sectionProducto.classList.remove("hidden");

        navProducto.classList.add("bg-teal-600", "text-white", "shadow-md");
        navProducto.classList.remove("bg-gray-100", "dark:bg-gray-700", "text-gray-600", "dark:text-gray-300");

        navInicio.classList.remove("bg-teal-600", "text-white", "shadow-md");
        navInicio.classList.add("bg-gray-100", "dark:bg-gray-700", "text-gray-600", "dark:text-gray-300");

        // Hide previews that are specific to Inicio tabs
        if (previewWhatsapp) previewWhatsapp.classList.add("hidden");
        if (previewCorreo) previewCorreo.classList.add("hidden");
        if (previewScrollModalContainer) previewScrollModalContainer.classList.remove("hidden");
        if (previewModesToggle) previewModesToggle.classList.remove("hidden");
        if (previewStage) previewStage.classList.remove("is-gmail");

        // Clear Preview (Wait for product selection)
        updatePreview({
            popup_image_url: null,
            popup_image2_url: null,
            popup_mobile_image_url: null,
            popup_mobile_image2_url: null,
            button_text: "¡REGISTRARME!",
            button_bg_color: "#14b8a6",
            button_text_color: "#ffffff"
        }, currentMode);

        // Reset Product Selection Tab
        window.dispatchEvent(new CustomEvent("reset-product-selection"));
    });

    tabPopups.onclick = () => activarSubTab(tabPopups, contentPopups, "popups");
    tabWhatsapp.onclick = () => activarSubTab(tabWhatsapp, contentWhatsapp, "whatsapp");
    tabCorreo.onclick = () => activarSubTab(tabCorreo, contentCorreo, "correo");

    // Listen for preview type changes from TabProducto.tsx
    window.addEventListener("switch-preview-type", (e: any) => {
        const type = e.detail;

        if (previewWhatsapp) previewWhatsapp.classList.add("hidden");
        if (previewCorreo) previewCorreo.classList.add("hidden");
        if (previewScrollModalContainer) previewScrollModalContainer.classList.add("hidden");
        if (previewOverlay) previewOverlay.classList.add("hidden");

        if (type === "popups") {
            if (previewScrollModalContainer) previewScrollModalContainer.classList.remove("hidden");
            if (previewModesToggle) previewModesToggle.classList.remove("hidden");
            if (previewStage) {
                previewStage.classList.remove("is-gmail");
                if (currentMode === "mobile") previewStage.classList.add("is-mobile-view");
                else previewStage.classList.remove("is-mobile-view");
            }
        } else if (type === "whatsapp") {
            if (previewWhatsapp) previewWhatsapp.classList.remove("hidden");
            if (previewModesToggle) previewModesToggle.classList.add("hidden");
            if (previewStage) {
                previewStage.classList.remove("is-gmail");
                previewStage.classList.remove("is-mobile-view");
            }
        } else if (type === "correo") {
            if (previewCorreo) previewCorreo.classList.remove("hidden");
            if (previewModesToggle) previewModesToggle.classList.add("hidden");
            if (previewStage) {
                previewStage.classList.add("is-gmail");
                previewStage.classList.remove("is-mobile-view");
            }
        }
    });

    // Inicialización: Empezar en Inicio > Pop-ups
    const activeModeClasses = [
        "bg-white",
        "dark:bg-gray-700",
        "text-teal-600",
        "dark:text-teal-400",
        "shadow-sm",
    ];
    const inactiveModeClasses = [
        "text-gray-500",
        "dark:text-gray-400",
        "hover:text-gray-700",
        "dark:hover:text-gray-200",
    ];

    // Apply initial classes based on mobile screen size
    if (isMobileScreen) {
        btnMobile.classList.remove(...inactiveModeClasses);
        btnMobile.classList.add(...activeModeClasses);
        btnDesktop.classList.remove(...activeModeClasses);
        btnDesktop.classList.add(...inactiveModeClasses);
    } else {
        btnDesktop.classList.remove(...inactiveModeClasses);
        btnDesktop.classList.add(...activeModeClasses);
        btnMobile.classList.remove(...activeModeClasses);
        btnMobile.classList.add(...inactiveModeClasses);
    }

    activarSubTab(tabPopups, contentPopups, "popups");

    btnDesktop.onclick = () => {
        currentMode = "desktop";
        btnDesktop.classList.remove(...inactiveModeClasses);
        btnDesktop.classList.add(...activeModeClasses);
        btnMobile.classList.remove(...activeModeClasses);
        btnMobile.classList.add(...inactiveModeClasses);
        if (previewStage) previewStage.classList.remove("is-mobile-view");
        updatePreview({}, "desktop");
    };

    btnMobile.onclick = () => {
        currentMode = "mobile";
        btnMobile.classList.remove(...inactiveModeClasses);
        btnMobile.classList.add(...activeModeClasses);
        btnDesktop.classList.remove(...activeModeClasses);
        btnDesktop.classList.add(...inactiveModeClasses);
        if (previewStage) previewStage.classList.add("is-mobile-view");
        updatePreview({}, "mobile");
    };

    window.addEventListener("resize", () => {
        const isNowMobile = window.innerWidth < 1024;
        if (isNowMobile && currentMode !== "mobile") {
            // Forzar modo móvil si la pantalla se reduce
            if (btnMobile) btnMobile.click();
        }
    });

    // SYNC INPUTS TO PREVIEW
    const textareaWhatsapp = document.getElementById(
        "whatsappMessage",
    ) as HTMLTextAreaElement;
    function formatWhatsAppTextToHTML(text: string | null) {
        if (!text) return "";
        let html = text;

        // Si el texto ya tiene formato HTML (del nuevo editor), no escapamos los tags
        const hasHTML = /<[a-z][\s\S]*>/i.test(html);

        if (!hasHTML) {
            // Escape basic tags only if it's plain text to prevent injection
            html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        }

        // format whatsapp markdown
        html = html.replace(/\*(.*?)\*/g, "<strong>$1</strong>");
        html = html.replace(/_(.*?)_/g, "<em>$1</em>");
        html = html.replace(/~(.*?)~/g, "<del>$1</del>");
        html = html.replace(/\n/g, "<br>");
        return html;
    }

    textareaWhatsapp?.addEventListener("input", () => {
        if (previewWhatsappText)
            previewWhatsappText.innerHTML = formatWhatsAppTextToHTML(textareaWhatsapp.value);
    });

    const updateMainWhatsappPreview = () => {
        const data = whatsappData[currentSelectedWaMessage as keyof typeof whatsappData];
        if (previewWhatsappText) {
            previewWhatsappText.innerHTML = formatWhatsAppTextToHTML(data.text || "");
        }

        const previewWAImg = document.getElementById("previewWhatsappImageContainer");
        if (data.image) {
            if (previewWAImg) {
                previewWAImg.innerHTML = `<img src="${data.image}" class="w-full h-auto object-contain">`;
                previewWAImg.classList.remove("hidden");
            }
        } else {
            if (previewWAImg) {
                previewWAImg.innerHTML = "";
                previewWAImg.classList.add("hidden");
            }
        }
    });

    const previewCorreoTitle =
        document.getElementById("previewCorreoTitle");
    const previewCorreoBody = document.getElementById("previewCorreoBody");
    emailTitleInput?.addEventListener("input", () => {
        if (previewCorreoTitle)
            previewCorreoTitle.textContent = emailTitleInput.value;
    });


    // Colores del Botón
    const btnTextInput = document.getElementById("btnText") as HTMLInputElement;
    const btnBgColorInput = document.getElementById(
        "btnBgColor",
    ) as HTMLInputElement;
    const btnTextColorInput = document.getElementById(
        "btnTextColor",
    ) as HTMLInputElement;

    if (btnTextInput) {
        const handleBtnTextChange = () => {
            const val = btnTextInput.value;
            updatePreview({ button_text: val });
        };
        btnTextInput.addEventListener("input", handleBtnTextChange);
    }

    if (btnBgColorInput) {
        const handleBgChange = () => {
            const val = btnBgColorInput.value;
            updatePreview({ button_bg_color: val });
        };
        btnBgColorInput.addEventListener("input", handleBgChange);
        btnBgColorInput.addEventListener("change", handleBgChange);
    }

    if (btnTextColorInput) {
        const handleTextChange = () => {
            const val = btnTextColorInput.value;
            updatePreview({ button_text_color: val });
        };
        btnTextColorInput.addEventListener("input", handleTextChange);
        btnTextColorInput.addEventListener("change", handleTextChange);
    }

    if (emailBtnTextInput) {
        const handleEmailBtnTextChange = () => {
            const val = emailBtnTextInput.value;
            if (previewEmailBtn) previewEmailBtn.textContent = val || "Ver Productos";
        };
        emailBtnTextInput.addEventListener("input", handleEmailBtnTextChange);
    }
    if (emailBtnLinkInput) {
        const handleEmailBtnLinkChange = () => {
            const val = emailBtnLinkInput.value;
            if (previewEmailBtn && 'href' in previewEmailBtn) previewEmailBtn.href = val || "#";
        };
        emailBtnLinkInput.addEventListener("input", handleEmailBtnLinkChange);
    }
    if (emailBtnBgColorInput) {
        const handleEmailBtnBgChange = () => {
            const val = emailBtnBgColorInput.value;
            if (previewEmailBtn) previewEmailBtn.style.backgroundColor = val;
        };
        emailBtnBgColorInput.addEventListener("input", handleEmailBtnBgChange);
        emailBtnBgColorInput.addEventListener("change", handleEmailBtnBgChange);
    }
    if (emailBtnTextColorInput) {
        const handleEmailBtnTextColChange = () => {
            const val = emailBtnTextColorInput.value;
            if (previewEmailBtn) previewEmailBtn.style.color = val;
        };
        emailBtnTextColorInput.addEventListener("input", handleEmailBtnTextColChange);
        emailBtnTextColorInput.addEventListener("change", handleEmailBtnTextColChange);
    }


    const popupInicioDelayInput = document.getElementById(
        "popupInicioDelay",
    ) as HTMLSelectElement;
    const popupProductosDelayInput = document.getElementById(
        "popupProductosDelay",
    ) as HTMLSelectElement;
    const emailSendDelayInput = document.getElementById(
        "emailSendDelay",
    ) as HTMLSelectElement;

    const emailSelector = document.getElementById("emailSelector") as HTMLSelectElement;

    function syncUIFromEmailState(idx: string) {
        const state = emailsState[idx];
        if (emailTitleInput) emailTitleInput.value = state.title;
        if (emailBtnTextInput) emailBtnTextInput.value = state.btnText;
        if (emailBtnLinkInput) emailBtnLinkInput.value = state.btnLink;
        if (emailBtnBgColorInput) emailBtnBgColorInput.value = state.btnBgColor;
        if (emailBtnTextColorInput) emailBtnTextColorInput.value = state.btnTextColor;
        if (emailSendDelayInput) emailSendDelayInput.value = state.delay;

        const emailTitleDisplay = document.getElementById("emailTitleDisplay");
        if (emailTitleDisplay) emailTitleDisplay.textContent = `Correo Electrónico #${idx}`;

        // Sync Rich Text Editor
        window.dispatchEvent(new CustomEvent("update-email-editor", { detail: state.body }));

        // Sync Preview
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

        // Trigger manual preview update
        restoreInicioPreview();
    }

    function saveCurrentEmailToState() {
        const state = emailsState[currentEmailIdx];

        const titleInput = document.getElementById("emailTitle") as HTMLInputElement;
        if (titleInput) state.title = titleInput.value || "";

        const bodyInput = document.getElementById("emailBody") as HTMLInputElement;
        if (bodyInput) state.body = bodyInput.value || "";

        const btnTextInput = document.getElementById("emailBtnText") as HTMLInputElement;
        if (btnTextInput) state.btnText = btnTextInput.value || "";

        const btnLinkInput = document.getElementById("emailBtnLink") as HTMLInputElement;
        if (btnLinkInput) state.btnLink = btnLinkInput.value || "";

        const btnBgColorInput = document.getElementById("emailBtnBgColor") as HTMLInputElement;
        if (btnBgColorInput) state.btnBgColor = btnBgColorInput.value || "";

        const btnTextColorInput = document.getElementById("emailBtnTextColor") as HTMLInputElement;
        if (btnTextColorInput) state.btnTextColor = btnTextColorInput.value || "";

        const delayInput = document.getElementById("emailSendDelay") as HTMLSelectElement;
        if (delayInput) state.delay = delayInput.value || "5";

        const delImgInput = document.getElementById("delete_emailImage") as HTMLInputElement;
        if (delImgInput) state.deleteImage = delImgInput.value || "0";
    }

    emailSelector?.addEventListener("change", () => {
        saveCurrentEmailToState();
        currentEmailIdx = emailSelector.value;
        syncUIFromEmailState(currentEmailIdx);
    });

    popupInicioDelayInput?.addEventListener("change", () => {
        const val = popupInicioDelayInput.value;
        updatePreview({
            popup_start_delay_minutes: parseInt(val),
        });
    });

    popupProductosDelayInput?.addEventListener("change", () => {
        const val = popupProductosDelayInput.value;
        updatePreview({
            product_popup_delay_minutes: parseInt(val),
        });
    });

    // IMAGE UPLOADS
    const popupImage1 = document.getElementById(
        "popupImage1",
    ) as HTMLInputElement;
    const popupImage2 = document.getElementById(
        "popupImage2",
    ) as HTMLInputElement;
    const popupImageMobile = document.getElementById(
        "popupImageMobile",
    ) as HTMLInputElement;
    const popupImageMobile2 = document.getElementById(
        "popupImageMobile2",
    ) as HTMLInputElement;
    const whatsappImage = document.getElementById(
        "whatsappImage",
    ) as HTMLInputElement;

    const clearImage1 = document.getElementById("clearImage1");
    const clearImage2 = document.getElementById("clearImage2");
    const clearImageMobile = document.getElementById("clearImageMobile");
    const clearImageMobile2 = document.getElementById("clearImageMobile2");

    function handleImageUpload(
        input: HTMLInputElement,
        callback: (url: string | ArrayBuffer | null | undefined) => void,
    ) {
        if (input && input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => callback(e.target?.result);
            reader.readAsDataURL(input.files[0]);
        }
    }

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
            handleImageUpload(this, (url) => {
                currentInicioImages[previewKey] = url as string;

                // Sync with whatsappData for preview
                if (previewKey === "whatsappImage") whatsappData[1].image = url as string;
                if (previewKey === "whatsappImage2") whatsappData[2].image = url as string;
                if (previewKey === "whatsappImage3") whatsappData[3].image = url as string;

                updateMainWhatsappPreview();
                clearBtn?.classList.remove("hidden");
                if (deleteInput) deleteInput.value = "0";
            });
        });

        clearBtn?.addEventListener("click", () => {
            if (input) input.value = "";
            currentInicioImages[previewKey] = null;

            // Sync with whatsappData for preview
            if (previewKey === "whatsappImage") whatsappData[1].image = null;
            if (previewKey === "whatsappImage2") whatsappData[2].image = null;
            if (previewKey === "whatsappImage3") whatsappData[3].image = null;

            updateMainWhatsappPreview();
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

    emailImage?.addEventListener("change", function () {
        handleImageUpload(this, (url) => {
            const file = this.files?.[0];
            if (file) {
                emailsState[currentEmailIdx].file = file;
                emailsState[currentEmailIdx].deleteImage = "0";
            }

            const previewImg = document.getElementById(
                "previewEmailImageThumb",
            );
            const container = document.getElementById(
                "previewEmailAttachementContainer",
            );
            if (previewImg && container) {
                previewImg.innerHTML = `<img src="${url}" class="max-w-full h-auto object-contain rounded-lg shadow-sm" style="max-height: 400px;">`;
                container.classList.remove("hidden");
            }
            clearEmailImage?.classList.remove("hidden");
        });
    });
    clearEmailImage?.addEventListener("click", () => {
        if (emailImage) emailImage.value = "";
        emailsState[currentEmailIdx].file = null;
        emailsState[currentEmailIdx].imageUrl = null;
        emailsState[currentEmailIdx].deleteImage = "1";

        const previewImg = document.getElementById(
            "previewEmailImageThumb",
        );
        const container = document.getElementById(
            "previewEmailAttachementContainer",
        );
        if (previewImg && container) {
            previewImg.innerHTML = "";
            container.classList.add("hidden");
        }
        if (clearEmailImage) clearEmailImage.classList.add("hidden");
        const del = document.getElementById(
            "delete_emailImage",
        ) as HTMLInputElement;
        if (del) del.value = "1";
    });

    // Event for Email Preview update from EmailEditor.tsx (Rich Text)
    window.addEventListener("update-email-preview", (e: any) => {
        const data = typeof e.detail === "string" ? { body: e.detail } : e.detail;
        const previewCorreoBody = document.getElementById("previewCorreoBody");
        if (previewCorreoBody) {
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

        const previewEmailBtn = document.getElementById("previewEmailBtn") as HTMLAnchorElement | HTMLButtonElement | null;
        if (previewEmailBtn) {
            if (data.btnText !== undefined) previewEmailBtn.textContent = data.btnText || "Ver Productos";
            if (data.btnLink !== undefined && 'href' in previewEmailBtn) previewEmailBtn.href = data.btnLink || "#";
            if (data.btnBgColor !== undefined) previewEmailBtn.style.backgroundColor = data.btnBgColor || "#0b1c3c";
            if (data.btnTextColor !== undefined) previewEmailBtn.style.color = data.btnTextColor || "#ffffff";
        }
    });

    // WhatsApp Image 1 already handled by bindImageEvents above, 
    // but we can add specific preview logic if needed.

    // LOAD SETTINGS FROM API
    async function loadSettings() {
        setStatus("Cargando...", "loading");
        try {
            const settings = (await getPopupSettings()) as any;
            if (settings) {
                savedHomeSettings = settings;
                currentInicioImages.popup_image_url = settings.image1 || settings.popup_image_url || null;
                currentInicioImages.popup_image2_url = settings.image2 || settings.popup_image2_url || null;
                currentInicioImages.popup_mobile_image_url = settings.imageMobile || settings.popup_mobile_image_url || null;
                currentInicioImages.popup_mobile_image2_url = settings.imageMobile2 || settings.popup_mobile_image2_url || null;
                currentInicioImages.whatsappImage = settings.whatsappImage || null;
                currentInicioImages.whatsappImage2 = settings.whatsappImage2 || null;
                currentInicioImages.whatsappImage3 = settings.whatsappImage3 || null;
                currentInicioImages.emailImage = settings.emailImage || null;

                if (btnBgColorInput)
                    btnBgColorInput.value =
                        settings.button_bg_color ||
                        settings.btnBgColor ||
                        "#14b8a6";
                if (btnTextColorInput)
                    btnTextColorInput.value =
                        settings.button_text_color ||
                        settings.btnTextColor ||
                        "#ffffff";

                if (btnTextInput) {
                    const bText = settings.button_text || settings.btnText || "CONOCER MAS";
                    btnTextInput.value = bText;
                }

                // Map all 3 emails from settings
                const mapEmail = (idx: string, suffix: string = "") => {
                    emailsState[idx].title = settings[`emailTitle${suffix}`] || settings[`email_subject${suffix}`] || (idx === "1" ? "Solicitud de información - Popup Web" : "");
                    emailsState[idx].body = settings[`emailBody${suffix}`] || settings[`email_message${suffix}`] || "";
                    emailsState[idx].imageUrl = settings[`emailImage${suffix}`] || settings[`email_image_url${suffix}`] || null;
                    emailsState[idx].btnText = settings[`email_btn_text${suffix}`] || settings[`emailBtnText${suffix}`] || "Ver Productos";
                    emailsState[idx].btnLink = settings[`email_btn_link${suffix}`] || settings[`emailBtnLink${suffix}`] || "https://tami.com/productos";
                    emailsState[idx].btnBgColor = settings[`email_btn_bg_color${suffix}`] || settings[`emailBtnBgColor${suffix}`] || "#0b1c3c";
                    emailsState[idx].btnTextColor = settings[`email_btn_text_color${suffix}`] || settings[`emailBtnTextColor${suffix}`] || "#ffffff";
                    emailsState[idx].delay = String(settings[`email_send_delay_minutes${suffix}`] || settings[`emailSendDelay${suffix}`] || 5);
                };

                mapEmail("1", "");
                mapEmail("2", "_2");
                mapEmail("3", "_3");

                // Initialize UI with Email 1
                currentEmailIdx = "1";
                if (emailSelector) emailSelector.value = "1";
                syncUIFromEmailState("1");

                const restoreImg = (url: string | null, key: string, clearId: string) => {
                    if (url) {
                        updatePreview({ [key]: url });
                        document.getElementById(clearId)?.classList.remove("hidden");
                    }
                };

                restoreImg(settings.image1, "popup_image_url", "clearImage1");
                restoreImg(settings.image2, "popup_image2_url", "clearImage2");
                restoreImg(settings.imageMobile, "popup_mobile_image_url", "clearImageMobile");
                restoreImg(settings.imageMobile2, "popup_mobile_image2_url", "clearImageMobile2");

                updatePreview({
                    button_bg_color: settings.button_bg_color,
                    button_text_color: settings.button_text_color,
                    button_text: settings.button_text || "CONOCER MAS",
                    popup_start_delay_minutes: settings.popup_start_delay_minutes,
                    product_popup_delay_minutes: settings.product_popup_delay_minutes,
                });
            }

            setStatus("Configuración cargada.", "idle");
        } catch (err) {
            console.error(err);
            setStatus("Error al cargar configuración.", "error");
        }
    }

    loadSettings();

    // SAVE SETTINGS
    const btnGuardarPopups = document.getElementById(
        "btnGuardarPopups",
    ) as HTMLButtonElement | null;
    btnGuardarPopups?.addEventListener("click", async () => {
        if (!btnGuardarPopups) return;
        const originalText = btnGuardarPopups.innerText;
        btnGuardarPopups.innerText = "Guardando...";
        btnGuardarPopups.disabled = true;
        setStatus("Guardando cambios...", "loading");

        try {
            // If we are on the Product tab, trigger the product-specific save logic
            if (sectionProducto && !sectionProducto.classList.contains("hidden")) {
                window.dispatchEvent(new CustomEvent("request-save-product-popup"));
            }

            const bgColor = btnBgColorInput?.value || "#14b8a6";
            const textColor = btnTextColorInput?.value || "#ffffff";
            const delay = parseInt(popupInicioDelayInput?.value || "60");
            const productDelay = parseInt(
                popupProductosDelayInput?.value || "60",
            );

            if (!isHexColor(bgColor) || !isHexColor(textColor)) {
                throw new Error("Colores no válidos.");
            }

            const formData = new FormData();
            formData.append("button_bg_color", bgColor);
            formData.append("button_text_color", textColor);
            if (btnTextInput) {
                formData.append("button_text", btnTextInput.value);
            }
            formData.append("popup_start_delay_minutes", delay.toString());

            if (popupProductosDelayInput)
                formData.append(
                    "product_popup_delay_minutes",
                    popupProductosDelayInput.value,
                );

            const whatsappMessage = document.getElementById("whatsappMessage") as HTMLInputElement;
            const whatsappMessage2 = document.getElementById("whatsappMessage2") as HTMLInputElement;
            const whatsappMessage3 = document.getElementById("whatsappMessage3") as HTMLInputElement;

            if (whatsappMessage) formData.append("whatsappMessage", whatsappMessage.value);
            if (whatsappMessage2) formData.append("whatsappMessage2", whatsappMessage2.value);
            if (whatsappMessage3) formData.append("whatsappMessage3", whatsappMessage3.value);

            const whatsappTime1 = document.getElementById("whatsappTime1") as HTMLInputElement;
            const whatsappTime2 = document.getElementById("whatsappTime2") as HTMLInputElement;
            const whatsappTime3 = document.getElementById("whatsappTime3") as HTMLInputElement;

            if (whatsappTime1) formData.append("whatsappTime1", whatsappTime1.value || "0");
            if (whatsappTime2) formData.append("whatsappTime2", whatsappTime2.value || "0");
            if (whatsappTime3) formData.append("whatsappTime3", whatsappTime3.value || "0");

            formData.append("whatsapp_enabled", "1");
            formData.append("email_enabled", "1");

            // Save all 3 emails
            saveCurrentEmailToState();

            const appendEmailToFormData = (idx: string, suffix: string = "") => {
                const state = emailsState[idx];
                formData.append(`emailTitle${suffix}`, state.title);
                formData.append(`emailBody${suffix}`, state.body);
                formData.append(`email_btn_text${suffix}`, state.btnText);
                formData.append(`email_btn_link${suffix}`, state.btnLink);
                formData.append(`email_btn_bg_color${suffix}`, state.btnBgColor);
                formData.append(`email_btn_text_color${suffix}`, state.btnTextColor);
                formData.append(`email_send_delay_minutes${suffix}`, state.delay);

                if (state.file) {
                    formData.append(`emailImage${suffix}`, state.file);
                } else if (state.deleteImage === "1") {
                    formData.append(`delete_emailImage${suffix}`, "1");
                }
            };

            appendEmailToFormData("1", "");
            appendEmailToFormData("2", "_2");
            appendEmailToFormData("3", "_3");

            const addFile = (id: string, name: string) => {
                const input = document.getElementById(
                    id,
                ) as HTMLInputElement;
                if (input && input.files && input.files.length > 0) {
                    formData.append(name, input.files[0]);
                } else {
                    const deleteInput = document.getElementById(
                        "delete_" + id,
                    ) as HTMLInputElement;
                    if (deleteInput && deleteInput.value === "1") {
                        formData.append("delete_" + name, "1");
                    }
                }
            };

            addFile("popupImage1", "image1");
            addFile("popupImage2", "image2");
            addFile("popupImageMobile", "imageMobile");
            addFile("popupImageMobile2", "imageMobile2");
            addFile("whatsappImage", "whatsappImage");
            // emailImage is handled per-email in appendEmailToFormData

            await updatePopupSettingsFormData(formData);

            setStatus("¡Guardado exitosamente!", "success");
            await Swal.fire({
                icon: "success",
                title: "Configuración guardada",
                showConfirmButton: false,
                timer: 1500,
            });
            setTimeout(() => {
                setStatus("");
            }, 3000);
        } catch (error: any) {
            console.error(error);
            const errMessage =
                error instanceof Error ? error.message : String(error);
            setStatus("Error al guardar: " + errMessage, "error");
            await Swal.fire({
                icon: "error",
                title: "Error",
                text: `❌ ${errMessage}`,
            });
        } finally {
            btnGuardarPopups.innerText = originalText;
            btnGuardarPopups.disabled = false;
        }
    });

}
