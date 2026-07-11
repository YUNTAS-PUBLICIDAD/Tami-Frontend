import { currentInicioImages, whatsappData, emailsState, sharedState } from "./popupsState";
import initWhatsapp from "./popupsWhatsapp";
import initEmail from "./popupsEmail";
import initImages, { addFileToForm } from "./popupsImages";
import initSettings from "./popupsSettings";

let popupManagerInitialized = false;

export function initPopupManager() {
    if (popupManagerInitialized) return;
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

    // shared state is imported from popupsState

    const isMobileScreen = window.innerWidth < 1024;
    let currentMode = isMobileScreen ? "mobile" : "desktop";
    sharedState.currentMode = currentMode;

    const sharedSaveFooter = document.getElementById("sharedSaveFooter");

    


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
        (window as any).__popupPreviewSettings = {
            ...(window as any).__popupPreviewSettings,
            settings: {
                ...((window as any).__popupPreviewSettings?.settings || {}),
                ...settings,
            },
            mode: mode ?? (window as any).__popupPreviewSettings?.mode ?? null,
        };

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
            (window as any).popupsWhatsapp?.syncWhatsAppPreview?.(sharedState.currentSelectedWaMessage || "1");
        } else if (type === "correo" && previewCorreo) {
            previewCorreo.classList.remove("hidden");
        }
    }

    function restoreInicioPreview() {
        if (!sharedState.savedHomeSettings) return;

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
            popup_mobile_image_count: 2,
            button_bg_color: btnBgColorInput ? btnBgColorInput.value : (sharedState.savedHomeSettings.button_bg_color || "#14b8a6"),
            button_text_color: btnTextColorInput ? btnTextColorInput.value : (sharedState.savedHomeSettings.button_text_color || "#ffffff"),
            button_text: btnTextInput ? btnTextInput.value : (sharedState.savedHomeSettings.button_text || sharedState.savedHomeSettings.btnText || "CONOCER MAS"),
        }, currentMode);

        whatsappData["1"] = {
            text: waMsgHidden1 ? waMsgHidden1.value : (sharedState.savedHomeSettings.whatsappMessage || ""),
            image: currentInicioImages.whatsappImage,
        };
        whatsappData["2"] = {
            text: waMsgHidden2 ? waMsgHidden2.value : (sharedState.savedHomeSettings.whatsappMessage2 || ""),
            image: currentInicioImages.whatsappImage2,
        };
        whatsappData["3"] = {
            text: waMsgHidden3 ? waMsgHidden3.value : (sharedState.savedHomeSettings.whatsappMessage3 || ""),
            image: currentInicioImages.whatsappImage3,
        };

        // call whatsapp sync if available
        (window as any).popupsWhatsapp?.syncWhatsAppPreview?.(sharedState.currentSelectedWaMessage);

        const emailTitleInput = document.getElementById("emailTitle") as HTMLInputElement;
        const emailBodyHidden = document.getElementById("emailBody") as HTMLInputElement;
        const emailBtnText = document.getElementById("emailBtnText") as HTMLInputElement;
        const emailBtnLink = document.getElementById("emailBtnLink") as HTMLInputElement;
        const emailBtnBg = document.getElementById("emailBtnBgColor") as HTMLInputElement;
        const emailBtnTextCol = document.getElementById("emailBtnTextColor") as HTMLInputElement;

        // Restore based on CURRENTLY SELECTED email index
        const state = emailsState[sharedState.currentEmailIdx];

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

    window.addEventListener("restore-inicio-preview", () => restoreInicioPreview());

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
        (window as any).popupsWhatsapp?.setActiveWhatsappMessage?.("1");

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
        // Bloquear actualizaciones si estamos en la pestaña de Inicio para evitar bugs de sincronización
        if (sectionProducto?.classList.contains("hidden")) return;

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

    // Sync automático del modo preview
    window.addEventListener("update-popup-preview", (e: any) => {
        const mode = e.detail?.mode;

        if (!mode || mode === currentMode) return;

        currentMode = mode;

        if (mode === "mobile") {
            btnMobile.classList.remove(...inactiveModeClasses);
            btnMobile.classList.add(...activeModeClasses);

            btnDesktop.classList.remove(...activeModeClasses);
            btnDesktop.classList.add(...inactiveModeClasses);

            if (previewStage) {
                previewStage.classList.add("is-mobile-view");
            }
        }

        if (mode === "desktop") {
            btnDesktop.classList.remove(...inactiveModeClasses);
            btnDesktop.classList.add(...activeModeClasses);

            btnMobile.classList.remove(...activeModeClasses);
            btnMobile.classList.add(...inactiveModeClasses);

            if (previewStage) {
                previewStage.classList.remove("is-mobile-view");
            }
        }
    });

    window.addEventListener("resize", () => {
        const isNowMobile = window.innerWidth < 1024;
        if (isNowMobile && currentMode !== "mobile") {
            // Forzar modo móvil si la pantalla se reduce
            if (btnMobile) btnMobile.click();
        }
    });

    // WhatsApp logic initialized in popupsWhatsapp module

    const previewCorreoTitle = document.getElementById("previewCorreoTitle");
    const previewCorreoBody = document.getElementById("previewCorreoBody");


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

    const emailTitleInput = document.getElementById("emailTitle") as HTMLInputElement | null;
    const emailBtnTextInput = document.getElementById("emailBtnText") as HTMLInputElement | null;
    const emailBtnLinkInput = document.getElementById("emailBtnLink") as HTMLInputElement | null;
    const emailBtnBgColorInput = document.getElementById("emailBtnBgColor") as HTMLInputElement | null;
    const emailBtnTextColorInput = document.getElementById("emailBtnTextColor") as HTMLInputElement | null;
    const previewEmailBtn = document.getElementById("previewEmailBtn") as HTMLAnchorElement | HTMLButtonElement | null;

    if (emailTitleInput) {
        const handleEmailTitleChange = () => {
            const val = emailTitleInput.value;
            window.dispatchEvent(new CustomEvent("update-email-preview", { detail: { title: val || "" } }));
        };
        emailTitleInput.addEventListener("input", handleEmailTitleChange);
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

    // Product-specific email preview listeners
    const handleProductEmailPreview = (e: any) => {
        // If the event includes a `source`, ensure it's from product; otherwise
        // allow (backwards compatibility) but prefer explicit product-origin.
        const rawDetail = e?.detail;
        if (rawDetail && typeof rawDetail === 'object' && rawDetail.source && rawDetail.source !== 'product') return;

        // Only react if we're in the Producto section (avoid overriding Inicio previews)
        if (!sectionProducto || sectionProducto.classList.contains("hidden")) return;

        const data = typeof rawDetail === "string" ? { body: rawDetail } : (rawDetail || {});

        // Update body only when explicitly provided
        if (Object.prototype.hasOwnProperty.call(data, "body") && previewCorreoBody) {
            previewCorreoBody.innerHTML = data.body || "";
        }

        if (data.title !== undefined && previewCorreoTitle) {
            previewCorreoTitle.textContent = data.title;
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
    };

    window.addEventListener("update-email-preview-1", handleProductEmailPreview);
    window.addEventListener("update-email-preview-2", handleProductEmailPreview);
    window.addEventListener("update-email-preview-3", handleProductEmailPreview);


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
        const emailTitleInput = document.getElementById("emailTitle") as HTMLInputElement | null;
        const clearEmailImage = document.getElementById("clearEmailImage") as HTMLElement | null;

        if (emailTitleInput) emailTitleInput.value = state.title;
        if (emailBtnTextInput) emailBtnTextInput.value = state.btnText;
        if (emailBtnLinkInput) emailBtnLinkInput.value = state.btnLink;
        if (emailBtnBgColorInput) emailBtnBgColorInput.value = state.btnBgColor;
        if (emailBtnTextColorInput) emailBtnTextColorInput.value = state.btnTextColor;
        if (emailSendDelayInput) emailSendDelayInput.value = state.delay;

        window.dispatchEvent(new CustomEvent("timepicker-sync", {
            detail: { id: "emailSendDelay", value: Number(state.delay) || 0 },
        }));

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

    // Email state management initialized in popupsEmail module

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

    // initialize extracted modules
    initImages(updatePreview);
    initEmail();
    initWhatsapp();

    // WhatsApp Image 1 already handled by bindImageEvents above, 
    // but we can add specific preview logic if needed.

    // LOAD SETTINGS FROM API
    // initialize settings loader + save handler in separate module
    initSettings(updatePreview, setStatus);

    popupManagerInitialized = true;

}
